---
title: 为何 JS 的 map 中不能使用 String.prototype.trim？
date: "2018-06-02T22:17:00.200Z"
---

假设有一个元素为字符串的数组 `[' some ', ' strings ']`，我们需要清除字符串中前后空白字符，首先想到：
```javascript
[' some ', ' strings '].map(s => s.trim())
```
<!-- excerpt end -->
进一步优化，考虑将 map 中包裹的函数去掉，直接使用 String.prototype.trim。然而问题出现了：
```javascript
[' some ', ' strings '].map(String.prototype.trim)
// TypeError: String.prototye.trim called on null or undefined (Chrome)
// TypeError: can't convert undefined to object (Firefox)
```

## map 的第二个参数
造成错误的原因在于 Array.prototype.map 有一个易被忽视的第二个参数：
```javascript
var new_array = arr.map(function callback(currentValue[, index[, array]]) {
    // Return element for new_array
}[, thisArg])
```
其中的 thisArg 指定了执行 callback 时要绑定的 this 的值，我们把这个 this 打印出来：
```javascript
[' some ', ' strings '].map(function (s) {
  console.log(this) // 全局对象或者 undefined
  return s
}) // [' some ', ' strings ']

[' some ', ' strings '].map(function (s) {
  console.log(this) // 'hello world'
  return s
}, 'hello world') // [' some ', ' strings ']
```

## JS 的 *方法* 与 prototype
我们知道，trim、map 这些方法定义在 String，Array 等内置对象中。这些方法的实现集成在 JS 的运行环境中。这里参考一个 String.prototype.trim 的 polyfill：
```javascript
String.prototype.trim = function () {
  return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};
```
当我们调用`" str ".trim()` 的时候，字符串字面量被转成 String 对象，`.` 操作符将此对象绑定为 String.prototype.trim() 的 this 值并执行此函数。
可以看到，trim 操作的字符串是 this 的值，而非函数传进来的参数。如果不显式地进行绑定，内置对象 prototype 上定义的函数中的 this 似乎会有个默认的初始值。比如：
```javascript
String.prototype.r = function () { return this }
String.prototype.r() // String { "" }
String.prototype.r() instanceof String // 但这里是 false

// trim 操作的是 this 的值，并非传入的参数
String.prototype.trim() // ""
String.prototype.trim(" abc ") // ""
```
Array.prototype.map 中的第二个参数正好又是另一种绑定 this 的方式，通常我们不传这个参数，map 回调函数中的 this 为 undefined。String.prototype.trim 中的 this 被绑成了 undefined，导致了 TypeError，相当于如下情况：
```javascript
String.prototype.trim.bind(undefined)()
// TypeError: String.prototye.trim called on null or undefined
```

## Function.prototype.call
有一种解法：
```javascript
[' some ', ' strings '].map(Function.prototype.call, String.prototype.trim)
// ['some', 'strings']
```
Function.prototype.call 是另一种修改函数调用时绑定的 this 的方法：
```javascript
" str".trim() // "str"
// 等价于以下函数调用
String.prototype.trim.call(" str") // "str"
String.prototype.trim.bind(" str")() // "str
```
我们在 map 的第一个参数中传入 Function.prototype.call，其中的 this 被绑定到传入的第二个参数 String.prototype.trim，类似如下代码：
```javascript
[' some ', ' strings '].map(function (s) {
  console.log(this) // String.prototype.trim
  return this.call(s)
}, String.prototype.trim)
```

## 总结
上述的解法非常奇妙，实际开发中还是应当避免类似谜一般的代码。这个具体的使用场景推荐使用 `[' some ', ' strings '].map(s => s.trim())` 这种方法。

不过这一问题的学习有助于加深对 JS prototype 以及函数等语言特性的理解。

我们一般将“属于”对象的函数称作方法。作为方法的函数一般通过 this 操作对象内包含的数据。JS 借助 prototype 机制在语义上实现了这样一套机制。然而实际上在对象中定义的方法与一般的函数并没有什么本质的差异，只是对象恰好保存了对这个函数的一个引用。即使普通的函数也能操作 this，具体 this 所绑定的值和包含的对象并没有直接的关联。

JS 的 this，prototype 等机制应当是为了在动态语言中实现面向对象范式而设计。函数（方法）通过操作 this 而非函数的参数，实现了类似 `s.trim()` 的调用方法，形成了面向对象的“假象”。最近看 Python 的类也有几分相似之处，class 中的函数仅仅通过 self 互相联系，与 JS 的 this 十分类似，只是 Python 的“方法”将 self 显式地列为函数的参数，而 JS 的 this 是隐含的，可以被一些特殊的方式篡改，变得有些难以捉摸。
```python
class SomeJob():
  def __init__(self, date):
    self.date = date
  def run(self):
    print(self.date)
```

map 是函数式的经典套路。理想情况下 map 的函数应当是一个纯函数，比如调用 jQuery 的 trim 函数会显得更加优雅一些：
```javascript
[' some ', ' strings '].map($.trim)
```
然而 JS 标准库中的 String.prototype.trim 操作的是 this，并非一个纯函数，这就导致了本文所讲的问题。

## 遗留问题
在 Firefox 61 中测试似乎 map 的第二个参数是无效的。


## 参考资料
* [javascript - Why won't passing `''.trim()` straight to `[].map()`'s callback work? - Stack Overflow](https://stackoverflow.com/questions/9304007/why-wont-passing-trim-straight-to-maps-callback-work)
* [Array.prototype.map() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
* [String.prototype.trim() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
* [Seva Zaikov - The Most Clever Line of JavaScript](https://blog.bloomca.me/2017/11/08/the-most-clever-line-of-javascript.html)
* [ECMAScript 2015 Language Specification – ECMA-262 6th Edition](https://www.ecma-international.org/ecma-262/6.0/)