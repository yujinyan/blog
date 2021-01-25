---
title: "理解 Kotlin 的 suspend 函数"
date: "2021-01-24T23:14:03.284Z"
---

## `suspend` 是回调（Callback）

理解 `suspend` 其实不需要纠结神奇的「挂起」是什么意思或者拘泥于线程是怎么切换的。实际上 `suspend` 的背后是大家非常熟悉的回调。

假设 `postItem` 由三个有依赖关系的异步子任务组成： `requestToken`，`createPost` 和 `processPost` ，这三个函数都是基于回调的 API：

```kotlin
// 三个基于回调的 API
fun requestToken(block: (String) -> Unit)
fun createPost(
  token: String,
  item: Item,
  block: (Post) -> Unit)
)
fun processPost(post: Post)

fun postItem(item: Item) {
  requestToken { token ->
    createPost(token, item) { post ->
      processPost(post)
    }
  }
}
```

可以看到基于回调的 API 很容易造成大量缩进。如果代码中再加上一些条件、循环的逻辑，那么代码可读性会大大降低。Promise (Future) 等 API 以及 Android 社区很流行的 RxJava 通过链式调用在一定程度上消除了嵌套的问题。比如上面这个例子用 RxJava 实现的话：

```kotlin
fun requestToken(): Observable<String>
fun createPost(token: String, item: Item): Observable<Post>
fun processPost(post: Post)

fun postItem(item: Item) = requestToken()
  .flatMap { createPost(it, item) }
  .flatMap { processPost(it) }
```

但是 RxJava 这样的方案需要使用者掌握大量操作符，写复杂逻辑也很麻烦，会有一种被「困在」这个调用链里面的感觉。

Kotlin 的 `suspend` 关键字可以帮助我们消除回调，用同步的写法写异步：

```kotlin
// 🏹 代表挂起点（suspension point）

suspend fun requestToken(): String
suspend fun createPost(token: String, item: Item): Post
suspend fun processPost(post)

suspend fun postItem(item: Item) {
  val token = 🏹 requestToken()
  val post = 🏹 createPost(token, item)
  🏹 processPost(post)
}
```

## `suspend` 的原理

由于 `createPost` 这些方法实际上是耗时的 IO 异步操作，需要等到拿到返回值才能执行后面的逻辑，但我们又不希望阻塞当前线程（通常是主线程），因此最终必须实现某种消息传递的机制，让后台线程做完耗时操作以后把结果传给主线程。

假设我们有了前面提到的三个基于回调的 API，实现 `suspend` 可以在编译的时候把每个挂起点 🏹 后面的逻辑包在一个 lambda 里面，然后去调用回调 API，最终生成类似嵌套的代码。但这样每一个挂起点在运行时都需要开销一个 lambda 对象。Kotlin 和许多其他语言都采用生成状态机的方式，效率更佳。

具体来说，编译器看到 `suspend` 关键字会去掉 `suspend` ，给函数添加一个额外的 `Continuation` 参数。这个 `Continuation` 就代表了一个回调：

```kotlin
public interface Continuation<in T> {
  public val context: CoroutineContext

  // 用来回调的方法
  public fun resumeWith(result: Result<T>)
}
```

Kotlin 编译器会给每个 suspend 的块生成一个 `Continuation` 的实现类，这个实现类是一个状态机，其中的状态对应于每个挂起点，保存了需要下一步继续执行所需要的上下文（即依赖的局部变量），类似下面的伪代码：

```kotlin
suspend fun postItem(item: Item) {
  val token = 🏹 requestToken()
  val post = 🏹 createPost(token, item)
  🏹 processPost(post)
}

// 编译器变换后的伪代码
// 1.脱掉了 suspend 关键字
// 2.增加了一个 Continuation 对象
fun postItem(item: Item, cont: Continuation) {
  // 初始化一个对应调用这次 postItem 的状态机
  val sm = (cont as? ThisSM) ?: object: ContinuationImpl {
    fun resume(..) {
      postItem(null, this)
    }
  }
  switch (sm.label) {
    case 0:
      // 捕获后续步骤需要的局部变量
      sm.item = item
      // 设置下一步的 label
      sm.label = 1

      // 当 requestToken 里的耗时操作完成后会更新状态机
      // 并通过 sm.resume 再次调用这个 postItem 函数
      // 「我们在前面提供了 sm.resume 的实现，即再次调用 postItem」
      requestToken(sm)
    case 1:
      val item = sm.item
      // 前一个异步操作的结果
      val token = sm.result as Token
      sm.label = 2
      createPost(token, item, sm)
    case 2:
      procesPost(post)
  }
}
```

编译器将 `suspend` 编译成带有 continuation 参数的方法叫做 CPS (Continuation-Passing-Style) 变换。

## 使用 `suspend` 函数无须关心线程切换

`suspend` 提供了这样一个**约定(Convention)**：调用这个函数不会阻塞当前调用的线程。这对 UI 编程是非常有用的，因为 UI 的主线程需要不断相应各种图形绘制、用户操作的请求，如果主线程上有耗时操作会让其他请求无法及时响应，造成 UI 卡顿。

Android 社区流行的网络请求库 Retrofit、官方出品的数据库 ORM Room 都已经通过提供 `suspend` API 的形式支持了协程。Android 官方也利用 Kotlin 扩展属性的方式给 `Activity` 等具有生命周期的组件提供了开启协程所需的 `CoroutineScope` ，其中的 context 指定了使用 `Dispatchers.Main` ，即通过 `lifecycleScope` 开启的协程都会被调度到主线程执行。因此我们可以在调用 `suspend` 函数，拿到结果后直接更新 UI，无须做任何线程切换操作。这样的 `suspend` 函数叫作[「main 安全」](https://developer.android.com/kotlin/coroutines#use-coroutines-for-main-safety)的。

```kotlin
lifecycleScope.launch {
  val posts = 🏹 retrofit.get<PostService>().fetchPosts();
  // 由于在主线程，可以拿着 posts 更新 UI
}
```

这相比 callback 和 RxJava 的 API 是要好很多的。这些异步的 API 最终都得依靠回调，但回调回来在哪个线程需要调用方自己搞清楚，得看这些函数里面是怎么实现的。而有了 `suspend` 不阻塞当前线程的约定，调用方其实无须关心这个函数内部是在哪个线程执行的。

```kotlin

lifecycleScope.launch(Dispatchers.Main) {
   🏹 foo()
}
```

比如上面这个代码块，我们指定这个协程块调度到主线程执行，里面调用了一个不知道哪里来的 `suspend foo` 方法。这个方法内部可能是耗时的 CPU 计算，可能是耗时的 IO 请求，但是我在写这个协程块的时候，其实并不需要关心这里面到底是怎么回事，运行在哪个线程。类似地，在阅读这段协程块的时候，我们可以清楚地知道眼前的这段代码会在主线程执行，`suspend foo` 里面的代码是一个潜在的耗时操作，具体在哪个线程执行是这个函数的实现细节，对于当前代码的逻辑是「透明」的。

但前提是这个 `suspend` 函数实现正确，真正做到了不阻塞当前线程。单纯地给函数加上 `suspend` 关键字并不会神奇地让函数变成非阻塞的，比如假设 `suspend foo` 里面的实现是这样的：

```kotlin
// 😖
suspend fun foo() = BigInteger.probablePrime(4096, Random())
```

这里这个 `suspend` 函数的内部实现是一段耗时的 CPU 操作，类似地也可以想象成是一段时间复杂度特别高的代码。我们如果在主线程调用这个函数还是会阻塞 UI。问题出在这个 `foo` 函数的实现没有遵守 `suspend` 的语义，是错误的。正确的做法应该修改这个 `foo` 函数：

```kotlin
suspend fun findBigPrime(): BigInteger = withContext(Dispatchers.Default) {
  BigInteger.probablePrime(4096, Random())
}
```

借助 `withContext` 我们把耗时操作从当前主线程挪到了一个默认的后台线程池。因此有人说，即使是用了协程，最终还是会「阻塞」某个线程，「所有的代码本质上都是阻塞式的」。这种理解可以帮助我们认识到 Android / JVM 上最终需要线程作为执行协程的载体，但忽略了阻塞和非阻塞 IO 之分。CPU 执行线程，而上面 `BigInteger.probablePrime` 是一个耗时的 CPU 计算，只能等待 CPU 把结果算出来，但 IO 造成的等待并不一定要阻塞 CPU。

阻塞和非阻塞 IO 是有实际区别的。比如 Retrofit 虽然支持 `suspend` 函数（实际上也就是包装一下早就存在的基于回调的 API `enqueue`），但是底层依赖的 OkHttp 用的是阻塞的方法，最终执行请求是调度到线程池里面去执行。而 [Ktor 的 HTTP 客户端](https://ktor.io/docs/clients-index.html)支持非阻塞 IO。尝试用这两个客户端去并发做请求，可以感受到两者的不同。

当然客户端不会像服务端那样有很多「高并发」的场景，不太需要同时发起大量请求，所以一般使用线程池加上阻塞的 API 已经够用了。服务端可能需要处理大量请求，而每个请求一般都会去调数据库、缓存等外部服务，有大量 IO 操作，因此利用非阻塞的 IO API 理论上可以节省硬件资源。Spring Framework 在传统的基于 Servlet 的 WebMvc 之外还提供了 WebFlux。后者为非阻塞的服务器（比如 Netty）提供了支持。Spring WebFlux 原生用 Reactive Streams 提供了一种反应式编程模型（类似 RxJava）来支持非阻塞的 API。目前 WebFlux 也已经支持 Kotlin 协程，可以在 Controller 直接写 suspend 函数。

随着 Android 官方将协程作为推荐的异步方案，常见的异步场景如网络请求、数据库都已经有支持协程的库，可以设想未来 Android 开发的新人其实不太需要知道线程切换的细节，只需要直接在主线程调用 `suspend` 函数即可，切换线程应该被当成实现细节被封装掉而几乎变成「透明」的，这是协程的厉害之处。

## 可以 `suspend` 的不仅仅是 IO

`suspend` 本身并不完全是线程切换，只不过异步 IO 在 Android 平台最终都得依托多线程来实现；而异步 IO 又是协程的主要应用场景。Android 开发者们已经见识过各种异步 IO 的 API（对线程切换情有独钟），这些 API 本质上都得依靠某种形式的回调，将异步 IO 的结果通知给主线程进行 UI 刷新。协程的 `supend` 也是如此，只不过通过关键字的引入和编译器的支持，让我们可以用顺序、从上到下（sequential）的代码写出异步逻辑。不仅提升了代码可读性，还方便我们利用熟悉的条件、循环、try catch 这些构造轻松地写出复杂的逻辑。

把协程和 `suspend` 看成线程切换工具有很大的局限。由于 `suspend` 就是回调，也提供了包装回调 API 的方法，很多基于回调的 API 都可以用 `suspend` 函数进行封装改造。

[Splitties](https://github.com/LouisCAD/Splitties) 是一个非常地道的 Kotlin Android 辅助函数库，其中提供了一个 `AlertDialog.showAndAwait` 方法。下面的示例代码会打开一个对话框，等待用户确认是否要做删除的操作。这是一个异步的操作，于是将协程「挂起」，等用户选择完毕后返回一个布尔值。

```kotlin
suspend fun shouldWeReallyDeleteFromTrash(): Boolean = alertDialog(
    message = txt(R.string.dialog_msg_confirm_delete_from_trash)
).🏹 showAndAwait(
    okValue = true,
    cancelValue = false,
    dismissValue = false
)
```

[Suspending over views](https://medium.com/androiddevelopers/suspending-over-views-19de9ebd7020) 这篇文章介绍了用协程封装 Android view 相关 API 的例子，比如下面等待 `Animator` 结束的扩展函数：

```kotlin
suspend fun Animator.awaitEnd() { /* 略去实现 */}

lifecycleScope.launch {
    ObjectAnimator.ofFloat(imageView, View.ALPHA, 0f, 1f).run {
        start(); 🏹 awaitEnd()
    }
    ObjectAnimator.ofFloat(imageView, View.TRANSLATION_Y, 0f, 100f).run {
        start(); 🏹 awaitEnd()
    }
    ObjectAnimator.ofFloat(imageView, View.TRANSLATION_X, -100f, 0f).run {
        start(); 🏹 awaitEnd()
    }
}
```

上面这些例子都只涉及主线程，并不涉及线程切换的问题。更进一步， `suspend` 函数的应用场景甚至都不一定局限于异步。

我们平时使用的 Kotlin 协程代码的实现在两个包里，一个是 Kotlin 的标准库 `kotlin-stdlib` ，另一个是协程库 `kotlinx.coroutines` 。标准库里提供了 CPS 变换有关的 `Continuation` 和其他基础设施，`kotlinx.coroutines` 则提供了协程的具体实现。所以我们实际上可以利用标准库里 CPS 变换的基础设施写出其他有意思的东西。

Λrrow （也写作 Arrow）是 Kotlin 的一个函数式编程类库，其中提供了 `Either` 数据类型来做异常处理：

```kotlin
sealed class Either<A, B>
data class Left(val value: A): Either<A, Nothing>()
data class Right(val value: B): Either<Nothing, B>()
```

`Either` 的值可能是 `Left` 和 `Right` 两种情况。习惯上用 `Right`表示正常返回值（可以想成 right 在英语中还有 correct，「正确」的意思），`Left` 表示异常。

假设三个有相互依赖关系的子任务 `takeFoodFromRefriderator` 、`getKnife` 和 `lunch` ，注意这里的例子不是异步 IO 而是异常：

```kotlin
// 定义可能的异常
sealed class CookingException {
  object LettuceIsRotten : CookingException()
  object KnifeNeedsSharpening : CookingException()
  data class InsufficientAmount(val quantityInGrams: Int) : CookingException()
}

object Lettuce; object Knife; object Salad

// 三个子任务都是返回的 Either 类型
fun takeFoodFromRefrigerator(): Either<LettuceIsRotten, Lettuce> = Lettuce.right()
fun getKnife(): Either<KnifeNeedsSharpening, Knife> = Knife.right()
fun lunch(knife: Knife, food: Lettuce): Either<InsufficientAmount, Salad> = InsufficientAmount(5).left()
```

我们可以使用 `Either.flatMap` 把三个任务组合在一起：

```kotlin
fun getSalad(): Either<CookingException, Salad> =
  takeFoodFromRefrigerator()
    .flatMap { lettuce ->
      getKnife()
        .flatMap { knife ->
          val salad = lunch(knife, lettuce)
          salad
        }
```

看上去和 IO 的嵌套回调是不是有些类似？我们同样可以借助 `suspend` 的 CPS 变换消除掉回调：

```kotlin
suspend fun getSalad() = 🏹 either<CookingException, Salad> {
  val lettuce = 🏹 takeFoodFromRefrigerator().bind()
  val knife = 🏹 getKnife().bind()
  val salad = 🏹 lunch(knife, lettuce).bind()
  salad
}
```

可见，`suspend` 可以看成是回调的语法糖，其实和 IO、和线程切换并没有本质的关系。

---

## 参考资料

在进一步深入学习协程（源码）之前，非常推荐先看一下 [协程的设计文档](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md#implementation-details) ，有的放矢，事半功倍。

本文 CPS 的例子摘抄自 Roman Elizarov 在 2017 年 KotlinConf 的介绍：[Deep Dive into Coroutines on JVM](https://www.youtube.com/watch?v=YrrUCSi72E8)。

Roman 是 Kotlin 协程的主要设计者，现在担任 Kotlin Project Lead，他在 [Medium](https://elizarov.medium.com/) 上有一系列介绍 Kotlin 和协程的文章，非常值得我们学习和理解 Kotlin 的一些设计思想。

## 题外话：Kotlin 的异常处理

本文提到了 Λrrow `Either` 这个 ADT 来做异常处理，这是笔者认为比较好的异常处理方式。Kotlin 在类型系统区分了 null 和非 null 的值，解决了 `NullPointerException` 的问题，但是在异常处理这一块干掉了 Checked Exception，可以说是开了倒车。我们调用一个函数不去了解实现很难确定是否会抛出异常，这在客户端使用协程的情况下尤其糟糕，异常抛出的规律不容易掌握，稍有不慎便会让应用崩溃。异常处理在其他现代编程语言比如 Swift 和 Rust 就要好得多。不过可以理解 Kotlin 这一设计或许更多是 Java 生态的包袱。

所以笔者推荐在使用基于协程的 API 的时候，把所有的异常都在全局位置（比如 Retrofit 的 call adapter）全部 catch 掉，根据业务逻辑封装成类似标准库 `Result` 类型或者 Λrrow 的 `Either` 。如果调用方不需要获取具体错误信息的可以直接用 `T?` 可空类型来表示，这样既有类型安全又有 `?.` 、`?:` 语法糖。据说 Kotlin 有可能结合 `Result` 类给函数返回类型做个语法糖，非常期待。

## 题外话：没有用的 `await` 关键字

近日，Swift 语言通过了 [Async/await](https://github.com/apple/swift-evolution/blob/main/proposals/0296-async-await.md#asynchronous-functions) 提案。`async` 相当于 Kotlin 的 `suspend` 。在调用 async / suspend 函数的时候，Swift 需要一个额外的 `await` 关键字，但是 Kotlin 不需要，调用 suspend 函数的语法和调用普通函数没有区别。这个 `await` 除了标记之外没有其他作用。Kotlin 的这个设计在写起来是更加方便的，但是读起来的时候其实还是有个标记比较好，所以 IDE 会在在 gutter 有个图标提示，在没有 IDE 的环境比如写作本文就比较麻烦，需要在 `await` 的地方放个 emoji 手动标记 😂。