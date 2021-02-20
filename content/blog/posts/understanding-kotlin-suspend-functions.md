---
title: "理解 Kotlin 的 suspend 函数"
date: "2021-01-24T23:14:03.284Z"
issueId: "4"
---

## `suspend` 是回调（Callback）

理解 `suspend` 其实不需要纠结神奇的「挂起」是什么意思或者拘泥于线程是怎么切换的。实际上 `suspend` 的背后是大家非常熟悉的回调。

<!-- excerpt end -->

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

[[tip | 🏹 ]]
| 代表挂起点（suspension point）

```kotlin
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

假设我们有了前面提到的三个基于回调的 API，实现 `suspend` 可以在编译的时候把每个挂起点 🏹 后面的逻辑包在一个 lambda 里面，然后去调用回调 API，最终生成类似嵌套的代码。但这样每一个挂起点在运行时都需要开销一个 lambda 对象。Kotlin 和许多其他语言都采用生成状态机的方式，性能更好。

具体来说，编译器看到 `suspend` 关键字会去掉 `suspend` ，给函数添加一个额外的 `Continuation` 参数。这个 `Continuation` 就代表了一个回调：

```kotlin
public interface Continuation<in T> {
  public val context: CoroutineContext

  // 用来回调的方法
  public fun resumeWith(result: Result<T>) // highlight-line
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

  // 判断传入的是否是 postItem 的 `ContiuationImpl`
  // * false: 初始化一个对应本次调用 postItem 的状态机
  // * true: 对应 postItem 内其他 suspend 函数回调回来情况
  // 其中 ThisSM 指的 object: ContinuationImpl 这个匿名类
  val sm = (cont as? ThisSM) ?: object: ContinuationImpl {

    // 实际源码中 override 的是
    // kotlin.coroutine.jvm.internal.BaseContinuationImpl
    // 的 invokeSuspend 方法
    override fun resume(..) {
      // 通过 ContinuationImpl.resume
      // 重新回调回这个方法
      postItem(null, this) // highlight-line
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
    // ...
  }
}
```

编译器将 `suspend` 编译成带有 continuation 参数的方法叫做 CPS (Continuation-Passing-Style) 变换。

[[tip | 💡]]
| 我们可以写一段简单的 `suspend` 函数，然后通过 IntelliJ IDEA / Android Studio 的 Tools → Kotlin → Show Kotlin Bytecode (Decompile) 查看 Kotlin 生成的状态机代码。尝试写一下这个状态机代码对理解 `suspend` 函数非常有益。可以在[这里](https://github.com/yujinyan/kotlin-playground/blob/master/src/main/kotlin/coroutine/continuation/ManualContinuationExercise.kt)查看笔者写的一个例子。

## 使用 `suspend` 函数无须关心线程切换

`suspend` 提供了这样一个**约定(Convention)**：调用这个函数不会阻塞当前调用的线程。这对 UI 编程是非常有用的，因为 UI 的主线程需要不断相应各种图形绘制、用户操作的请求，如果主线程上有耗时操作会让其他请求无法及时响应，造成 UI 卡顿。

Android 社区流行的网络请求库 Retrofit、官方出品的数据库 ORM Room 都已经通过提供 `suspend` API 的形式支持了协程。Android 官方也利用 Kotlin 扩展属性的方式给 `Activity` 等具有生命周期的组件提供了开启协程所需的 `CoroutineScope` ，其中的 context 指定了使用 `Dispatchers.Main` ，即通过 `lifecycleScope` 开启的协程都会被调度到主线程执行。因此我们可以在调用 `suspend` 函数，拿到结果后直接更新 UI，无须做任何线程切换的动作。这样的 `suspend` 函数叫作[「main 安全」](https://developer.android.com/kotlin/coroutines#use-coroutines-for-main-safety)的。

```kotlin
lifecycleScope.launch {
  val posts = 🏹 retrofit.get<PostService>().fetchPosts();
  // 由于在主线程，可以拿着 posts 更新 UI
}
```

这相比 callback 和 RxJava 的 API 是要好很多的。这些异步的 API 最终都得依靠回调，但回调回来在哪个线程需要调用方自己搞清楚，得看这些函数里面是怎么实现的。而有了 `suspend` 不阻塞当前线程的约定，调用方其实无须关心这个函数内部是在哪个线程执行的。

```kotlin

lifecycleScope.launch(Dispatchers.Main) {
  🏹 foo() // highlight-line
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
suspend fun findBigPrime(): BigInteger =
  withContext(Dispatchers.Default) { // highlight-line
    BigInteger.probablePrime(4096, Random())
  }
```

借助 `withContext` 我们把耗时操作从当前主线程挪到了一个默认的后台线程池。因此有人说，即使是用了协程，最终还是会「阻塞」某个线程，「所有的代码本质上都是阻塞式的」。这种理解可以帮助我们认识到 Android / JVM 上最终需要线程作为执行协程的载体，但忽略了阻塞和非阻塞 IO 之分。CPU 执行线程，而上面 `BigInteger.probablePrime` 是一个耗时的 CPU 计算，只能等待 CPU 把结果算出来，但 IO 造成的等待并不一定要阻塞 CPU。

阻塞和非阻塞 IO 是有实际区别的。比如 Retrofit 虽然支持 `suspend` 函数（实际上也就是包装一下基于回调的 API `enqueue`），但是底层依赖的 OkHttp 用的是阻塞的方法，最终执行请求还是调度到线程池里面去。而 [Ktor 的 HTTP 客户端](https://ktor.io/docs/clients-index.html)支持非阻塞 IO。尝试用这两个客户端去并发做请求，可以感受到两者的不同。

当然客户端不会像服务端那样有很多「高并发」的场景，不太需要同时发起大量请求，所以一般使用线程池加上阻塞的 API 已经够用了。服务端可能需要同时响应大量请求，而每个请求一般都会去调数据库、缓存等外部服务，有大量 IO 操作，因此利用非阻塞的 IO API 理论上可以节省硬件资源。Spring Framework 在传统的基于 Servlet 的 WebMvc 之外还提供了 WebFlux。后者为非阻塞的服务器（比如 Netty）提供了支持。Spring WebFlux 原生用 Reactive Streams 提供了一种反应式编程模型（类似 RxJava）来支持非阻塞的 API。目前 WebFlux 也已经支持 Kotlin 协程，可以在 Controller 直接写 suspend 函数。

随着 Android 官方将协程作为推荐的异步方案，常见的异步场景如网络请求、数据库都已经有支持协程的库，可以设想未来 Android 开发的新人其实不太需要知道线程切换的细节，只需要直接在主线程调用封装好的 `suspend` 函数即可，切换线程应该被当成实现细节被封装掉而几乎变成「透明」的，这是协程的厉害之处。

## 可以 `suspend` 的不仅仅是 IO

`suspend` 本身并不完全是线程切换，只不过异步 IO 在 Android 平台最终都得依托多线程来实现；而异步 IO 又是协程的主要应用场景。Android 开发者们已经见识过各种异步 IO 的 API（对线程切换情有独钟），这些 API 本质上都得依靠某种形式的回调，将异步 IO 的结果通知给主线程进行 UI 刷新。协程的 `suspend` 也是如此，只不过通过关键字的引入和编译器的支持，让我们可以用顺序、从上到下（sequential）的代码写出异步逻辑。不仅提升了代码可读性，还方便我们利用熟悉的条件、循环、try catch 等构造轻松地写出复杂的逻辑。

把协程和 `suspend` 单纯看成线程切换工具有很大的局限性。由于 `suspend` 就是回调，也提供了包装回调 API 的方法，基于回调的 API 都可以用 `suspend` 函数进行封装改造。

### Android View API

[Suspending over views](https://medium.com/androiddevelopers/suspending-over-views-19de9ebd7020) 这篇文章介绍了用协程封装 Android view 相关 API 的例子，比如下面等待 `Animator` 结束的扩展函数：

```kotlin
suspend fun Animator.awaitEnd() { /* 实现见后文 */}

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

使用传统基于回调的 API 在表达这样具有复杂先后顺序的代码时会造成大量嵌套，代码可读性大幅下降。封装成 `suspend` 函数后，我们可以在协程中用从上到下的顺序代码写出来，同时方便使用各种条件、循环等逻辑控制构造，提升代码表达力。

这个 `Animator.awaitEnd` 包装了 `AnimatorListenerAdapter` 这个异步回调接口。Kotlin 协程库提供了 `suspendCoroutine` 和 `suspendCancellableCoroutine` 函数（注意这两个函数本身都是 `suspend` 的）。我们可以在传入的 lambda 中获取到对应当前「挂起」的 `Continuation` 实例。在合适的回调里调用这个实例的 `resume` 系列方法，便能桥接 `suspend` 函数和基于回调的 API：

```kotlin
suspend fun Animator.awaitEnd() = 
🏹 suspendCancellableCoroutine<Unit> { cont -> // highlight-line

    // 如果执行这个 suspend 函数的协程被取消的话，同时取消这个 Animator。
    // 注意这个 `awaitEnd` 是定义在 `Animator` 上的扩展函数，
    // 因此可以直接调用 `Animator` 上的方法。
    cont.invokeOnCancellation { cancel() }

    addListener(object : AnimatorListenerAdapter() { // highlight-line

      // 标记 Animator 被取消还是正常结束
      private var endedSuccessfully = true
      override fun onAnimationCancel(animation: Animator) {
        // Animator has been cancelled, so flip the success flag
        endedSuccessfully = false
      }

      override fun onAnimationEnd(animation: Animator) {
        animation.removeListener(this)

        // 如果协程仍在执行中
        if (cont.isActive) {
          // 并且 Animator 未被取消
          if (endedSuccessfully) {
              cont.resume(Unit) // highlight-line
          } else {
            // 否则取消协程
            cont.cancel()
          }
        }
      }
    })
  }

```

[Splitties](https://github.com/LouisCAD/Splitties) 是一个非常地道的 Kotlin Android 辅助函数库，其中提供了一个 `suspend AlertDialog.showAndAwait` 方法。下面的示例代码会打开一个对话框，等待用户确认是否要删除。这是一个异步的操作，于是将协程「挂起」，等用户选择完毕后返回一个布尔值。

```kotlin
suspend fun shouldWeReallyDeleteFromTrash(): Boolean = 
  alertDialog(
    message = txt(R.string.dialog_msg_confirm_delete_from_trash)
  ).🏹 showAndAwait( // highlight-line
    okValue = true,
    cancelValue = false,
    dismissValue = false
  )
```

这里 `AlertDialog.showAndAwait` 使用 `suspendCancellableCoroutine` 包装了 `DialogInterface.OnClickListener` 接口。

[[tip|😏]]
| 基于回调的 API 都能用 `suspendCoroutine` （和它支持取消的兄弟）包装成 `suspend` 函数。合理使用可以提升代码表达力。

注意上面这些例子都只涉及主线程，并不涉及线程切换的问题。

### 函数式异常处理

更进一步， `suspend` 函数的应用场景甚至都不一定局限于异步。

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

### 深递归

递归应用在递归的数据结构的时候往往可以使代码简洁优雅。比如下面计算树高度的算法：

```kotlin
class Tree(val left: Tree?, val right: Tree?)

fun depth(tree: Tree?): Int =
  if (t == null) 0 else maxOf(
    depth(tree.left), // highlight-line
    depth(tree.right) // highlight-line
  ) + 1
```

但如果递归过深超出限制，运行时会抛出 `StackOverflowException`。因此我们需要利用空间更大的堆内存。通常我们可以显式地维护一个栈数据结构。

Kotlin 标准库中有个试验性的 [`DeepRecursiveFunction`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deep-recursive-function/) 辅助类，帮助我们写出的代码保持递归算法的「大致形状」，但是将中间状态保存在堆内存中。其中实现的机制就是 `suspend` 的 CPS 变换。

```kotlin
val depth = DeepRecursiveFunction<Tree?, Int> { tree ->
  // 这里是一个 suspend 的 λ
  if (tree == null) 0 else maxOf(
    🏹 callRecursive(tree.left), // highlight-line
    🏹 callRecursive(tree.right) // highlight-line
  ) + 1
}

val deepTree = generateSequence(Tree(null, null)) { prev ->
  Tree(prev, null)
}.take(100_000).last()

// DeepRecursiveFunction 重载了 invoke 操作符
// 可以模拟函数调用语法
println(depth(deepTree)) // 100_000
```

`DeepRecursiveFunction` 接的是一个 `suspend` 的块，其中的接收者（Receiver）是 `DeepRecursiveScope`，可以类比成 `CoroutineScope`。在这个块里面，注意我们不能像原算法那样直接递归调用 `depth`（因为还是会依赖于空间有限的函数调用栈）。`DeepRecursiveScope` 提供了一个 `suspend callRecursive` 方法。在这里，我们借助 CPS 变换得到的状态机来保存递归函数调用栈中的中间结果。由于 `Continuation` 对象在运行时存放在堆内存中，也就避开了函数调用栈的空间限制。（所以 Kotlin 的协程属于一种所谓的「无栈协程（stackless coroutine）」。）

具体实现可以参考 [Deep recursion with coroutines](https://elizarov.medium.com/deep-recursion-with-coroutines-7c53e15993e3)。[KT-31741](https://youtrack.jetbrains.com/issue/KT-31741) 有关于标准库设计和实现以及性能方面的一些讨论。

通过上面这些关于 Android UI、函数式编程以及一般编程等方面的不同例子可以看到，`suspend` 可以看成是回调的语法糖，其实和 IO、和线程切换并没有本质的关系。回过头来看 `suspend` 这个关键字在别的语言通常叫 `async`，而 Kotlin 叫 `suspend` 或许正暗示了 Kotlin 协程独特的设计并不限于 asynchrony，而有着更宽广的应用场景。

---

## 参考资料

在进一步深入学习协程（源码）之前，非常推荐先看一下 [协程的设计文档](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md#implementation-details) ，有的放矢，事半功倍。

本文 CPS 的例子摘抄自 Roman Elizarov 在 2017 年 KotlinConf 的介绍：[Deep Dive into Coroutines on JVM](https://www.youtube.com/watch?v=YrrUCSi72E8)。

Roman 是 Kotlin 协程的主要设计者，现在担任 Kotlin Project Lead，他在 [Medium](https://elizarov.medium.com/) 上有一系列介绍 Kotlin 和协程的文章，可以帮助我们学习和理解 Kotlin 的一些设计思想。

[[tip | 🔗]]
| 欢迎阅读本文的「姊妹篇」：[《谈谈 Kotlin 协程的 Context 和 Scope》](/posts/kotlin-coroutine-context-scope/)

## 题外话：Kotlin 的异常处理

本文提到了 Λrrow `Either` 这个 ADT 来做异常处理，这是笔者认为比较好的异常处理方式。Kotlin 在类型系统区分了 null 和非 null 的值，解决了 `NullPointerException` 的问题，但是在异常处理这一块却干掉了 Checked Exception，可以说是开了倒车。我们调用一个函数不去了解其实现很难确定是否会抛出异常。这在客户端使用协程的情况下尤其糟糕，异常抛出的规律不容易掌握，稍有不慎便会让应用崩溃。异常处理在其他现代编程语言比如 Swift 和 Rust 就要好得多。不过可以理解 Kotlin 这一设计或许更多是 Java 生态的包袱造成的。

所以笔者推荐在使用基于协程的 API 的时候，把所有的异常在全局位置（比如 Retrofit 的 call adapter）全部 catch 掉，然后根据业务逻辑封装成类似标准库 `Result` 类型或者 Λrrow 的 `Either` 。如果调用方不需要获取具体错误信息的话可以直接用 `T?` 可空类型来表示，这样既有类型安全又有 `?.` 、`?:` 语法糖。据说 Kotlin 有可能结合 `Result` 类给函数返回类型做个语法糖，非常期待。

## 题外话：没有用的 `await` 关键字

近日，Swift 语言通过了 [Async/await](https://github.com/apple/swift-evolution/blob/main/proposals/0296-async-await.md#asynchronous-functions) 提案。`async` 相当于 Kotlin 的 `suspend` 。在调用 async / suspend 函数的时候，Swift 需要一个额外的 `await` 关键字，但是 Kotlin 不需要，调用 suspend 函数的语法和调用普通函数没有区别。这个 `await` 除了标记之外没有其他作用。

Kotlin 的这个设计写起来是更加方便的。比如不会有 JavaScript 中[被吐槽的这种写法](https://twitter.com/threepointone/status/1355494949454831620)：

```javascript
await (await fetch(url)).json()
```

在阅读代码的时候，有一个语法标记会不会更好？IDE 在编辑器 gutter 有专门的图标标记，但是很多时候我们会在网页上查阅代码。根据 [Roman 的说法](https://trio.discourse.group/t/function-coloring-options/332)，Kotlin 对这个问题有所权衡，最终选择了这种「非主流」的大胆设计，主要是基于「关注点分离 Separation of concerns」的考虑：在阅读代码的时候最重要的是理解代码的业务逻辑；具体某个函数是同步还是异步，在哪个线程运行是这个函数本身的实现细节，对于代码的读者来说是次要的。

这个说法和本文在「使用 `suspend` 函数无须关心线程切换」这个标题下所强调的内容是一致的。Kotlin 要求在开启协程的时候有一个 `CoroutineScope`，这个是显式的，因为开启的子程序和剩下的代码块是并发的。但在协程块内部，`suspend` 函数从调用方的视角看确实在程序行为上和普通的函数相似，都是顺序执行，从这个意义讲似乎确实不需要有特殊的关键字作区分。

不过根据笔者的实际体会，Kotlin 的设计权衡似乎还是令「可写性」略高于「可读性」。我们阅读代码的目的可以分成两种：探索型（学习、研究）和批判型（例如 code review）。对于探索型的代码阅读，语言提供更多线索是有帮助的。比如，有时阅读 Kotlin 源码会分不清楚某个方法是调在 Receiver 上还是外层的对象。

所以作为介绍 `suspend` 函数的文章，本文在 Kotlin 省去的 `await` 关键字的位置插入一个 🏹 emoji。最近发现 iOS 14.2 和 Android 11 最新支持的「回旋镖 boomerang 🪃」似乎比 🏹 更恰当一些，不知读者有没有同感 😉 ？
