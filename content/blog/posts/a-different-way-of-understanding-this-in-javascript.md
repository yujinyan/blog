---
title: JavaScript this 新解
translate:
    url: http://2ality.com/2017/12/alternate-this.html
    title: A different way of understanding this in JavaScript
    author: Dr. Axel Rauschmayer
date: 2018-05-19T01:17:03.284Z
---
本文尝试从一个新的视角解释 JavaScript 中 this 关键字的工作机制：我们假设箭头函数（arrow functions）是真正的函数，而普通的函数只是一种特殊的语法构造（language construct）。我认为这种解释可以使 `this` 更好理解，可以尝试一下。

## 1. 两种函数
本文着重观察两种不同的函数：
* 普通函数：`function () {}`
* 箭头函数：`() => {}`

### 1.1 普通函数
我们这样定义一个普通函数：
```javascript
function add(x, y) {
    return x + y;
}
```
每一个普通函数在被调用的时候都隐含一个 this。也就是说在 strict 模式下，以下两种表达式是等价的：
```javascript
add(3, 5);
add.call(undefined, 3, 5);
```
如果嵌套普通函数的话，this 会被覆盖（shadowed）：
```javascript
function outer() {
    function inner() {
        console.log(this); // undefined
    }

    console.log(this); // 'outer'
    inner();
}
outer.call('outer');
```
在 inner() 内部的 this 和 outer() 的 this 不同。inner() 内部有自己的 this。
我们假设 this 是显示声明的变量，那么代码会长这样：
```javascript
function outer(_this) {
    function inner(_this) {
        console.log(_this); // undefined
    }

    console.log(_this); // 'outer'
    inner(undefined);
}
outer('outer');
```
inner() 覆盖了 outer() 中的 this，这一规律同样适用于嵌套的作用域：
```javascript
const _this = 'outer';
console.log(_this); // 'outer'
{
    const _this = undefined;
    console.log(_this); // undefined
}
```
由于普通函数总是会有一个隐含的参数 this，或许应该称这些函数“方法”更为合适。

### 1.2 箭头函数
我们这样定义一个箭头函数（我使用了一个块来定义，这样看上去跟普通函数更像）：
```javascript
const add = (x, y) => {
    return x + y;
};
```
如果你将箭头函数嵌套在普通函数内部，this 不会被覆盖：
```javascript
function outer() {
    const inner = () => {
        console.log(this); // 'outer'
    };
    console.log(this); // 'outer'
    inner();
}
outer.call('outer');
```
鉴于箭头函数的这种特点，我会称之为“真正的函数”。相比普通函数，箭头函数和其他大多数编程语言中的函数更加相似。
值得注意的是，箭头函数中的 this 的值甚至不会受到 .call() 以及其他任何东西的影响。this 只取决于箭头函数被创建时所处在的作用域。例如：
```javascript
function ordinary() {
    const arrow = () => this;
    console.log(arrow.call('goodbye')); // 'hello'
}
ordinary.call('hello');
```

### 1.3 作为方法的普通函数
如果普通函数是一个对象的属性，那么这个函数是一个方法：
```javascript
const obj = {
    prop: function () {}
};
```
访问对象属性的一种方法是通过点（.）操作符。这一操作符有两种不同的模式：
* 获取或者设置属性：`obj.prop`
* 调用方法：`obj.prop(x, y)`
后者等价于：
```javascript
obj.prop.call(obj, x, y)
```
从中可以看到，当普通函数被调用的时候，总是携带一个隐含的 this。
JavaScript 中还有一个更简单的特殊语法定义方法：
```javascript
const obj = {
    prop() {}
};
```

## 2. 常见错误
我们借助前文的观点分析以下几个常见错误。

### 2.1 错误：在回调函数（以 Promise 为例）中访问 this
在下面由 Promise 构成的代码例子中，当异步函数 cleanupAsync() 完成后打出 log “Done”。
```javascript
// 在某个类或对象字面量中:
performCleanup() {
    cleanupAsync()
    .then(function () {
        this.logStatus('Done'); // (A)
    });
}
```
代码执行到行 (A) 的 `this.logStatus()` 会出错。错误之处在于这一行的 this 和 `.performCleanup()` 的 this 是不同的。回调函数自己的 this 覆盖了外层的 this。也就是说，我们在应该使用箭头函数的地方用了普通函数。换成箭头函数之后代码运行正常：
```javascript
// 在某个类或对象字面量中:
performCleanup() {
    cleanupAsync()
    .then(() => {
        this.logStatus('Done');
    });
}
```

### 2.2 错误：在回调函数（以 .map 为例）中访问 this
类似地，下面的代码会在行 (A) 出错。原因在于回调函数覆盖了 `.prefixNames()` 方法的 this。
```javascript
// 在某个类或对象字面量中:
prefixNames(names) {
    return names.map(function (name) {
        return this.company + ': ' + name; // (A)
    });
}
```
同样地，换成箭头函数即可：
```javascript
// 在某个类或对象字面量中:
prefixNames(names) {
    return names.map(
        name => this.company + ': ' + name);
}
```

### 2.3 错误：将方法作为回调
假设有以下 UI 组件代码：
```javascript
class UiComponent {
    constructor(name) {
        this.name = name;

        const button = document.getElementById('myButton');
        button.addEventListener('click', this.handleClick); // (A)
    }
    handleClick() {
        console.log('Clicked ' + this.name); // (B)
    }
}
```
在行 (A)，UiComponent 设置了点击事件的响应函数。然而不幸的是，事件真的触发之后会报错：
```
TypeError: Cannot read property 'name' of undefined
```
这是什么原因？在行(A)，我们使用了普通的属性访问语法，这里的 `.` 并不是特殊的方法调用语法。这句话的含义是将存在 handleClick 中的函数设为响应函数，大致和下面的代码等同：
```javascript
const handler = this.handleClick;
handler();// 等价于: handler.call(undefined);
```
这就造成了行(B) `this.name` 出错。
那我们怎么修复这个 this ？这里的问题是点操作符在作调用方法的时候并不是简单地读取属性然后调用函数。我们需要在获取到方法之后，借助 .bind() 手动补上缺失的一环，给 this 赋上值，如行 (A) 所示：
```javascript
class UiComponent {
    constructor(name) {
        this.name = name;

        const button = document.getElementById('myButton');
        button.addEventListener(
            'click', this.handleClick.bind(this)); // (A)
    }
    handleClick() {
        console.log('Clicked '+this.name);
    }
}
```
这样就可以修复 this 的问题。函数调用的时候 this 的值不会改变。
```javascript
function returnThis() {
    return this;
}
const bound = returnThis.bind('hello');
bound(); // 'hello'
bound.call(undefined); // 'hello'
```

## 3. 防止出错的准则
最简单的办法就是避免使用普通函数，只用方法定义或者箭头函数。
但是我还是喜欢函数定义的语法。函数提升（hoisting）在有些时候还是有用处的。如果在普通函数中避免使用 this 同样可以防止出错。有一个 [ESLint 规则](https://eslint.org/docs/rules/no-invalid-this) 可以帮助你确保这一点。

### 3.1 不要将 this 作为一个参数使用
有些 API 喜欢通过 this 传递一些类似于参数的信息。我不太喜欢这种做法。这样做使得我们无法使用箭头函数，违背了前面提到准则。

举一个例子，下面的代码里面，beforeEach() 通过 this 传递了一个 API 对象：
```javascript
beforeEach(function () {
    this.addMatchers({ // 访问 API 对象
        toBeInRange: function (start, end) {
            ···
        }
    });
});
```
这个函数应该改成：
```javascript
beforeEach(api => {
    api.addMatchers({
        toBeInRange(start, end) {
            // ···
        }
    });
});
```

## 4.更多阅读
* Blog post “[JavaScript’s this: how it works, where it can trip you up](http://2ality.com/2014/05/this.html)” [an in-depth look at this]
* Chapter “[Callable entities in ECMAScript 6](http://exploringjs.com/es6/ch_callables.html)” in “Exploring ES6”