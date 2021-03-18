---
title: Notes on RabbitMQ with Spring Boot 
date: "2021-03-17T20:44:17.284Z"
english: true
---

## Context

Suppose our application organizes asynchronous domain logic inside `DomainEventListener`’s. This post shows how to integrate these listeners with Spring AMQP by taking advantage of Spring's infrastructure. Besides, several important topics on using messaging middleware are briefly discussed along the way.

```kotlin
interface DomainEventListener {
  val topic: String
  fun handle(event: DomainEvent)
}

@Component
class UserRegistered: DomainEventListener {
  override val topic = "user:registered"
  
  // How deserialization is performed is left out 
  // as irrelevant implementation detail.
  
  override fun handle(event: DomainEvent) {
    // perform business logic
  }
}
```

## Up and running

```java
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The web management UI is available at [http://localhost:15672](http://localhost:15672). The default username and
password are both `guest`.

[Messaging with RabbitMQ](https://spring.io/guides/gs/messaging-rabbitmq/) is a very basic Hello World example for
Spring Boot integration. 

To use it in a more production-ready setting, it's mandatory to refer to
the [Spring AMQP reference documentation](https://docs.spring.io/spring-amqp/docs/current/reference/html).

## AMQP

AMQP (Advanced Message Queuing Protocol) is an application layer protocol for messaging middleware. RabbitMQ primarily
supports the AMQP 0-9-1 model. It mainly revolves around the following three *AMQP entities*.

### Exchange, queue and binding

Messages are published to an *exchange* and consumed from a *queue*. A queue can subscribe to exchanges by using *
bindings*. When a message arrives at an exchange, it will be routed to different queues based on:

- the routing key in the message, and
- the type of the addressed exchange.

### Routing

The four basic types of exchange are:

- Direct exchange
- Fanout exchange
- Topic exchange
- Headers exchange

In this way, the publisher and subscriber are further decoupled from each other, and can be adapted to different
workflows flexibly. The routing mechanism may look overwhelming at first sight, so we are sticking with the simplest
Direct Exchange for the time being. In this case, the message will be routed to subscribing queues with the same routing
key.

### Declarative configuration with Spring AMQP

With Spring AMQP, we can configure the required AMQP entities in the message broker by registering them as beans in the
application context. At runtime, Spring AMQP will issue requests to the broker and create them.

I like this declarative approach. In some way, it's like Kubernetes without the nasty YAML configurations.

```kotlin
@Configuration
class RabbitMqConfig {
  @Bean
  fun domainEventExchange() = 
    DirectExchange("domain_events")

  @Bean
  fun queues(listeners: List<DomainEventListener>) = 
    Declarables( // highlight-line
      listeners.map {
        QueueBuilder
          .durable(it::class.simpleName) // highlight-line
          .build()
      }
    )

  @Bean
  fun bindings(listeners: List<DomainEventListener>) = 
    Declarables(
      queues.zip(listeners) { queue, listener ->
        BindingBuilder
          .bind(queue)
          .to(domainEventExchange())
          .with(listener.topic)
      }
    )
}
```

In this code snippet, we first declare the application-wide `domainEventExchange`. Then, we loop over the `DomainEventListener`s present in the application context and create the necessary queues and bindings.

Note that:

1. We can declare multiple AMQP entities in a `Declarables`. They don't need to be the same type.
2. `durable` means the created entity will survive broker restart.

## `MessageListenerContainer`

So far we only declared desired entities in the broker, but haven't yet wired up our `DomainEventListener`’s to consume
messages from it and perform business logic. To do so, we need to wrap our event handlers
inside `MessageListenerContainer`’s.

A `MessageListenerContainer` represents *active* or *hot* component. It handles connection to the message broker and
provides methods for starting and stopping as a lifecycle component. When connection is
broken, `SimpleMessageListenerConainer` will try to restart the listener.

To programmatically register our domain listeners, we can use the `RabbitListenerEndpointRegistrar` like this:

```kotlin
@Configuration
@EnableRabbit
class ContainerRegistrar(
  val listeners: List<DomainEventListener>,
  val containerFactory: SimpleRabbitListenerContainerFactory
): RabbitListenerConfigurer {

  override fun configureRabbitListeners(
    registrar: RabbitListenerEndpointRegistrar
  ) {
    registrar.setContainerFactory(containerFactory)
    listeners.forEach { listener ->
      val endpoint = SimpleRabbitListenerEndpoint().apply {
        id = listener::class.simpleName!!
        setQueueNames(listener::class.simpleName)
        setMessageListener { message ->
          listener.handle(message.toDomainEvent())
        }
      }
      registrar.registerEndpoint(endpoint)
    }
  }
}

```

Check out more details at: 
- [Spring AMQP Reference: Containers](https://docs.spring.io/spring-amqp/docs/current/reference/html/#container)
- [Spring AMQP Reference: Programmatic Endpoint Registration](https://docs.spring.io/spring-amqp/docs/current/reference/html/#async-annotation-driven-registration)

## Messages are ephemeral

It's important to realize that in the AMQP model, the message broker just acts as a postman between sender and receiver. It
holds on to the messages only temporarily. On successful delivery to all consumers, usually the message is no longer
available from the broker.

In contrast, Redis Stream and Kafka are more like databases.

Some repercussions:

- It's easy to lose messages if something is misconfigured. For example, a message published to an exchange with no
  bound queues will be dropped. Conceptually, it seems only queues in AMQP has a *memory*.
- No first-class support for doing CRUD on messages. For example, the web UI does not have a list screen to page through the messages. It's possible to retrieve a few ones in the queue detail page, but it has a warning that says "getting
  messages from a queue is a destructive action." Although not necessarily always "destructive", the action will probably cause side effect on the message.
- Spring AMQP shares this kind of mindset. For example, it is important to configure a `MessageRecoverer` in
  a `RetryInterceptor`. By default, Spring AMQP will drop the message after retrying for configured times and issue a warning.

## Resilience

### Acknowledgement

Message consumers can fail at any time (due to business exception, dropped connection, application crash, etc). To
prevent losing messages in this way, message brokers use acknowledgements: a message is removed from the broker only
after the client acknowledges that it has processed it.

[[tip | 💡]]
| In Laravel, when a job is taken from the queue, it's placed at `myqueue:reserved` key at the same time. These two steps form an atomic operation with Lua scripting.

### Dead letter exchange

[[tip | 💡]]
| Laravel's [failed jobs](https://laravel.com/docs/8.x/queues#dealing-with-failed-jobs) table is the same concept.

Suppose there is a mal-formed message. In our Spring application, if our message handlers throw an exception, by
default, the message will be requeued and delivered again, resulting in an infinite loop. A viable approach would be
sending the bad message to other places for inspection after a few retries.

RabbitMQ can handle this situation by using [dead letter exchanges](https://www.rabbitmq.com/dlx.html). When our
consumer negatively acknowledges a message, the queue will "dead-letter" the message (annotate with some information
about the failure) and route it to the configured dead letter exchange. This configuration can be applied globally in
the broker with a policy, or specified when creating a queue.

```bash
rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"my-dlx"}' --apply-to queues
```

You can also apply a policy in the RabbitMQ web UI under the "admin" tag.

Note that the dead letter exchange is just a regular exchange. If you specify a non-existent exchange, RabbitMQ does not
create it automatically. This is the type of misconfiguration that can cause lost messages.

Configuration in Spring:

```kotlin
@Bean
fun deadLetterExchange() = DirectExchange("dlx")

@Bean
fun deadLetterQueues(
  listeners: List<DomainEventListener>
) = Declarables(
  val name = it::class.simpleName
  listeners.flatMap { // highlight-line
    val deadLetterQueue = QueueBuilder.durable("$name.dlq").build()
    val deadLetterBinding = BindingBuilder.bind(deadLetterQueue)
      .to(deadLetterExchange())
      .with(it.topic)

    listOf(deadLetterQueue, deadLetterBinding) // highlight-line
  }
)
```

We create a dead letter queue, and it's binding to the configured `deadLetterExchange` for each listener. By properly
configuring listening queues and bindings, we ensure dead letters don't get lost.

Also, we need to update our `queues()` code to configure the queues' dead letter exchange.

```kotlin
@Bean
fun deadLetterExchange() = DirectExchange("dlx")

@Bean
fun queues(listeners: List<DomainEventListener>) = Declarables(
  listeners.map {
    QueueBuilder.durable(it::class.simpleName)
      .withDeadLetterExchange(deadLetterExchange()) // highlight-line
      .build()
  }
)

private fun QueueBuilder.withDeadLetterExchange(exchange: Exchange): QueueBuilder =
  withArgument("x-dead-letter-exchange", exchange.name) // highlight-line
```

### Retry

```kotlin
@Bean
fun retryInterceptor() = RetryInterceptorBuilder()
  .stateless()
  .maxAttemtps(2)
  .backOffOptions(1000, 2.0, 10_000)
  .recoverer(RejectAndDontRequeueRecoverer())
  .build()
```

## References

Manning RabbitMQ in Depth