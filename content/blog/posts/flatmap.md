---
title: "谈谈 flatMap"
date: "2017-11-25T22:12:03.284Z"
---
前一阵子在 Twitter 上看到 GitHub 上✨星星✨最多的 Sindre Sorhus 分享了一段 Swift 代码

```swift
// view.subviews(ofType: BoxView.self)
fun subviews<T: NSView>(ofType type: T.Type) -> [T] {
    return subviews.flatMap { $0 as? T}
}
```
正好借机跟 Swifter 好友交流切磋一番，然发现自己概念有些模糊还需修炼一下，所以发个总结的文章交作业。
 
## 数组
💡 简而言之，flatMap 就是两个步骤，先 map 再 flatten：
```swift
let nested = [
    [1, 2], [3, 4], [5, 6]
]
let flattened = nested.flatMap { return $0.map { $0 * $0 } }
// [2, 4, 9, 16, 25, 36]
```
传入 flatMap 闭包中的 `$0` 在循环中依次等于 `[1, 2]`，`[3, 4]`，`[5, 6]`，我们对里层数组进行 map 变换之后，flatMap 函数会将产生的结果拼接在一起成为一个新的一维数组。
 
值得注意的是，在学习 flatMap 的时候似乎容易陷入二维数组转为一维数组的局限。实际上 flatMap 的语意与被 flatMap 操作的对象并没有太大关系。关键是传入 flatMap 的闭包函数的返回值是一个数组，而 map 的闭包函数的返回值是一个值。
 
```swift
let ints = [1, 2, 3]
 
numbers.flatMap { [$0, $0] } // [1, 1, 2, 2, 3, 3]
numbers.map { $0 } // [1, 2, 3]
numbers.flatMap { $0 } // [1, 2, 3]，如果闭包函数不返回数组类型则和 map 效果一样
```
所以说 flatMap 只是将每一次 map 得到的数组全部拼在一起合成一个数组。
 
JS 的数组比较遗憾地没有提供 flatMap 方法，需要自己实现：
```javascript
Array.prototype.flatMap = function(f) {
    // 先 map，然后再 concat 结果
    return Array.prototype.concat.apply([], this.map(f));
};
```
 
## 可选值
Java 8 的可选值：
```java
public class Computer {
  private Optional<Soundcard> soundcard = Optional.empty();
  public Optional<Soundcard> getSoundcard() {
    return soundcard;
  }
}
 
public class Soundcard {
  private Optional<USB> usb = Optional.empty();
  public Optional<USB> getUSB() {
    return usb;
  }
}
 
public class USB {
  public String getVersion() {
    return "3.0";
  }
}
 
public class Main {
    public static void main(String[] args) {
        Optional<Computer> computer = Optional.of(new Computer());
        String name = computer
                .flatMap(Computer::getSoundcard) // 👈
                .flatMap(Soundcard::getUSB) // 👈
                .map(USB::getVersion) // 👈
                .orElse("UNKNOWN");
 
        System.out.println(name); // "UNKNOWN"
    }
}
```
 
这里的 Optional 是一个通过泛型包裹其他类型的容器。`Optional<T>` 可以包裹类型为 T 的对象，也可以是空。
 
`flatMap` 在这套 api 里起到了传递 Optional 的作用。观察 `flatMap` 接受的函数的类型都是 `T->Optional<U>` ，也就是说这个操作符拿到 Optional 容器内的值，然后返回了一个新的 Optional 容器，其中包含的值的类型未必和原先的一致。由于空对象不再以 `null` 的形式出现，而是被包在了 Optional 容器之中，这样就可以链式调用，避免空指针异常。如果在调用的过程中有一个 Optional 中为空值，则最终返回通过 `orElse` 提供的默认值。
 
相比 Java 借助泛型，在标准库中实现 Optional 辅助类，Swift 有专门的语法 (Syntax) 来表达可选值，写起来可能更爽一些。
```swift
let optionalNumbers = [1, 2, nil, 3]
numbers.flatMap { $0 } // [1, 2, 3]
```
Swift 的 flatMap 还有比较奇特的作用：会自动 filter 掉 nil。不过仔细一想也是符合 flatMap 的语义的。上面 `optionNumbers` 的类型是 `[Int?]`， 经过 flatMap 闭包函数的转换，每一个 `Int?` 变成了 `T?` 最终 flatMap 会拆掉可选值的包裹返回 `T`
 
开头那段优雅的代码就是用了这个特性。Swift 的 `as?` 尝试将对象 cast 为一个类型，返回的是一个可选值，如果 cast 失败则为 nil，这样类型不符合传入类型的 view 就被筛选掉了。
 
在 JS 里面类似的操作还是可以直接通过 `filter`，似乎比用 `flatMap` 更加直接一些
```javascript
[1, 2, null, 3].filter(Boolean) // [1, 2, 3]
```
 
## Rx
先简单粗暴地贴一段曾经写的 Android 即时搜索功能相关的代码，真是蔚为壮观 😂
```java
RxTextView.textChanges(etSearch)
  .debounce(500, TimeUnit.MILLISECONDS)
  .observeOn(AndroidSchedulers.mainThread())
  .filter(new Predicate<CharSequence>() {
    @Override
    public boolean test(@NonNull CharSequence charSequence) throws Exception {
      return !TextUtils.isEmpty(charSequence);
    }
  })
  .filter(new Predicate<CharSequence>() {
    @Override
    public boolean test(CharSequence charSequence) throws Exception {
      return isSelected();
    }
  })
  .observeOn(AndroidSchedulers.mainThread())
  .doOnNext(new Consumer<CharSequence>() {
    @Override
    public void accept(@NonNull CharSequence charSequence) throws Exception {
      swipeRefreshLayout.setRefreshing(true);
    }
  })
  .observeOn(Schedulers.io())
  // 👇
  .switchMap(new Function <CharSequence, Observable <? extends List <?>>> () {
    @Override
    public Observable <? extends List <?>> apply(@NonNull CharSequence charSequence) throws Exception {
      return callApi(charSequence.toString());
    }
  })
  .subscribeOn(Schedulers.io())
  .observeOn(AndroidSchedulers.mainThread())
  .subscribe(new Observer<List<?>>() {
      @override
      public void onNext(List<?> searchTips) {
        swipeRefreshLayout.setRefreshing(false);
        data = searchTips;
        setUpContentView(data);
      }
      // ...
  });
```
在 Rx 系列中，Observable 是一个对事件流的封装，流可以看作是包裹着数据的容器。这里的 TextView 的 textChange 是事件源，首先经过两个 filter（忽略一下其他操作线程、副作用的操作符）将一些不符合要求的事件流排除在外，然后经过 switchMap 操作符。switchMap 和 flatMap 用法较为相似。在这里我们向服务器发送请求获取即时搜索的数据，是一个异步的操作。switchMap 相比 flatMap 在接受到上游发过来的新数据之后，前面尚未完成的异步操作会直接被丢弃，因此比较符合这个功能场景。
 
可以发现，两个 filter 的闭包函数的类型相当于是 `string -> bool`，而 switchMap 的闭包函数的类型相当于 `string -> Observable<List<?>>` ，返回值是一个 Observable 容器。switchMap 操作符会将其中的数据取出来（也就是等接口数据调出来之后）放到 Observable 里传递下去。
 
## 小结
借助上面的例子可以看到 flatMap 的基本语义是相通的。在学习这些操作符时或许可以更多地关注传入的闭包函数的类型以及操作符变换的实质。相信 flatMap 以及函数式编程还有更多有趣的内容值得继续学习发掘。
 
## 参考资料
* https://repl.it/@yujinyan1992/RxJS-vs-Array-Methods
* https://repl.it/@yujinyan1992/Learning-Swift
* https://www.natashatherobot.com/swift-2-flatmap/
* https://gist.github.com/samgiles/762ee337dff48623e729
* [Swift 烧脑体操（四） - map 和 flatMap](http://www.infoq.com/cn/articles/swift-brain-gym-map-and-flatmap)