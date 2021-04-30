---
title: Kotlin 协程与 Retrofit 
date: "2021-04-29T17:21:03.284Z"
---

Retrofit 2.6.0 支持用 Kotlin suspend 函数定义接口。 本文介绍如何通过自定义 Retrofit Call Adapter 和 Converter 打造最舒适的协程使用体验。

剧透最终效果：

```kotlin
// Retrofit 接口定义
// 简洁起见，后文省略外面这个 UserApi
interface UserApi {
  suspend fun getUser(id: Int): 
    ApiResponse<User>
}

data class User(val name: String)

// 调用示例 1：
lifecycleScope.launch {
  retrofit.create<UserApi>()
    .getUser(1)
    .getOrNull()
    // 主线程更新 UI
    ?.let { binding.nameLabel.text = it.name }
}

// 调用示例 2：
lifecycleScope.launch {
  val user: User = retrofit.create<UserApi>()
    .getUser(1)
    .guardOk { return@launch }
  // 拿到非 null 的 User 继续后面的业务逻辑
}

// 还没有结束，文章最后会介绍一个进一步简化的方案 ;-)
```

这个方案受到了 Jake Wharton [*Making Retrofit Work for You*](https://jakewharton.com/making-retrofit-work-for-you/) 演讲的启发。 Jake
也是 Retrofit 的维护者。在演讲中，他推荐利用好 Retrofit 提供的自定义反序列化以及请求执行的 API，适应 *adapt* 自己的业务逻辑和接口。

## 背景

假设我们的接口返回这样的 JSON 数据，请求成功时 `errcode` 字段返回值为 `0`，同时有一个 `data` 字段存放数据：

```json
{
  "errcode": 0,
  "msg": "",
  "data": {
    "id": 1,
    "name": "Peter Parker"
  }
}
```

异常情况下 `errcode` 不为 `0` ，同时会有 `msg` 字段返回展示给用户的错误信息：

```json
{
  "errcode": 401,
  "msg": "无权访问"
}
```

## Retrofit interface 设计

我们先抛开实现，探讨一下怎么设计 Retrofit 的 interface 才能让调用方更舒适地使用协程。

### 去掉「信封」

舒适的封装应该让调用方尽可能爽，越简单越好。 可以看到对业务真正有用的数据在 `data` 里面，外面套了一个“信封”。绝大部分情况下我们只需要拿正常情况下的数据，然后继续执行后续的业务逻辑。
如果每次调用都要手动去检查一遍 `errcode == 0` 会非常冗余。一种最简单的设计是直接返回去掉信封后的数据类型：

```kotlin
suspend fun getUser(
  @Query("id") id: Int
): User // highlight-line

data class User(val id: Int, val name: String)

// 在主线程开启协程并更新 UI
// 🚨 危险：请求异常会让应用崩溃
lifecycleScope.launch {
  val user = retrofit.create<UserApi>().getUser(1)
  binding.userNameLabel.text = user.name
}
```

### 异常处理

直接返回信封内数据类型的设计理论上可行：正常情况下调用很爽，如果出现异常可以借助 try catch 获得具体的异常信息。 但是，按照 Kotlin 协程的设计，我们应该直接在主线程调用封装的 suspend 函数。
如果函数抛出异常会抛在主线程，导致应用崩溃。 从函数签名上也能看出来：一旦不能正常返回 `User` 数据类型，运行时只能抛出异常。 这样调用方必须进行 try catch，写起来非常麻烦。更加糟糕的是大家完全可以忘记 try
catch，还很有可能写错：

```kotlin
// - Kotlin 标准库的 runCatching，比 try catch 写起来舒服一点点
// - 🚨 错误的 try catch，无法捕获 launch 协程块的异常
runCatching { // highlight-line
  lifecycleScope.launch {
    val user = retrofit
      .create<UserService>()
      .getUser(1)
    binding.userNameLabel.text = user.name
  }
} // highlight-line
```

小心！上面这个例子的 try catch 写错了。如果协程块内抛出异常还是会 crash。原因是错误地 try catch 了 Coroutine builder `launch`。 Coroutine builder 在
CoroutineScope 中开启协程块以后会立即返回，builder 内的协程与 `launch` 周围的代码并发执行。 协程块内的异常逻辑无法被 `launch` 外的 try catch 捕获。 正确的写法是在协程块内部 try
catch：

```kotlin
lifecycleScope.launch {
  runCatching { // highlight-line
    val user = retrofit.create<UserService>().getUser(1)
    binding.userNameLabel.text = user.name
  } // highlight-line
}
```

[[tip | 💡]]
| 好的封装设计应该**让正确的写法最简单**，**默认最简单的写法是正确的写法**。

为了避免 try catch 协程异常的麻烦和潜在的失误，笔者建议在 suspend 函数内部封装中 catch 所有异常，并将异常在函数签名上体现。

一种方案是返回 nullable 的类型。我们知道， Kotlin 对 nullable 类型有语法糖 `?.`，`?:` 和 `!!` 支持：

```kotlin
suspend fun getUser(
  @Query("id") id: Int
): User? // highlight-line

lifecycleScope.launch {
  retrofit.create<UserApi>()
    .getUser(1)
    ?.let { binding.nameLabel.text = it.name }
}
```

这似乎是相当地道的优雅设计，值得推荐。但使用 nullable 我们无法告诉调用方发生了什么类型的异常。 对调用方来说只有成功 `!= null` 或者失败 `== null` 两种可能。不过很多情况下这样的区分已经足够了。

另外对于异常情况，应该**在项目中有一个统一的位置进行处理**，比如在 `errcode != 0` 时给用户展示提示、网络请求异常时上报等。 在业务调用接口的位置到处 try catch 做临时（ad hoc）的异常处理不够健壮：
大家完全可以忘记做异常处理，或者处理得非常粗糙。同时，异常处理代码可能会造成大量冗余，看不清正常代码逻辑。

Retrofit 的 Call Adapter 可以帮助我们在 Retrofit 的执行逻辑中嵌入自定义的逻辑，实现统一捕获处理所有异常的目标。 后文将给出一个参考实现。

> **As a rule of thumb, you should not be catching exceptions in general Kotlin code. That’s a code smell.**
> Exceptions should be handled by some top-level framework code of your application to alert developers of the bugs in the code and to restart your application or its affected operation.
>
> <cite>Roman Elizarov, Project Lead for Kotlin</cite>

[[tip | “]]
| **原则上，不要在 Kotlin 业务逻辑代码中 catch 异常。**这是一种 Code Smell。异常应该在应用顶层的基础设施代码中进行统一处理：比如进行上报或者重试出错的步骤。

### 设计 ApiResponse 类型

为了让调用方能够获取到异常信息，不可避免要将返回值塞在一个能够体现成功/失败结果的壳里面。但我们不原样照着返回的格式进行反序列化，而是进行一定的封装。
比如请求正常情况下，`msg` 字段没有任何用处，可以省略。
请求结果大概可以分成三种情况：

- 正常响应：我们可以从 `data` 字段获取后续业务逻辑需要的数据；
- 业务逻辑异常：接口请求成功，但是后端返回数据告诉我们业务逻辑异常，我们需要在 UI 展示异常信息；
- 其他技术异常：网络请求错误、反序列化错误等，我们可能需要根据情况进行上报。

落实到代码里，可以用 Kotlin Sealed Class 进行表示：

```kotlin
sealed class ApiResponse {
  // 正常响应情况调用方不需要 errcode, msg
  data class Ok<T>(
    val data: T
  )
  
  data class BizError<T>(
    val errcode: Int,
    val msg: String
  ): ApiResponse<T>
  
  data class OtherError<T>(
    val throwable: Throwable
  ): ApiResponse<T>
}

suspend fun getUser(@Query("id") id: Int)
  : ApiResponse<User>

lifecycleScope.launch {
  val response = retrofit.create<UserApi>().getUser(1)
  
  // 可以使用 when 对 ApiResponse 的类型进行区分
  // 作为表达式使用的时候可以利用 when
  // 穷尽枚举的特性
  when (response) {
    is ApiResponse.Ok -> {/**/}
    is ApiResponse.BizError -> {/**/}
    is ApiResponse.OtherError -> {/**/}
  }
}
```

### 加点 nullable 的语法糖

我们将异常体现在类型系统，而不是抛出来，这样安全得多。但是绝大部分场景调用方不需要，也不应该做这样详细的异常处理。所以我们加上一对扩展函数，让调用方能够使用 Kotlin nullable 的语法糖：

```kotlin
fun <T> ApiResponse<T>.getOrNull(): T? = when(this) { // highlight-line
  is Ok -> data
  is BizError, is OtherError -> null
}
fun <T> ApiResponse<T>.getOrThrow(): T = when(this) { // highlight-line
  is Ok -> data
  is BizError -> throw BizException(errcode, msg)
  is OtherError -> throw throwable
}

class BizException(
  val errcode: Int
  override val msg: String
): RuntimeException()

// 调用方
lifecycleScope.launch {
  retrofit.create<UserApi>()
    .getUser(1)
    .getOrNull() // highlight-line
    ?.let { binding.nameLabel.text = it.name }
}
```

函数的命名参考了 Kotlin 标准库类似 `get` `getOrNull` , `first` `firstOrNull` 这样的约定：第一类抛出异常，第二类返回 nullable 类型。考虑到客户端抛异常非常危险，我们将 `get`
命名为 `getOrThrow`，在方法名上进行强调。（实际上也可以考虑不加抛异常的版本，项目里估计没人用。）

### 借鉴 Swift 的 `guard` 关键字

`getOrNull` 常用于后接一个 `?.let` 只处理成功情况：如果请求成功，用这个数据 `it` 更新 UI，否则什么也不发生。 如果失败的情况需要做些动作，可以用 if / else 或者 when 判断类型：

```kotlin
val response = retrofit.create<UserApi>().getUser(1)

if (response is ApiResponse.Ok) {
  val user: User = response.data
  // ...
} else {
  // 更新 UI 展示异常状态
  pageState.value = PageState.Error
}
```

if ... else 如果嵌套过多会让代码可读性变差，使用提前退出（early exit）的风格，我们先处理失败的情况并退出当前块， 这样成功的 case 一路向下，更加简单清晰：

```kotlin
val response = retrofit.create<UserApi>.getUser(1)

if (response !is ApiResponse.Ok) {
  pageState.value = PageState.Error
  return // highlight-line
}

val user: User = response.data
// ...
// 拿到非 null 的 User 继续后面的业务逻辑
```

但是有人认为 early exit 的风格不够健壮，因为有可能会忘记写提前退出的 return，造成逻辑错误。

Swift 是如此喜爱 early exit，专门为此加了个关键字 `guard`。guard 类似 if， 但是多了一层保证：编译器会确保 else 块里面 return 或者 throw，退出当前块，使得 early exit 的风格和
if ... else 一样健壮。

```swift
guard let user = getUser(1) else {
  pageState.value = PageState.Error
  return
}

// ...
// 拿到非 null 的 User 继续后面的业务逻辑
```

在 Kotlin 中我们可以借助 inline 的扩展函数实现类似效果。其中关键是 block 返回值是 `Nothing`：

```kotlin
inline fun <T> ApiResponse<T>.guardOk(
  block: () -> Nothing // highlight-line
): T {
    if (this !is ApiResponse.Ok<T>) {
        block()
    }
    return this.data
}

val user: User = retrofit.create<UserApi>
  .getUser(1)
  .guardOk {
    pageState.value = PageState.Error
    return@launch // highlight-line
  }

// ...
// 拿到非 null 的 User 继续后面的业务逻辑
```

## 实现：Retrofit Call Adapter

为了让 Retrofit 捕获所有异常，我们写一个 `CatchingCallAdapterFactory`, 继承 Retrofit 的 `CallAdapter.Factory`。
这个 `CatchingCallAdapterFactory` 暴露一个 `ErrorHandler` 用于配置全局的异常处理逻辑。

```kotlin
val retrofit = Retrofit.Builder()
  .baseUrl(/**/)
  .addCallAdapterFactory(CatchingCallAdapterFactory( // highlight-line
    object: CatchingCallAdapterFactory.ErrorHandler {
      // 如果是业务逻辑异常给用户展示错误信息
      override fun onBizError(errcode: Int, msg: String) {
        toast("$errcode - $msg")
      }
      // 如果是其他异常进行上报
      override fun onOtherError(throwable: Throwable) {
        report(throwable)
      }
    }  
  ))
  //...
```

`CatchingCallAdapterFactory` 参考实现：

```kotlin
class CatchingCallAdapterFactory(
  val defaultErrorHandler: ErrorHandler? = null
) : CallAdapter.Factory() {

  // 用于配置全局的异常处理逻辑
  interface ErrorHandler {
    fun onBizError(errcode: Int, msg: String)
    fun onOtherError(throwable: Throwable)
  }

  override fun get(
    returnType: Type, 
    annotations: Array<out Annotation>, 
    retrofit: Retrofit
  ): CallAdapter<*, *>? {
    // suspend 函数在 Retrofit 中的返回值其实是 `Call`
    // 例如：Call<ApiResponse<User>>
    if (getRawType(returnType) != Call::class.java) return null
    check(returnType is ParameterizedType)

    // 取 Call 里边一层泛型参数
    val innerType: Type = getParameterUpperBound(0, returnType)
    // 如果不是 ApiResponse 则不由本 CallAdapter.Factory 处理
    if (getRawType(innerType) != ApiResponse::class.javava) return null
    
    // 获取后续代理
    val delegate: CallAdapter<*, *> = retrofit
      .nextCallAdapter(this, returnType, annotations)

    return CatchingCallAdapter(
      innerType, 
      retrofit, 
      delegate, 
      defaultErrorHandler
    )
  }

  class CatchingCallAdapter(
    val dataType: Type,
    val retrofit: Retrofit,
    val delegate: CallAdapter<*, *>,
    val errorHandler: ErrorHandler?
  ) : CallAdapter<Any, Call<Any>> {
    override fun responseType(): Type 
        = delegate.responseType()
    override fun adapt(call: Call<Any>): Call<Any> 
        = CatchingCall(call, dataType as ParameterizedType, errorHandler)
  }

  class CatchingCall(
    private val delegate: Call<Any>,
    private val wrapperType: ParameterizedType,
    private val errorHandler: ErrorHandler?
  ) : Call<Any> {
  
    override fun enqueue(
      // suspend 其实是 callback
      // suspend 的返回值通过这个 callback 传递
      callback: Callback<Any>
    ): Unit = delegate.enqueue(object : Callback<Any> {
      override fun onResponse(call: Call<Any>, response: Response<Any>) {
        // 无论请求响应成功还是失败都回调 Response.success
        if (response.isSuccessful) {
          val body = response.body()
          if (body is ApiResponse.BizError<*>) {
            errorHandler?.onBizError(body.errcode, body.msg)
          }
          callback.onResponse(this@CatchingCall, Response.success(body))
        } else {
          // 自定义的 Exception
          val throwable = Non200HttpCodeException(response.code(), response)
          errorHandler?.onOtherError(throwable)
          callback.onResponse(
            this@CatchingCall,
            Response.success(ApiResponse.OtherError(throwable))
          )
        }
      }

      override fun onFailure(call: Call<Any>, t: Throwable) {
        errorHandler?.onOtherError(t)
        callback.onResponse(
          this@CatchingCall,
          Response.success(ApiResponse.OtherError<Any>(t))
        )
      }
    })

    override fun clone(): Call<Any> = CatchingCall(delegate, wrapperType, errorHandler)
    override fun execute(): Response<Any> = throw UnsupportedOperationException("Blocking call in suspend function?")
    override fun isExecuted(): Boolean = delegate.isExecuted
    override fun cancel(): Unit = delegate.cancel()
    override fun isCanceled(): Boolean = delegate.isCanceled
    override fun request(): Request = delegate.request()
    override fun timeout(): Timeout = delegate.timeout()
  }
}
```

## 实现：Retrofit ConverterFactory

针对 `ApiResponse` 的不同 case，我们需要配置自定义 JSON 反序列化解析的逻辑。 Retrofit 可以通过 `addConverterFactory` 注入自定义的类型转换器（不一定仅仅是 JSON
数据格式，也可以是 XML，Protocol Buffers 等）， 适配不同的反序列化库。

### JSON 反序列化库的选择

目前，Kotlin 项目推荐使用 Moshi。Moshi 相比 Gson 对 Kotlin 的支持更加完善。比如下面这个例子：

```kotlin
data class User(
  val name: String
)

val user = gson.fromJson("{}", User::class.java)

println(user) // User(name=null)
user.name.length 💣// NullPointerException!
```

Gson 通过反射创建出一个 `User` 类型的对象，但是 Gson 并不区分 Kotlin 的可空/非空类型，直接返回了属性都是 null 的对象，导致我们后续使用这个“残缺”对象的时候抛出空指针异常。
我们的 `CatchingCallAdapter` 理应捕获包括反序列化在内的所有异常，但是 Gson 这样的行为逃过了我们的异常捕获逻辑，隐患侵入了业务逻辑代码。

Moshi 没有这样的问题，拿到无法解析的数据会统一抛出 `JsonDataException`。`CatchingCallAdapter` 捕获后会处理成 `ApiResponse.OtherError`。

Moshi 对比 Gson 的优势可以参考下面的链接：

- [Uber Shared Doc](https://github.com/uber-archive/shared-docs/blob/master/Moshi.md)
- [Reddit: Why use Moshi over Gson](https://www.reddit.com/r/androiddev/comments/684flw/why_use_moshi_over_gson/)
- [Reddit: JSON to Kotlin data class](https://www.reddit.com/r/Kotlin/comments/exmp2s/json_to_kotlin_data_class/)

> Please don't use Gson. 2 out of 3 maintainers agree: it's deprecated. Use Moshi, Jackson, or kotlinx.serialization
> which all understand Kotlin's nullability.
> Gson does not and will do dumb things, and it won't be fixed. Please abandon it.
>
> <cite>Signed, a Gson maintainer.</cite>


[[tip | “]]
| 请不要再使用 Gson 了。Gson 三位维护者中有两位认为 Gson 实际上已经废弃了，请考虑使用 Moshi、Jackson 或者 kotlinx.serialization。 
| 这些库都支持 Kotlin 的可空类型，而 Gson 不支持，同时还有其他愚蠢的问题，不会被修复。请抛弃它。 
| 落款：一位 Gson 维护者。

上面引用的是 Jake Wharton 的观点。新项目建议优先考虑 Moshi，已经用了 Gson 的项目迁移有一定风险，建议慎重。

使用 Moshi ，目前有下面几种选项：

1. 和 Gson 一样使用反射，但是需要间接依赖 2.5 MiB 大小的 `kotlin-reflect`;
2. 使用注解处理器为所有标记 `@JsonClass(generateAdapter = true)` 的类生成 `JsonAdapter`；
3. 同 2 代码生成，但是不用注解处理器，而是使用 [Kotlin Symbol Processing](https://github.com/google/ksp)；
4. 类似 1，但是使用 kotlinx-metadata，比 kotlin-reflect 更加轻量级。

其中 3 和 4 在 [MoshiX](https://github.com/ZacSweers/MoshiX) 项目中，似乎略带有试验性质；
另外需要注意代码生成的好处是性能更高，但是生成的代码占用体积也不小，并且需要显式地为所有需要反序列化的类配置相应的 `JsonAdapter`，对已有的项目有一些侵入性。

[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 是 Kotlin 官方出品的序列化/反序列化方案，也是注解标记，代码生成的方案。
但是代码生成集成在编译器中（类似 [`@Parcelize`](https://developer.android.com/kotlin/parcelize?hl=zh-cn) 和 KSP），开发体验可能更好，Kotlin
特性支持更加丰富，应该是 Kotlin 上的首选方案。但暂不支持流式解析，[见此 issue](https://github.com/Kotlin/kotlinx.serialization/issues/204)。

综合来看，目前似乎可以先使用 Moshi，等 kotlinx.serialization 成熟后搜索替换注解进行迁移。

### MoshiApiResponseTypeAdapterFactory

下面是参考实现，Gson 大同小异：

```kotlin
class MoshiApiResponseTypeAdapterFactory : JsonAdapter.Factory {

  override fun create(type: Type, annotations: MutableSet<out Annotation>, moshi: Moshi): JsonAdapter<*>? {
    val rawType = type.rawType
    if (rawType != ApiResponse::class.java) return null

    // 获取 ApiResponse 的泛型参数，比如 User
    val dataType: Type = (type as? ParameterizedType)
      ?.actualTypeArguments?.firstOrNull() 
      ?: return null
        
    // 获取 User 的 JsonAdapter
    val dataTypeAdapter = moshi.nextAdapter<Any>(
      this, dataType, annotations
    )

    return ApiResponseTypeAdapter(rawType, dataTypeAdapter)
  }

  class ApiResponseTypeAdapter<T>(
    private val outerType: Type,
    private val dataTypeAdapter: JsonAdapter<T>
  ) : JsonAdapter<T>() {
    override fun fromJson(reader: JsonReader): T? {
      reader.beginObject()

      var errcode: Int? = null
      var msg: String? = null
      var data: Any? = null

      while (reader.hasNext()) {
        when (reader.nextName()) {
          "errcode" -> errcode = reader.nextString().toIntOrNull()
          "msg" -> msg = reader.nextString()
          "data" -> data = dataTypeAdapter.fromJson(reader)
          else -> reader.skipValue()
        }
      }

      reader.endObject()
      
      return if (errcode != 0)
        ApiResponse.BizError(
          errcode ?: -1, 
          msg ?: "N/A"
        ) as T
      else ApiResponse.Ok(
        errcode = errcode, 
        data = data
      ) as T?
    }

    // 不需要序列化的逻辑
    override fun toJson(writer: JsonWriter, value: T?): Unit 
      = TODO("Not yet implemented")
  }
}
```

使用：

```kotlin
private val moshi = Moshi.Builder()
  .add(MoshiApiResponseTypeAdapterFactory()) // highlight-line
  .build()

val retrofit = Retrofit.Builder()
  .baseUrl(/**/)
  .addCallAdapterFactory(CatchingCallAdapterFactory(
    object: CatchingCallAdapterFactory.ErrorHandler {
      // 如果是业务逻辑异常给用户展示错误信息
      override fun onBizError(errcode: Int, msg: String) {
        toast("$errcode - $msg")
      }
      // 如果是其他异常进行上报
      override fun onOtherError(throwable: Throwable) {
        report(throwable)
      }
    }  
  .addConverterFactory( // highlight-line
    MoshiConverterFactory.create(moshi) // highlight-line
  )
  // 配置 OkHttp，API 鉴权等逻辑在这里配置
  .client(/**/)
  .build()

```

## One More Thing：使用 Result 作为返回值

文章开头的例子使用 Kotlin 标准库提供的 `runCatching` 方法进行 try catch。`runCatching`
方法的返回值是 [Result](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/)，上面提供了很多有用的方法：

```
isFailure
isSuccess
exceptionOrNull()
getOrNull()

fold(onSuccess, onFailure)
getOrDefault(defaultValue)
getOrElse(onFailure)
getOrThrow

onFailure(action)
onSuccess(action)

...
```

之前 Kotlin 不允许将 Result 作为函数的返回值。 这个限制在 Kotlin 1.5 中被去除。 这样我们可以考虑用 Result 作为 Retrofit interface 方法的返回类型：

```kotlin
// 需要 Kotlin 1.5
suspend fun getUser(id: Int): Result<User>
```

使用 Result 的话调用方可以拿到异常信息，但是无法在最外层区分 `BizError` 和 `OtherError`。 不过实际看下来几乎没有调用方需要做这样的区分，让这种极少用到的 case 变得麻烦一些似乎是好的权衡。

更加令人期待的是 Kotlin [计划让 nullable 的操作符同样适用于 Result](https://github.com/Kotlin/KEEP/pull/244)，于是我们可以这样写：

```kotlin
// 需要 Kotlin 1.5，以及尚未发布的特性

// 调用示例 1：
lifecycleScope.launch {
  retrofit.create<UserApi>()
    .getUser(1) // highlight-line
    ?.let { binding.nameLabel.text = it.name } // highlight-line
}

// 调用示例 2：
lifecycleScope.launch {
  val user: User = retrofit.create<UserApi>()
    .getUser(1) // highlight-line
    ?.run { return@launch } // highlight-line
  // 拿到非 null 的 User 继续后面的业务逻辑
}
```

可以看到，前文描述的扩展函数都可以去掉了。

## 参考资料

- Roman Elizarov: [Kotlin and Exceptions](https://elizarov.medium.com/kotlin-and-exceptions-8062f589d07)
