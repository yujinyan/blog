---
title: 谈谈 Kotlin 协程的 Context 和 Scope
date: 2021-02-11T15:49:03.284Z
---

## 引子

开启 Kotlin 协程需要在 `CoroutineScope` 上调用 `launch` 或者 `async` 这些方法。这些定义在 `CoroutineScope` 上的扩展方法叫作 coroutine builder。

```kotlin
lifecycleScope.launch(Dispatchers.IO) {
  delay(1000)
}
```

协程库中这些 coroutine builder 除了 `suspend` 块之外，还可以传入额外的参数。比如上面这个 `Dispatchers.IO` 指定 `launch` 的协程块调度到 IO 线程池去执行。`launch` 的签名：

```kotlin
public fun CoroutineScope.launch(
  context: CoroutineContext = EmptyCoroutineContext, // highlight-line
  // 忽略了与本文无关的 CoroutineStart 参数
  block: suspend CoroutineScope.() -> Unit
): Job
```

可以看到开启一个 Kotlin 协程至少涉及到三个概念：`CoroutineScope`、`CoroutineContext` 和 `Job`。其中 scope （作用域）和 context（上下文）直接照着字面意思理解似乎含义非常相近。另外协程的 scope 里只包含一个属性即 `CoroutineContext`。

```kotlin
public interface CoroutineScope {
    public val coroutineContext: CoroutineContext
}
```

Kotlin 的协程为何需要一个 scope 的概念？能不能去掉 scope 只留下 context， 从而降低 API 的复杂度？似乎大家都曾有这样的困惑（比如这个 issue）。Kotlin 协程的主要设计者 Roman Elizarov 也有[专文](https://medium.com/@elizarov/coroutine-context-and-scope-c8b255d59055)介绍。本文将记录笔者的理解。

## CoroutineContext 用于配置协程的属性

### Context 是专门定制的数据结构

**Context 像一个集合（Set）**：这个集合由不同类型的 `Element` 组成。可以通过运算符重载的 add 添加元素，如果添加已经存在的类型的元素则会覆盖。

```kotlin
CoroutineName("foo") + CoroutineName("bar") 
  == CoroutineName("bar") // true
```

将两个 Context 「+」在一起以后返回的类型是 `CombinedContext`。由于这个集合本身和里面的元素 `CoroutineContext.Element` 都是 `CoroutineContext`，我们在调用 `launch` 这种接收 context 的函数的时候既可以传单个元素，也可以传组合在一起的 context，而不需要额外在外面加一个 `listOf` 这样的套子，或者使用 vararg，十分简洁优雅。

![context hierarchy](./context-hierarchy.svg)

**Context 是不可变（immutable）的**。对 Context 进行添加或者删除元素的操作都会返回新的 context 对象。这一性质是协程并发场景下的需要。

**Context 又像一个字典（Map）**：每一种类型的 `Element` 都有对应的 `CoroutineContext.Key`，可以通过这个 Key 类型安全地获取到相应类型的 Element：

```kotlin
fun main() {
  (CoroutineName("Coco") + Dispatchers.IO).also { it: CoroutineContext ->
    println(it[CoroutineName] == CoroutineName("Coco")) // true
    println(it[ContinuationInterceptor] == Dispatchers.IO) // true
  }
}
```

示例代码中用来获取元素的 `CoroutineName` 其实是 `CoroutineName` 这个类的伴生对象（companion object）。相比使用 `CoroutineName::class` 作为字典的 Key 也是更加简洁优雅的。

```kotlin
public data class CoroutineName(
  val name: String
) : AbstractCoroutineContextElement(CoroutineName) {
  public companion object Key : CoroutineContext.Key<CoroutineName> // highlight-line
  override fun toString(): String = "CoroutineName($name)"
}
```

Context 集合和字典的性质确保了 `CombinedContext` 这个集合里**每一种类型 Element 的唯一性**。

虽然 Context 用起来像字典和集合，但其**实现却是链表**。

![CombinedContext](./combined-context.svg)

由于 Context 中每种类型的 Element 是唯一的，而 Element 类型定义在 Kotlin 协程库（kotlinx.coroutines）内部，其数量是固定的，所以对链表操作的时间复杂度是有上界的。这样使用自定义的链表来实现 Context 相比直接使用现成的数据结构可以避免一些额外的开销，对于框架实现来说是非常合理的。

### 可以在协程的调用链中任意位置获取 Context（Context Propogration）

Context 一般用来存储某个工作流中具有全局性质的状态。比如，我们知道 Web 端的 React 通过声明式的 API 描述组件树的型状。有的时候跨组件层层传递一些数据会比较麻烦。如果这个数据具有全局性质（一个经典的例子是页面的主题），借助 React 的 [Context API](https://zh-hans.reactjs.org/docs/context.html) ，我们无须明确地传遍每一个组件，就能将值深入传递进组件树。

```jsx
// 为当前的 theme 创建一个 context（“light”为默认值）。
const ThemeContext = React.createContext('light'); // highlight-line
class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div><ThemedButton /></div>
  );
}

class ThemedButton extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```

一段可以作为整体执行的代码块可以叫作「子程序 routine」，比如函数、方法、lambda、条件块、循环块等。 Kotlin 协程（coroutine）就是一段可以 suspend 的代码块。我们出于抽象复用的目的，将一部分含有异步的代码抽离出来封装成 suspend 函数。

函数调用也可以类比 UI 组件看作一个树状的结构。在 Kotlin 的 suspend 函数中，我们可以在调用链的任意层级获取 Context：

```kotlin
fun main() = runBlocking {
  // 在 Context 中添加 CoroutineName[Coco] 元素
  launch(CoroutineName("Coco")) { // highlight-line
    foo()
  }
  Unit
}

// 调用链：foo->bar->baz
suspend fun foo() = bar()
suspend fun bar() = baz()
suspend fun baz() {
  // 在调用链中获取 Context 中的元素
  println(coroutineContext[CoroutineName]) // highlight-line
}
```

这个 `coroutineContext` 是 Kotlin 在编译期添加的，可以看成编译器将调用方的 context **隐式**地传给了调用的 suspend 函数。在[「理解 Kotlin 的 suspend 函数」](https://blog.yujinyan.me/posts/understanding-kotlin-suspend-functions/)一文中，我们介绍了 `suspend` 的本质是 Continuation，而这个 Continuation 中除了对应回调的 `resumeWith` 方法之外，剩下另外一个属性就是 `CoroutineContext` ：

```kotlin
public interface Continuation<in T> {
  // 每个 suspend 的代码块都有一个 Context
  public val context: CoroutineContext // highlight-line

  public fun resumeWith(result: Result<T>)
}
```

suspend 函数中的 `coroutineContext` 在没有通过`withContext` 更新 context 的情况下和调用方的 context 是相同的。一种有益的理解是可以想象把调用的 suspend 函数内联（inline) 到这个 suspend 块里面，程序的行为不会发生变化。下面这个例子检查了调用方、suspend 函数内部和 Continuation 的 Context 都是相同的。

```kotlin
suspend fun main() {
  println(checkCallerContext(coroutineContext)) // true
  println(checkContinuationContext()) // true
}

suspend fun checkCallerContext(callerContext: CoroutineContext): Boolean =
  // 不更新 context 的情况下和调用方的 context 相同
  callerContext === coroutineContext

suspend fun checkContinuationContext(): Boolean {
  // suspendCoroutine 是连接 suspend 和回调的桥梁。
  // 传给它的 lambda 属于桥回调的那一边，不是 suspend 的 block，
  // 所以没有 coroutineContext。因此我们在桥的 suspend 这一边的时候
  // 保存一下这个 suspend 的 context
  val currentContext = coroutineContext

  // 通过 suspendCoroutine 获取当前 Continuation
  return suspendCoroutine { cont ->
    val contContext = cont.context
    // 两个 context 是相同的
    val isTheSame = contContext === currentContext
    cont.resume(isTheSame)
  }
}
```

那么 Kotlin 提供的 Context 机制仅仅是为了方便地传一些全局状态吗？

### 一个核心 `Context.Element`：`ContinuationInterceptor`

我们知道 Context 是为了协程服务的。所谓协程就是编程语言在运行时「协作式 」地将子程序调度到线程上执行。

`ContinuationInterceptor` 这个 Element 为协程的调度提供了基础设施。我们熟悉的用于指定执行协程的线程的 `Dispatchers.IO` 等 `CoroutineDispatcher` 就是 `ContinuationInterceptor` 。

```kotlin
object CommonPoolContext : 
  AbstractCoroutineContextElement(ContinuationInterceptor), 
  ContinuationInterceptor {

  val pool: ForkJoinPool = ForkJoinPool() // highlight-line 

  override fun <T> interceptContinuation(continuation: Continuation<T>): Continuation<T> =
    object : Continuation<T> {
      override val context: CoroutineContext = continuation.context

      override fun resumeWith(result: Result<T>) {
        pool.submit { continuation.resumeWith(result) } // highlight-line
      }
    }
}
```

## CoroutineScope 与「结构化并发 Structured Concurrency」

2018 年 9 月 12 日，kotlinx.coroutines 发布了 0.26.0 版本，是 Kotlin 协程的一个重要里程碑。在这之前 coroutine builders 是全局的顶层函数，并不需要  `CoroutineScope` 就能开启协程，比如下面这个例子中的 `async`。

```kotlin
// ⚠️ 使用了已废弃、过时的 API
suspend fun loadAndCombineImage(name1: String, name2: String): Image {
  val image1 = async { loadImage(name1) } // highlight-line
  val image2 = async { loadImage(name2) } // highlight-line
  return combineImages(image1.await(), image2.await())
}
```

### 全局顶层 Coroutine builder 函数造成的麻烦

这样的设计有什么问题呢？我们可以看几个简单的例子。

[[tip | 🚨]]
| 作为顶层函数的 Coroutine builder 已被废弃，在目前的 API 中相当于通过 `GlobalScope` 开启协程。本文使用 `GlobalScope` 来模拟全局顶层的 Coroutine builder。

例：将一个文件流传给一个 `process` 函数进行处理

```kotlin
fun process(stream: InputStream): Unit { /**/ }

File("foo.txt").inputStream().use {
  processFile(it)
}
```

结果运行的时候抛出了异常 `java.io.IOException` ：Stream closed。我们打开函数 `process` 一看：

```kotlin
fun process(stream: InputStream) {
  GlobalScope.launch { // highlight-line
    delay(1000)
    stream.reader().readText()
  }
}
```

原来，`use` 会在接受的 lambda 执行完毕后关闭文件流。由于 `process` 函数在返回之后开启的异步任务还在执行，但文件却已关闭，于是抛出了异常。

例 ：假设我们调用一个 `writeData` 函数往存储里写一些数据，这个函数用 `launch(Dispatchers.IO)` 开启了一个调度到 IO 线程执行的协程：

```kotlin
fun main() {
  writeData()
  // 🤔 数据写完了吗？可以读这个数据了吗？
}

fun writeData() {
  GlobalScope.launch(Dispatchers.IO) { // highlight-line
    // doing some work
    // before writing data
  }
}
```

 `writeData` 返回以后，数据写完了吗？我们无法确定。`writeData` 内部 `launch` 的协程甚至可以抛出异常，但作为调用方我们无法捕获这个异常（无法通过在 `writeData` 外面 try catch 捕获 `writeData` 开启的协程内抛出的异常）。

例 3：Android 的 Activity

```kotlin
class MyActivity: Activity {
  val binding = MyActivityBinding.inflate(layoutInflater)

  override fun onCreate(savedInstanceState: Bundle?) {
    GlobalScope.launch { // highlight-line
      val result = 🏹 someNetworkRequest()
      binding.resultView.text = result
    }
  }
}
```

假设 `someNetworkRequest` 由于网络问题变得很缓慢，用户可能等得不耐烦，直接关闭了这个页面。由于 `launch` 的协程块引用了 Activity 的属性，这个协程会连带整个 Activity 一起泄漏。

分析上面这几个例子可以发现，问题出在我们开启了协程以后就弃之不理了，没有手动 `join` 去等待协程的结果。实际上，不仅仅 Kotlin 的 `GlobalScope`，几乎所有的异步 API（thread、promise、callback， goroutine 等）都允许我们不加生命周期限定地开启异步任务。当开启异步任务的函数结束返回之后，这个异步任务可能尚未完成，继续在后台执行。调用方无法知道这个异步任务何时结束，有没有抛出异常。

大家可能有这样的经验：使用某些 API 的时候不得不手动延时几秒钟再执行后面的逻辑，不然会产生某些奇怪的问题。或许这个 API 里面忘记 join 某个线程了。

### 结构化并发

这么看来异步 API 把 join 等待异步任务完成设计成默认行为似乎是更好的选择——这就是「结构化并发 Structured Concurrency」的核心思想。

Python 一个异步并发库 Trio 的作者 Nathaniel J. Smith 在 2018 年发布了一篇颇具影响力的博文 *[Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/)，*详尽地阐述了 Structured Concurrency，值得一读。Go 语言的 `go` 关键字类似 Kotlin 协程的 `GlobalScope.launch` 。文中认为，以 `go` 关键字为典型的现有异步 API 就好比半个世纪前 Dijkstra 反对的 goto 语句。

Dijkstra 在他著名的 [*Go To Statement Considered Harmful (1968)*](https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf) 一文中指出：人们更擅长把握事物的静态关系，而当程序运行起来以后，进程的状态流转是一个非常动态的过程。因此，人们很难在头脑中勾绘程序在运行时状态变化的完整图景。编程语言的设计应当尽可能**缩短代码文本和运行时程序之间的差异**，使得程序员看着某行代码就能推断程序运行的状态。

而那时非常流行的 goto 语句可以使进程跳到对应代码文本的任意位置。这样我们只能从头开始在头脑中模拟执行一遍程序的执行，很难在代码局部位置推断程序运行时的状态，难以保证程序的正确性。

Dijkstra 认为高级语言应当摒弃 goto 语句，提倡「结构化编程 Structured Programming」——即程序员使用条件、循环、函数块等结构块进行组合表达程序逻辑。

![Structured Programming](./structured-programming.svg)

可以看到，程序经过这些控制结构的时候总是从上到下（sequential）的：一个入口，一个出口。不同控制结构中间部分像一个「黑盒」。我们在阅读到这一块代码的时候可以确定这个块里有一些逻辑，这些逻辑完成以后，控制流最终会从一个出口出来，进入下一行代码。而一旦编程语言支持 goto 语句，这种封装就被破坏。

在结构化并发中，我们开启的所有异步任务都会被约束在一个作用域里面，这个作用域类似于结构化编程中的条件、循环、函数控制体，虽然可能有多个任务并发执行，但最终都会从一个出口出来，符合「黑盒」的性质。假设程序员读到图示虚线的位置，他可以确定，如果代码走到这里，上面并发的三个任务一定成功完成了。

![Structured Concurrency](./structured-concurrency.svg)

越来越多语言正在吸收结构化并发的思想，例如 Java 的 [Project Loom](https://wiki.openjdk.java.net/display/loom/Structured+Concurrency) 和 [Swift 的协程](https://forums.swift.org/t/swift-concurrency-roadmap/41611)。

### Job 与取消

在讨论 Kotlin 如何实现结构化并发之前，我们先来看一下协程的取消（Cancellation）。

首先从上面 Android Activity 的例子可以看到，如果用户离开界面，出于回收系统资源的考虑，协程应该需要支持取消。同样在服务端，如果连接断开或者某个关键异步任务失败，其他异步任务也应该及时停掉以避免不必要的资源浪费。

Kotlin 的协程、 Java 的线程和 Goroutine 都是协作式（cooperative）的，意味着要真正支持取消，协程需要主动地去检查当前的 Job 是不是处于 Active 的状态。这是因为如果子程序可以被突兀地中止，很有可能事情做到一半，损坏数据结构或文件资源等。

Go 语言中通过 channel 实现取消协程。下面这例子将一个名为 `done` 的  channel 传递给调用链中所有含有异步任务的函数。调用方通过关闭这个 channel 的方式「通知」所有开启的协程结束正在进行的任务。注意，我们不会给这个 channel 发送数据，只是把关闭 channel 产生的副作用作为「广播」的方式。

```go
func main() {
  // 创建 channel
	done := make(chan struct{}) // highlight-line
  // 开启协程
	go work(done)
	go work(done)

  time.Sleep(5000 * time.Millisecond)
	close(done) // highlight-line
}
func work(done chan struct{}) {
	for {
    // 在任务执行「间隙」检查 channel 是否被关闭
		if cancelled(done) { // highlight-line
			return
		}
		time.Sleep(1000 * time.Millisecond)
		println("working...")
	}
}
func cancelled(done chan struct{}) bool {
	select {
  // channel 关闭之后 receive 会立即返回零值
	case <-done: // highlight-line
		return true // highlight-line
	default:
		return false
:w

}
```

基于这种取消协程的方式，Go 标准库提供了一个 `Context` ，其中的 `Done` 方法返回了一个这样的 channel。如果使用 `Context` 的话，所有调用链上的函数都需要显式地传入这个 `Context` 对象，并在每个函数内部监听这个 `Done` channel。

```go
type Context interface {
    // Done returns a channel that is closed when this Context is canceled
    // or times out.
    Done() <-chan struct{} // highlight-line
    // ...
}
```

如果习惯使用 Java `ThreadLocal` 的话可能会觉得这种显式传值比较麻烦（见[这篇介绍 Go 上下文 Context 文章](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-context/#61-%E4%B8%8A%E4%B8%8B%E6%96%87-context)底下的评论）。

Kotlin Coroutine builder `launch` 的返回值是一个代表协程的 `Job` 对象。我们可以调用 `Job.cancel` 取消协程，调用 `Job.join` 等待协程完成。由于 `Job` 是一个 `CoroutineContext.Element`，我们可以在 suspend 函数调用链的任意位置通过 `coroutineContext` 获取当前协程对应的 `Job` 。可以认为编译器隐式地帮我们传递了 `Job` 对象。

```kotlin
suspend fun main() =
  GlobalScope.launch {
    foo()
  }.join()

suspend fun foo() =
  bar()

suspend fun bar() {
  // true
  println(coroutineContext.isActive) // highlight-line
  delay(1000)
}

// CoroutineContext.isActive is just a shortcut
public val CoroutineContext.isActive: Boolean
    get() = this[Job]?.isActive == true // highlight-line
```

在使用 Coroutine builder 开启的协程块内部可以通过 `Job.isActive` 判断当前协程是否被取消。如果已取消则可以直接返回或者抛出 `CancellationException`。这个异常在协程框架中不同于别的异常，有特殊的意义，是一个专门用作取消协程的标记，被抛出以后调用栈回退到 `launch` 的协程，整个协程正常结束，异常不会继续传播。

```kotlin
suspend fun main() {
  val job = GlobalScope.launch {
    for (i in 0..50) {
      // 除了 return 之外还可以抛 `CancellationException`
      // 协程库提供的 `ensureActive` 封装了这一方法
      // 另外也可以使用 `yield`
      // -----下面这些写法都可以-----
      // if (!isActive) throw CancellationException()
      // ensureActive()
      // yield()
      if (!isActive) return@launch // highlight-line
      println(fibonacci(i))
    }
  }
  delay(100)
  // 取消 job 并等待，避免 jvm 直接退出
  job.cancelAndJoin()
}

// deliberately slow fibonacci
fun fibonacci(n: Int): Int = if (n <= 1)
  n else fibonacci(n - 1) + fibonacci(n - 2)
```

如果要在封装出的 suspend 函数内部支持取消， return 是不行的，必须抛 `CancellationException`。因为 return 以后，控制流正常退回上层函数，可能会继续执行后面的同步语句。当协程被取消后，整个调用链应该立即回退。而 `launch` 的协程块不同于 suspend 函数内部，是协程调用树的根节点，因此可以直接 return 结束协程。

所有 `kotlinx.coroutines` 中的 suspend 函数都支持取消。如果 Job 已取消则会抛出 `CancellationException` 。 

假设我们把上面这个例子中输出 fibonacci 数的代码封装成 suspend 函数，在这个函数内部可以使用 `yield` 方法来确保只有协程在 active 的状态才会继续计算：

```kotlin
suspend fun main() {
  val job = GlobalScope.launch {
    printFibonacciSlowly(50)
  }
  delay(100)
  job.cancelAndJoin()
}

suspend fun printFibonacciSlowly(n: Int) {
  for (i in 0..n) {
    🏹 yield() // highlight-line
    println(fibonacci(i))
  }
}
```

在将回调 API 封装成 suspend 函数的时候，可以使用 `suspendCancellableCoroutine` 来支持取消操作，具体可以参考[理解 Kotlin 的 suspend 函数](https://blog.yujinyan.me/posts/understanding-kotlin-suspend-functions/#android-view-api)中的例子。

Kotlin 这种隐式传 context 与 Go 显式传 context 可以说各有利弊。显式传递的方式读起来更加清晰，但是所有函数都需要手动监听 channel，会造成一些 boilerplate。Kotlin 利用集成在语言中的 `CoroutineContext`，代码更加清爽；同时，我们可以在协程的调用树中利用协程库中提供的 `yield` 、 `suspendCancellableCoroutine` 等函数，相当于在异步任务的「间隙」中自动插入了对协程状态的检查，并通过异常机制回退整个协程的调用栈，实现取消协程更加方便，但是有一定学习成本。

### Job 与协程的父子关系

在协程的调用树中，除了调用 suspend 函数之外还有可能开启新的协程。根据结构化并发的思想，父协程必须等待所有子协程结束以后才能结束，因此在创建新的协程 `Job` 时必须以某种形式和父协程建立关联。

Kotlin 协程在 0.26.0 之前曾推荐这样的写法：

```kotlin
suspend fun sayHelloWorldInContext() {
  GlobalScope.launch(coroutineContext) { // highlight-line
    delay(500)
    print("Hello ")
  }
  GlobalScope.launch(coroutineContext) { // highlight-line
    delay(1000)
    print("World!")
  }
}
```

上面的例子将 suspend 函数中编译器添加的 `coroutineContext` 传入 `launch` ，这样新开启的协程将运行在外部执行这个 suspend 函数的协程 `Job` 中。如果外部的 `Job` 被取消， `sayHelloWorldInContext` 中 `launch` 的协程也会被取消，可以解决前面 Android Activity 带有生命周期结束后协程泄漏的问题。但是另外的问题没有解决，开启协程的函数并不会等待异步任务结束，返回之后异步任务有可能还在执行。所以更加正确的写法是这样：

```kotlin
suspend fun sayHelloWorld() {
  val job = Job(parent = coroutineContext[Job]) // highlight-line
  GlobalScope.launch(job) { // highlight-line
    delay(500)
    print("Hello ")
  }
  GlobalScope.launch(job) { // highlight-line 
    delay(1000)
    print("World!")
  }
  job.complete()
  job.join()
}
```

我们需要 `sayHelloWorld` 这个 suspend 函数内创建一个新的 `Job` 实例，并在函数内部手动去 join 这个 Job。这样的代码写起来有点麻烦，容易忘记，并没有比 Java 的线程 API 好多少。Kotlin 老手可能意识到可以把 suspend 函数内部和 `Job` 相关的逻辑封装成一个高阶函数，接收一个以 `Job` 实例为 receiver 的 lambda，比如：

```kotlin
suspend fun sayHelloWorld() = job {
  // `this` is Job
  GlobalScope.launch(this) { // highlight-line
    delay(500)
    print("Hello ")
  }
  GlobalScope.launch(this) { // highlight-line
    delay(1000)
    print("World!")
  }
}
```

这很 Kotlin。但是 `launch(this)` 有些尴尬。Kotlin 老手可能会想到如果 `launch` 是定义在 `job` 块的 Receiver 上的话，那么我们可以直接这个块里面 `launch` ，写法上就和 0.26.0 之前的全局顶层函数很像了。

到这里我们已经差不多重新发明了 Kotlin 协程库 Structured Concurrency 的两大支柱——   `coroutineScope` 高阶函数和 `CoroutineScope` 接口。`coroutineScope` 类似我们写的 `job` 函数（Kotlin 官方曾考虑用这个名字），而 `CoroutineScope` 就是前面提到的 Receiver。

### `CoroutineScope` 与结构化并发

Kotlin 0.26.0 废弃了所有全局顶层函数 Coroutine builder，改成了 `CoroutineScope` 上的扩展方法。这样开启协程必须有一个 `CoroutineScope`。这一设计比简单地添加一个 `job` 高阶函数好得多。Dijkstra 的观点并不仅仅是说推荐大家使用条件、循环、函数等控制体，更重要的是应该在编程语言中废弃 goto。因为只要 goto 存在，每个函数内部都可能藏着一个 goto，就会打破「黑盒」的性质，破坏封装性。类似地，结构化并发认为应当废弃「非结构化」的、fire-and-forget 的异步 API。`CoroutineScope` 的引入，使结构化并发在 Kotlin 协程 API 中成为了默认行为。

根据目前的最佳实践，在 suspend 函数中如果需要开启新的协程，需要先借助 `coroutineScope` 打开一个新的块，这个块包含了一个新的 `Job` 并限定了所有在其中开启的协程的生命周期：如果代码运行到 `coroutineScope` 块后面，意味着所有在这个块里面的异步任务都已成功结束；如果 `coroutineScope` 中任意一个协程抛出了异常，那么调用栈回退，异常会被传递到 `coroutineScope` 的外层。在下面的例子中， 如果任意一个 `loadImage` 失败抛出异常，这个异常会被传递给 `loadAndCombineImage` 的调用方。

```kotlin

suspend fun loadAndCombineImage(name1: String, name2: String): Image =
  coroutineScope { // highlight-line
    val image1 = async { loadImage(name1) }
    val image2 = async { loadImage(name2) }
    return combineImages(image1.await(), image2.await())
  }

// ⚠️ 使用了已废弃的全局顶层 Coroutine builder
suspend fun loadAndCombineImage(name1: String, name2: String): Image {
  val image1 = async { loadImage(name1) }
  val image2 = async { loadImage(name2) }
  return combineImages(image1.await(), image2.await())
}
```

而顶层的协程是「世界的尽头 」，一般需要和框架有生命周期的组件集成，配置一个 `CoroutineScope` 。例如：

```kotlin
class MyActivity : CoroutineScope { // highlight-line
  val job = SupervisorJob()
  override val coroutineContext = Dispatchers.Main + job // highlight-line

  fun doSomethingInBackground() = launch { ... }
  fun onDestroy() { job.cancel() }    
}
```

这个例子中， Kotlin 协程的 Context、Scope 和 Job 三个零件优雅地拼接在一起：我们让具有生命周期的系统组件实现 `CoroutineScope`，这样需要 override `coroutineContext` ，我们在其中配置所有在这个作用域中开启的协程的默认属性。由于 `MyActivity` 「是」一个 `CoroutineScope`，开启协程的时候可以省去 `this` ，API 调用起来就和全局顶层函数一样。
然而我们熟悉的 androidx 通过 `LifecycleOwner.lifecycleScope` 扩展属性提供了 Scope。使用扩展属性的方式比直接实现 interface 更加「开箱即用」，侵入性更低，同时更加显式，便于 Kotlin 协程在 Android 社区推广开来。使用上面手动集成的方法最好在项目中有个 `BaseActivity` 这样的基类，同时还需要开发者弄清楚 Context、Scope、Job 这些概念，学习成本会稍高一些。

对于非结构化、传统的 fire-and-forget 并发，Kotlin 提供了前面用来举例子的 `GlobalScope` 。读到这里，相信很容易能够想象出 `GlobalScope` 的实现：

```kotlin
public object GlobalScope : CoroutineScope {
  override val coroutineContext: CoroutineContext
    get() = EmptyCoroutineContext
}
```

一般不推荐在应用里使用 `GlobalScope` 。根据结构化并发的思想，`GlobalScope` 长远看可能最终会被废弃。一些「后台」异步任务可以考虑在生命周期更长的组件上定义 `CoroutineScope`，比如 Android 的 `Application` 以及 Spring  `singleton` scope 的组件。比较方便的做法可以：

```kotlin
val appScope = GlobalScope
```

在业务逻辑代码中引用自己定义的 `appScope` ，方便在一个统一的位置对协程进行配置。

## Kotlin 协程的两个约定（Convention）

Kotlin 结构化并发如何解决「全局顶层 Coroutine builder 函数造成的麻烦」这个标题下的例子？

由于开启协程必须有 `CoroutineScope` 。我们可以把这个 `CoroutineScope` 显式地传进封装的函数，或者像 Coroutine builder 一样定义成 `CoroutineScope` 的扩展方法。两种只是形式上的区别，实质是一样的，但后者似乎更加符合 Kotlin 的 style。

```kotlin
fun CoroutineScope.process(stream: InputStream) { // highlight-line
  launch {
    delay(1000)
    stream.reader().readText()
  }
}

suspend fun main() {
  File("foo.txt").inputStream().use {
    coroutineScope { // highlight-line
      process(it)
    }
    // 🚩 程序运行到这里 process 一定正常结束了
  }
}

```

使用结构化并发，在 `process` 外面包一个 `coroutineScope` 块以后，调用方可以控制所调用函数内开启的协程的生命周期。我们可以确定 `coroutineScope` 块结束以后意味着 `process` 开启的全部异步任务都已经顺利结束。

- 定义在 `CoroutineScope` 上的扩展函数提供了这样的约定（Convention）：这个函数会立即返回，但是函数会开启异步任务，可以理解为这个函数内的子程序和调用方的的代码并发执行。
- 本文的姊妹篇 [理解 Kotlin 的 suspend 函数](https://blog.yujinyan.me/posts/understanding-kotlin-suspend-functions/#%E5%8F%AF%E4%BB%A5-suspend-%E7%9A%84%E4%B8%8D%E4%BB%85%E4%BB%85%E6%98%AF-io) 介绍了 suspend 函数提供的约定：调用这个函数不会阻塞线程，函数内的子程序执行完毕以后函数才会返回，控制流回到调用方。suspend 函数不应该有开启异步任务的副作用。

可以看到，Kotlin 在类型系统对不同性质的函数作了区分：

```kotlin
// slow work but does not block caller's thread
suspend foo(params: Params): Response

// launch concurrent subprogram with surrounding code 
fun CoroutineScope.foo(params: Params): Response
```

理解和遵循这两个约定是用好 Kotlin 协程的关键。

## 参考资料

Structured Concurrency

- *[Nathaniel J. Smith: Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/)*
- Kotlin 协程引入 Structured Concurrency 的 [issue](https://github.com/Kotlin/kotlinx.coroutines/issues/410)
- Nathaniel J. Smith 维护了一个 Structured Concurrency [资源汇总](https://trio.discourse.group/t/structured-concurrency-resources/21)

Roman Elizarov 有多篇文章和视频介绍 Kotlin 的 Structured Concurrency：

- *[Structured concurrency](https://elizarov.medium.com/structured-concurrency-722d765aa952)*
- [*Hydra Conf - Structured concurrency*](https://www.youtube.com/watch?v=Mj5P47F6nJg)
- [*The reason to avoid GlobalScope*](https://elizarov.medium.com/the-reason-to-avoid-globalscope-835337445abc)

*[Roman Elizarov: Coroutine Context and Scope](https://elizarov.medium.com/coroutine-context-and-scope-c8b255d59055)*

Goroutine 和 Context 部分内容参考了 [Go 语言设计和实现](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-context/) 和 *[The Go Programming Language](https://www.gopl.io/)* 。

## 后记

### 协程「姊妹篇」

```kotlin
public interface Continuation<in T> {
  // 《谈谈 Kotlin 协程的 Context 和 Scope》
  public val context: CoroutineContext

  // 《理解 Kotlin 的 suspend 函数》
  public fun resumeWith(result: Result<T>)
}
```

笔者在写作本文的时候意识到，这两篇介绍 Kotlin 协程的文章正好对应 `Continuation` interface 的两个组成部分：`CoroutineContext` 和 `resumeWith` 方法。这一两分也体现在本文提到的 suspend 函数和 `CoroutineContext` 的扩展函数在类型系统上的区别。两篇文章正好形成姊妹两篇，互相补充。

### 国内对 Kotlin 协程的介绍

笔者最早学习 Kotlin 协程主要是看其主要设计者 Roman Elizarov 的演讲以及在 Medium 上发表的文章。Roman 的介绍非常 high-level，着重问题、概念、思想和设计。并发实践匮乏会导致有时候难以领会 Kotlin 协程要解决的问题，造成不好理解。这两篇介绍协程的文章补充解释了笔者学习过程中产生的一些困惑，或许可以当作 Roman 演讲和文章的注脚。

在学习、写作的过程中笔者也看了一些国内对 Kotlin 协程的介绍，感觉对协程重要概念的介绍相对较少，比如本文提到的 Structured Concurrency、两个 Conventions 等。很多介绍协程的文章对协程的实现细节情有独钟，想要「破解」协程，或者「扒了协程的皮」。其他分析原理的文章摘录大量源码，翻译一些源码里面的注释，读起来「不明觉厉」。但仔细看的话会发现，由于缺少对一些重要的高层概念的把握，很多对源码的解读其实是片面甚至错误的。

我想，学习一个库或者框架，直接看它的实现原理并不是最高效的方式。即使源码看明白了也不一定用得对。把握设计思想和理念更加重要。所有这些框架类库都为了解决某个问题而诞生。有了解决问题的 idea 以后，作者可能采取各种奇技淫巧甚至 hack 达成目的，同时在不断发展成熟的过程中会加入很多优化。所有这些细节都有可能掩盖问题和 idea 的本质。不先学习 idea 很容易被实现细节绕得晕头转向，更不要说在前人的基础上进行创新。

当然学习源码是非常重要。有一些书叫 「×× 设计和实现」，我觉得这种写作思路是很棒的。当然这会对作者的功力有更高的要求。

与诸君共勉。
