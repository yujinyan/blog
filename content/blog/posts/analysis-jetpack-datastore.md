---
title: "Analysis of Jetpack DataStore"
date: "2021-03-09T17:09:03.284Z"
---

## Introduction

Recently a friend helped migrate Android's SharedPreferences to Tencent's MMKV for their app at work. He also compared how these persistence libraries perform in terms of reads and writes, including SharedPreferences, MMKV, Jetpack DataStore, and SQLite.

MMKV uses `mmap`, a Unix system call that maps files into memory. Since most heavy lifting is handed off to the operating system, and the library is just reading/writing memory, it comes as no surprise that MMKV appears to perform the best among the four.

Jetpack DataStore, currently in alpha, is Android team's latest remedy for drawbacks of SharedPreferences. Google currently [advocates](https://android-developers.googleblog.com/2020/09/prefer-storing-data-with-jetpack.html) that Android developers prefer storing simple data with DataStore in place of SharedPreferences.

[[tip | ☕]]
| DataStore provides an artifact without Android dependency, making it a viable simple file-based persistence mechanism for the JVM. This post also has little to do with Android.

DataStore and SharedPreferences work similarly in that they both keep an in-memory cache of the key-value pairs and write out all the data on commit. DataStore mainly improves upon the API design. In particular, it leverages Kotlin's suspend functions to highlight the potentially long-running nature of IO operations. Developers can safely call these functions on the main thread and forget about ANRs that haunt SharedPreferences. DataStore also uses Protocol Buffers, a more efficient binary encoding format than SharedPreferences' XML.

Despite its potential efficiency due to Protocol Buffers, we are surprised to find that DataStore performs noticeably worse than SharedPreferences. My friend published his results in this [blog post](https://juejin.cn/post/6931912030144167950). I also played with the problem a bit and can report similar results.


## Atomicity guarantee

After some study, I believe DataStore's relatively slow performance is due to its atomicity guarantee. Unfortunately, a lot of articles fail to highlight this important feature that DataStore provides.

Its documentation reads:

> DataStore provides ACID guarantees ... Updates the data transactionally in an atomic read-modify-write operation. All operations are serialized ...

A classic example in point is incrementing a counter concurrently.

```kotlin
suspend fun main()  {
  var counter = 0
  coroutineScope {
    repeat(10_000) {
      launch { counter++ }
    }
  }
  println("counter: $counter")
}
```

It is unlikely to print 10000 in the end. This concurrency anomaly is called *lost update*. Note that on the JVM, the `++` operator is actually two separate operations. What happens is that some later write **clobbers** the earlier write, since the counter state is shared and mutated in multiple concurrent coroutines. Lost update often occurs when the application does a read-modify-write cycle to shared mutable states.

This particular counter issue can be solved on the JVM using an `AtomicInteger`. Kotlin has [nice documentation](https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html) on how to solve the more general cases where no off-the-shelf atomic data structures are available.

If you implement this simple counter naively with SharedPreferences or other persistence mechanisms without atomicity guarantee, it won't work correctly. When we say SharedPreferences is thread-safe, it only means that the class has proper internal synchronization to prevent data structure corruption when its methods are called concurrently. It does not necessarily protect against *lost update* anomaly, which is about multiple operations that should be treated as a single unit.

[This question](https://github.com/Kotlin/kotlinx.coroutines/issues/87#issuecomment-634697788) also shows similar confusion. The following two snippets implements a counter using an actor and a StateFlow. Can you spot the difference between the two?

```kotlin
fun CoroutineScope.counterActor() = actor<CounterMsg> {
  var counter = 0 // actor state
  for (msg in channel) { // iterate over incoming messages
    when (msg) {
      is IncCounter -> counter++
      is GetCounter -> msg.response.complete(counter)
    }
  }
}
```

```kotlin
class CounterModel {
  private val _counter = MutableStateFlow(0)
  val counter: StateFlow<Int> get() = _counter
  fun inc() {
      _counter.value++
  }
}
```
The StateFlow version is not thread-safe. Although StateFlow's methods are safe to call concurrently, it does not provide atomicity guarantee for the read-and-increment operation.

I wrote a demo app that demonstrates that DataStore increments the counter correctly while SharedPreferences does not.

## Actor-based concurrency control

[[tip | 🚧]]
| This analysis is based on Jetpack DataStore 1.0.0-alpha07. Its API and implementation are subject to significant change.

In its implementation, DataStore provides atomicity guarantee by using actors, as described in the aforementioned Kotlin documentation. Conceptually, an actor is a worker that receives messages from a mailbox. States like counter values are encapsulated inside the actor, thus eliminating shared mutable states.

It's customary to use Kotlin's sealed class to represent messages the actor is able to process. DataStore's actor receives something like this:

```kotlin
private sealed class Message {
  class Read(
    val key: String, 
    val ack: CompletableDeferred<String?>
  ) : Message()

  class Write(
    val key: String, 
    val value: String, 
    val ack: CompletableDeferred<Unit>
  ) : Message()
}
```

Kotlinx.coroutines library provides a `CoroutineScope.actor()`  coroutine builder. It launches an actor into the coroutine scope and returns a `SendChannel` that works as the actor's mailbox. Inside the actor, we can access its mailbox via `channel` property and loop over the available messages one by one. In this way, both read and write access to the state are serialized, preventing all sorts of concurrency issues.

Here is an oversimplified example that illustrates this actor model.

```kotlin
class SimpleDataStore(coroutineScope: CoroutineScope) {

  @OptIn(ObsoleteCoroutinesApi::class)
  private val actor = coroutineScope.actor<Message> { // this: ActorScope<Message>
    // state encapsulated inside the actor
    val cache = mutableMapOf<String, String>() // highlight-line

    // looping over messages one by one
🏹 for (msg in channel) { // highlight-line
      when (msg) {
        is Message.Read -> msg.ack.complete(cache[msg.key])
        is Message.Write -> {
          cache[msg.key] = msg.value;
          msg.ack.complete(Unit)
        }
      }
    }
  }

  suspend fun read(key: String): String? {
    val ack = CompletableDeferred<String?>()
    🏹 actor.send(Message.Read(key, ack))
    return 🏹 ack.await()
  }

  suspend fun write(key: String, value: String) {
    val ack = CompletableDeferred<Unit>()
    🏹 actor.send(Message.Write(key, value, ack))
    return 🏹 ack.await()
  }
}
```

Note that in this example, both read and write methods are modeled as suspend functions. This is necessary because readers and writers should block each other. If either a read or write operation is in process, other concurrent operations must wait until their request gets processed by the actor. The actor notifies the caller through `CompletableDeffered` after processing their messages.

In effect, Kotlin's actor uses a channel under the hood to synchronize access to its state. Channel is a synchronization primitive and synchronization comes at a cost. I did a cursory experiment that measures the overhead of using actors.

```kotlin
val testSeq = (1..1000).asSequence()

object ActorOverheadDemo {
  @ObsoleteCoroutinesApi
  suspend fun useActor() = 🏹 coroutineScope {
    val actor = actor<Int> {
      val map = mutableSetOf<Int>()
🏹    for (i in channel) map.add(i)
    }
    testSeq.forEach { 🏹 actor.send(it) }
    actor.close()
  }

  suspend fun baseline() {
    val map = mutableSetOf<Int>()
    testSeq.forEach { map.add(it); 🏹 yield() }
  }
}

@ObsoleteCoroutinesApi
@ExperimentalTime
fun main() = runBlocking {
  measureTime { 🏹 ActorOverheadDemo.baseline() }.also { println(it) }
  measureTime { 🏹 ActorOverheadDemo.useActor() }.also { println(it) }
  Unit
}
```

On my computer, the baseline took about 8.89ms while the actor variation 33.1ms. This leads me to believe that the atomicity guarantee is the main contributor to DataStore's relatively slow performance.

## Interesting API design

### Ensure one active `CoroutineScope` per file

As previous discussions suggest, DataStore depends on the fact that there is only one actor processing state changes. Before DataStore version 1.0.0-alpha07, we used the `createDataStore` extension function to get an instance of DataStore. The library warned us in API doc that we must make a DataStore instance singleton or we break all its functionality.

```kotlin
fun Context.createDataStore(name: String): DataStore<Preferences>
```

Mere docs and comments probably won't stop developers from making this error. Version 1.0.0-alpha07 came up with an interesting API change. The `createDataStore` function was removed and replaced with a property delegate. This is how we currently get a `DataStore` instance.

```kotlin
val Context.myDataStore by preferencesDataStore("my_store")
```

Note that we can only use property delegates in a file as top-level declarations or in a class. This means it's impossible to use this helper in a loop or a function. Since we can still create multiple class instances, the correct way is to put these declarations in a file. Such API enforces developers to statically declare the DataStore they want to use in their project. It makes accidentally creating multiple DataStore instances on the same file much harder.

But this method is not completely bullet-proof. Besides declaring the DataStores in a class, developers could mistakenly reuse the same file name. In this version, DataStore also checks this presumption and fails fast at run time.

See [release notes](https://developer.android.com/jetpack/androidx/releases/datastore#1.0.0-alpha07) on the Android Developers website.

### Read from the `data`  flow

You may be surprised to find that DataStore does not currently have any method to read specific keys directly like SharedPreferences' `getString`. It only exposes a flow through the `data` property and an `updateData` method.

```kotlin
public interface DataStore<T> { 
  public val data: Flow<T> // highlight-line

  public suspend fun updateData(
    transform: suspend (t: T) -> T): T
  )
}
```

In order to read from the DataStore, we need to collect the `data` flow. This is like having a free event bus for our preferences store. For example, suppose we persist user's selected city in the store and we need to update main content after user makes a change. We could filter and collect this data flow directly.

```kotlin
class MainContentActivity : Context {
  val selectedCity: Flow<String> = myDataStore.data
		.distinctUntilChanged { old, new ->
		   old[cityKey] == new[cityKey]
		}
}
```

Often, we only care about the current value in the store. When I first saw this API, I wondered if DataStore would expose a `StateFlow` instead of a regular one, since with `StateFlow` we can easily access the latest snapshot from `StateFlow.value` property. I also tried to convert the DataStore's `data` flow in a `StateFlow` like this.

```kotlin
class WrappedDataStore(private val ds: DataStore<Preferences>) : CoroutineScope {
    private val scopeJob = Job()
    override val coroutineContext: CoroutineContext = scopeJob
    private val deferredData = async {
        // important: must `stateIn` a separate coroutine
        ds.data.stateIn(this + Job(parent = scopeJob)) // highlight-line
    }

    suspend fun data(): StateFlow<Preferences> = deferredData.await()
}
```

However, this kind of usage breaks the atomicity guarantee. Its API doc specifically warns us about this caveat.

> Do not layer a cache on top of this API: it will be impossible to guarantee consistency. Instead, use `data.first()` to access a single snapshot.

In my demo counter app, I also included a DataStore variant that reads from a cached state.

```kotlin
val cached = WrappedDataStore(dataStore)

suspend fun increment(key: String) {
  dataStore.edit {
    it[intPreferenceKey(key)] = 
      (cached.data().value[intPreferencesKey(key)] ?: 0 + 1)
  }
}

repeat(100) {
  launch { increment(TEST_KEY) }
}
```

This counter doesn't work either. The 100 coroutines all read the default value 0 and update the key to 1 over and over again. `StateFlow` always has a value, so reading from it returns immediately. This means reads from this snapshot won't go through the actor, bypassing the atomicity guarantee. In contrast, `Flow.first()` is a suspend method. This method suspends so that the `Read` message  can be properly queued up and processed serially by the actor.

Note that inside the `DataStore` edit block, we can also read data from the `Preferences` lambda parameter directly. This should be the recommended approach.

## Conclusion

It occurs to me that the Chinese Android community is rushing to replace Jetpack DataStore with MMKV. MMKV seems great, but it exposes only low-level APIs. Without proper abstraction in place, people could easily mess up their codebases. 

I hope this post does justice to Jetpack DataStore by highlighting its atomicity guarantee and nice suspending APIs that promote correctness and thread-safety. Even if you don't use DataStore, I would recommend learning from its API design. It's instructive to study its source and see Kotlin coroutines and flows in action.

## Remaining questions

Here are some interesting questions. I may return to this post and expand a bit more if I can reach some conclusion.

- How are Kotlin channels implemented under the hood?
- How does DataStore check that only one `CoroutineScope` is active per file? How to properly cancel a `CoroutineScope` ?
- How does actor-based concurrency control compare with traditional lock-based techniques? Does it scale better?

## References

- <cite>[Designing Data-Intensive Applications](https://dataintensive.net/)</cite> has an excellent presentation of various concurrency pitfalls in the context of database transactions.
- [《反思｜官方也无力回天？ Android SharedPreferences 的设计与实现》](https://juejin.cn/post/6884505736836022280) is a nice post that calls attention to the rationale behind some of SharedPreferences' API, as well as its shortcomings.
- <cite>[Actor-based Concurrency](https://berb.github.io/diploma-thesis/original/054_actors.html)</cite>
- [`SharedPreferencesImpl.java` source code](https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/android/app/SharedPreferencesImpl.java)
