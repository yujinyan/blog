webpackJsonp([0xba91cb149269],{514:function(n,s){n.exports={data:{site:{siteMetadata:{title:"🐟 Blog",author:"Yu Jinyan"}},markdownRemark:{id:"C:/Users/yujin/code/blog-gatsby/posts/flatmap.md absPath of file >>> MarkdownRemark",html:'<p>前一阵子在 Twitter 上看到 GitHub 上✨星星✨最多的 Sindre Sorhus 分享了一段 Swift 代码</p>\n<div class="gatsby-highlight">\n      <pre class="language-swift"><code class="language-swift"><span class="token comment">// view.subviews(ofType: BoxView.self)</span>\nfun subviews<span class="token operator">&lt;</span>T<span class="token punctuation">:</span> <span class="token builtin">NSView</span><span class="token operator">></span><span class="token punctuation">(</span>ofType type<span class="token punctuation">:</span> T<span class="token punctuation">.</span><span class="token keyword">Type</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">></span> <span class="token punctuation">[</span>T<span class="token punctuation">]</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> subviews<span class="token punctuation">.</span>flatMap <span class="token punctuation">{</span> $<span class="token number">0</span> <span class="token keyword">as</span><span class="token operator">?</span> T<span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre>\n      </div>\n<p>正好借机跟 Swifter 好友交流切磋一番，然发现自己概念有些模糊还需修炼一下，所以发个总结的文章交作业。</p>\n<h2>数组</h2>\n<p>💡 简而言之，flatMap 就是两个步骤，先 map 再 flatten：</p>\n<div class="gatsby-highlight">\n      <pre class="language-swift"><code class="language-swift"><span class="token keyword">let</span> nested <span class="token operator">=</span> <span class="token punctuation">[</span>\n    <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token number">5</span><span class="token punctuation">,</span> <span class="token number">6</span><span class="token punctuation">]</span>\n<span class="token punctuation">]</span>\n<span class="token keyword">let</span> flattened <span class="token operator">=</span> nested<span class="token punctuation">.</span>flatMap <span class="token punctuation">{</span> <span class="token keyword">return</span> $<span class="token number">0</span><span class="token punctuation">.</span><span class="token builtin">map</span> <span class="token punctuation">{</span> $<span class="token number">0</span> <span class="token operator">*</span> $<span class="token number">0</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>\n<span class="token comment">// [2, 4, 9, 16, 25, 36]</span></code></pre>\n      </div>\n<p>传入 flatMap 闭包中的 <code class="language-text">$0</code> 在循环中依次等于 <code class="language-text">[1, 2]</code>，<code class="language-text">[3, 4]</code>，<code class="language-text">[5, 6]</code>，我们对里层数组进行 map 变换之后，flatMap 函数会将产生的结果拼接在一起成为一个新的一维数组。</p>\n<p>值得注意的是，在学习 flatMap 的时候似乎容易陷入二维数组转为一维数组的局限。实际上 flatMap 的语意与被 flatMap 操作的对象并没有太大关系。关键是传入 flatMap 的闭包函数的返回值是一个数组，而 map 的闭包函数的返回值是一个值。</p>\n<div class="gatsby-highlight">\n      <pre class="language-swift"><code class="language-swift"><span class="token keyword">let</span> ints <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">]</span>\n \nnumbers<span class="token punctuation">.</span>flatMap <span class="token punctuation">{</span> <span class="token punctuation">[</span>$<span class="token number">0</span><span class="token punctuation">,</span> $<span class="token number">0</span><span class="token punctuation">]</span> <span class="token punctuation">}</span> <span class="token comment">// [1, 1, 2, 2, 3, 3]</span>\nnumbers<span class="token punctuation">.</span><span class="token builtin">map</span> <span class="token punctuation">{</span> $<span class="token number">0</span> <span class="token punctuation">}</span> <span class="token comment">// [1, 2, 3]</span>\nnumbers<span class="token punctuation">.</span>flatMap <span class="token punctuation">{</span> $<span class="token number">0</span> <span class="token punctuation">}</span> <span class="token comment">// [1, 2, 3]，如果闭包函数不返回数组类型则和 map 效果一样</span></code></pre>\n      </div>\n<p>所以说 flatMap 只是将每一次 map 得到的数组全部拼在一起合成一个数组。</p>\n<p>JS 的数组比较遗憾地没有提供 flatMap 方法，需要自己实现：</p>\n<div class="gatsby-highlight">\n      <pre class="language-javascript"><code class="language-javascript">Array<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">flatMap</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 先 map，然后再 concat 结果</span>\n    <span class="token keyword">return</span> Array<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span>concat<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre>\n      </div>\n<h2>可选值</h2>\n<p>Java 8 的可选值：</p>\n<div class="gatsby-highlight">\n      <pre class="language-java"><code class="language-java"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Computer</span> <span class="token punctuation">{</span>\n  <span class="token keyword">private</span> Optional<span class="token operator">&lt;</span>Soundcard<span class="token operator">></span> soundcard <span class="token operator">=</span> Optional<span class="token punctuation">.</span><span class="token function">empty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token keyword">public</span> Optional<span class="token operator">&lt;</span>Soundcard<span class="token operator">></span> <span class="token function">getSoundcard</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> soundcard<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n \n<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Soundcard</span> <span class="token punctuation">{</span>\n  <span class="token keyword">private</span> Optional<span class="token operator">&lt;</span>USB<span class="token operator">></span> usb <span class="token operator">=</span> Optional<span class="token punctuation">.</span><span class="token function">empty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token keyword">public</span> Optional<span class="token operator">&lt;</span>USB<span class="token operator">></span> <span class="token function">getUSB</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> usb<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n \n<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">USB</span> <span class="token punctuation">{</span>\n  <span class="token keyword">public</span> String <span class="token function">getVersion</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"3.0"</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n \n<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Main</span> <span class="token punctuation">{</span>\n    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span>String<span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        Optional<span class="token operator">&lt;</span>Computer<span class="token operator">></span> computer <span class="token operator">=</span> Optional<span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Computer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        String name <span class="token operator">=</span> computer\n                <span class="token punctuation">.</span><span class="token function">flatMap</span><span class="token punctuation">(</span>Computer<span class="token operator">:</span><span class="token operator">:</span>getSoundcard<span class="token punctuation">)</span> <span class="token comment">// 👈</span>\n                <span class="token punctuation">.</span><span class="token function">flatMap</span><span class="token punctuation">(</span>Soundcard<span class="token operator">:</span><span class="token operator">:</span>getUSB<span class="token punctuation">)</span> <span class="token comment">// 👈</span>\n                <span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>USB<span class="token operator">:</span><span class="token operator">:</span>getVersion<span class="token punctuation">)</span> <span class="token comment">// 👈</span>\n                <span class="token punctuation">.</span><span class="token function">orElse</span><span class="token punctuation">(</span><span class="token string">"UNKNOWN"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n \n        System<span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "UNKNOWN"</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre>\n      </div>\n<p>这里的 Optional 是一个通过泛型包裹其他类型的容器。Optional<T> 可以包裹类型为 T 的对象，也可以是空。</p>\n<p><code class="language-text">flatMap</code> 在这套 api 里起到了传递 Optional 的作用。观察 <code class="language-text">flatMap</code> 接受的函数的类型都是 <code class="language-text">T-&gt;Optional&lt;U&gt;</code> ，也就是说这个操作符拿到 Optional 容器内的值，然后返回了一个新的 Optional 容器，其中包含的值的类型未必和原先的一致。由于空对象不再以 <code class="language-text">null</code> 的形式出现，而是被包在了 Optional 容器之中，这样就可以链式调用，避免空指针异常。如果在调用的过程中有一个 Optional 中为空值，则最终返回通过 <code class="language-text">orElse</code> 提供的默认值。</p>\n<p>相比 Java 借助泛型，在标准库中实现 Optional 辅助类，Swift 有专门的语法 (Syntax) 来表达可选值，写起来可能更爽一些。</p>\n<div class="gatsby-highlight">\n      <pre class="language-swift"><code class="language-swift"><span class="token keyword">let</span> optionalNumbers <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">nil</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">]</span>\nnumbers<span class="token punctuation">.</span>flatMap <span class="token punctuation">{</span> $<span class="token number">0</span> <span class="token punctuation">}</span> <span class="token comment">// [1, 2, 3]</span></code></pre>\n      </div>\n<p>Swift 的 flatMap 还有比较奇特的作用：会自动 filter 掉 nil。不过仔细一想也是符合 flatMap 的语义的。上面 <code class="language-text">optionNumbers</code> 的类型是 <code class="language-text">[Int?]</code>， 经过 flatMap 闭包函数的转换，每一个 <code class="language-text">Int?</code> 变成了 <code class="language-text">T?</code> 最终 flatMap 会拆掉可选值的包裹返回 <code class="language-text">T</code></p>\n<p>开头那段优雅的代码就是用了这个特性。Swift 的 <code class="language-text">as?</code> 尝试将对象 cast 为一个类型，返回的是一个可选值，如果 cast 失败则为 nil，这样类型不符合传入类型的 view 就被筛选掉了。</p>\n<p>在 JS 里面类似的操作还是可以直接通过 <code class="language-text">filter</code>，似乎比用 <code class="language-text">flatMap</code> 更加直接一些</p>\n<div class="gatsby-highlight">\n      <pre class="language-javascript"><code class="language-javascript"><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span>Boolean<span class="token punctuation">)</span> <span class="token comment">// [1, 2, 3]</span></code></pre>\n      </div>\n<h2>Rx</h2>\n<p>先简单粗暴地贴一段曾经写的 Android 即时搜索功能相关的代码，真是蔚为壮观 😂</p>\n<div class="gatsby-highlight">\n      <pre class="language-java"><code class="language-java">RxTextView<span class="token punctuation">.</span><span class="token function">textChanges</span><span class="token punctuation">(</span>etSearch<span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">debounce</span><span class="token punctuation">(</span><span class="token number">500</span><span class="token punctuation">,</span> TimeUnit<span class="token punctuation">.</span>MILLISECONDS<span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">observeOn</span><span class="token punctuation">(</span>AndroidSchedulers<span class="token punctuation">.</span><span class="token function">mainThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Predicate</span><span class="token operator">&lt;</span>CharSequence<span class="token operator">></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token annotation punctuation">@Override</span>\n    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token annotation punctuation">@NonNull</span> CharSequence charSequence<span class="token punctuation">)</span> <span class="token keyword">throws</span> Exception <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> <span class="token operator">!</span>TextUtils<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span>charSequence<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Predicate</span><span class="token operator">&lt;</span>CharSequence<span class="token operator">></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token annotation punctuation">@Override</span>\n    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">test</span><span class="token punctuation">(</span>CharSequence charSequence<span class="token punctuation">)</span> <span class="token keyword">throws</span> Exception <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> <span class="token function">isSelected</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">observeOn</span><span class="token punctuation">(</span>AndroidSchedulers<span class="token punctuation">.</span><span class="token function">mainThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">doOnNext</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Consumer</span><span class="token operator">&lt;</span>CharSequence<span class="token operator">></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token annotation punctuation">@Override</span>\n    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">accept</span><span class="token punctuation">(</span><span class="token annotation punctuation">@NonNull</span> CharSequence charSequence<span class="token punctuation">)</span> <span class="token keyword">throws</span> Exception <span class="token punctuation">{</span>\n      swipeRefreshLayout<span class="token punctuation">.</span><span class="token function">setRefreshing</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">observeOn</span><span class="token punctuation">(</span>Schedulers<span class="token punctuation">.</span><span class="token function">io</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n  <span class="token comment">// 👇</span>\n  <span class="token punctuation">.</span><span class="token function">switchMap</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Function</span> <span class="token operator">&lt;</span>CharSequence<span class="token punctuation">,</span> Observable <span class="token operator">&lt;</span><span class="token operator">?</span> <span class="token keyword">extends</span> <span class="token class-name">List</span> <span class="token operator">&lt;</span><span class="token operator">?</span><span class="token operator">>>></span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token annotation punctuation">@Override</span>\n    <span class="token keyword">public</span> Observable <span class="token operator">&lt;</span><span class="token operator">?</span> <span class="token keyword">extends</span> <span class="token class-name">List</span> <span class="token operator">&lt;</span><span class="token operator">?</span><span class="token operator">>></span> <span class="token function">apply</span><span class="token punctuation">(</span><span class="token annotation punctuation">@NonNull</span> CharSequence charSequence<span class="token punctuation">)</span> <span class="token keyword">throws</span> Exception <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> <span class="token function">callApi</span><span class="token punctuation">(</span>charSequence<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">subscribeOn</span><span class="token punctuation">(</span>Schedulers<span class="token punctuation">.</span><span class="token function">io</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">observeOn</span><span class="token punctuation">(</span>AndroidSchedulers<span class="token punctuation">.</span><span class="token function">mainThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">subscribe</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Observer</span><span class="token operator">&lt;</span>List<span class="token operator">&lt;</span><span class="token operator">?</span><span class="token operator">>></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token annotation punctuation">@override</span>\n      <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onNext</span><span class="token punctuation">(</span>List<span class="token operator">&lt;</span><span class="token operator">?</span><span class="token operator">></span> searchTips<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        swipeRefreshLayout<span class="token punctuation">.</span><span class="token function">setRefreshing</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        data <span class="token operator">=</span> searchTips<span class="token punctuation">;</span>\n        <span class="token function">setUpContentView</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n      <span class="token comment">// ...</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n      </div>\n<p>在 Rx 系列中，Observable 是一个对事件流的封装，流可以看作是包裹着数据的容器。这里的 TextView 的 textChange 是事件源，首先经过两个 filter（忽略一下其他操作线程、副作用的操作符）将一些不符合要求的事件流排除在外，然后经过 switchMap 操作符。switchMap 和 flatMap 用法较为相似。在这里我们向服务器发送请求获取即时搜索的数据，是一个异步的操作。switchMap 相比 flatMap 在接受到上游发过来的新数据之后，前面尚未完成的异步操作会直接被丢弃，因此比较符合这个功能场景。</p>\n<p>可以发现，两个 filter 的闭包函数的类型相当于是 <code class="language-text">string -&gt; bool</code>，而 switchMap 的闭包函数的类型相当于 <code class="language-text">string -&gt; Observable&lt;List&lt;?&gt;&gt;</code> ，返回值是一个 Observable 容器。switchMap 操作符会将其中的数据取出来（也就是等接口数据调出来之后）放到 Observable 里传递下去。</p>\n<h2>小结</h2>\n<p>借助上面的例子可以看到 flatMap 的基本语义是相通的。在学习这些操作符时或许可以更多地关注传入的闭包函数的类型以及操作符变换的实质。相信 flatMap 以及函数式编程还有更多有趣的内容值得继续学习发掘。</p>\n<h2>参考资料</h2>\n<ul>\n<li><a href="https://repl.it/@yujinyan1992/RxJS-vs-Array-Methods">https://repl.it/@yujinyan1992/RxJS-vs-Array-Methods</a></li>\n<li><a href="https://repl.it/@yujinyan1992/Learning-Swift%60">https://repl.it/@yujinyan1992/Learning-Swift`</a></li>\n<li><a href="https://www.natashatherobot.com/swift-2-flatmap/">https://www.natashatherobot.com/swift-2-flatmap/</a></li>\n<li><a href="https://gist.github.com/samgiles/762ee337dff48623e729">https://gist.github.com/samgiles/762ee337dff48623e729</a></li>\n<li><a href="http://www.infoq.com/cn/articles/swift-brain-gym-map-and-flatmap">Swift 烧脑体操（四） - map 和 flatMap</a></li>\n</ul>',frontmatter:{title:"谈谈 `flatMap`",date:"November 25, 2017"}}},pathContext:{slug:"/flatmap/",previous:{fields:{slug:"/centering-in-css/"},frontmatter:{title:"CSS 居中小结"}},next:{fields:{slug:"/define-constants-in-laravel/"},frontmatter:{title:"在 Laravel 中优雅地定义常量"}}}}}});
//# sourceMappingURL=path---flatmap-3c484ba57b4a93d8f948.js.map