---
title: "CSS 居中小结"
date: "2016-02-28T22:12:03.284Z"
---
 
水平居中
----------------------------------------
### 水平居中行内元素（inline element）
在父级块级元素中使用 `text-align: center`。
 
### 水平居中块级元素（block element）
在该元素上使用 `margin: auto`
 
* 前提：该元素定义了 `width` 属性。
* 解释：块状盒子（block box）中 `margin-left`、`border-left`、`padding-left`、`width`、`padding-right`、`border-right`、 `margin-right` 七个属性相加恒等于父容器盒子（container box）的 `width`。浏览器平分父容器 `width` 减去元素 `width` 后的宽度给 `margin-left` 和 `margin-right`，达到居中的效果。
 
### 水平居中浮动元素
```css
.container {
    float: left;
    position: relative;
    left: 50%;
}
.center {
    float: left;
    margin-left: -50%;
}
```
在需要居中的浮动元素的父容器上同样应用相同的 `float` 会使容器收缩到该元素的宽度。将容器左边应用 `margin-left` 或者 `left` 为 50% 之后，由于子元素的宽度此时和父容器的宽度相同，可以应用 `margin-left` 或者 `left` 往回收 50%，达到居中的效果。
```css
.container {
    display: table;
    margin: auto;
}
.center {
    float: left;
}
```
 
竖直居中行内元素
----------------------------------------
### 设置相同的 `padding-top` 及 `padding-down`
 
在该行内元素或者父容器盒子上加入相同的 `padding-top` 和 `padding-bottom`
 
* 前提：父容器盒子 `height: auto`。
* 解释 1：盒子模型中，`margin` 总是透明的，`background` 显示在 `border` 范围之内，包括 `padding` 和内容盒子（content box）。
* 解释 2：行内元素竖直方向的排布与 `font-size`、`line-height`、`vertical-align` 有关。`line-height` 与 `font-size` 的差值分成两半加到行内元素的内容框（content box）后生成行内盒子（inline box）。某行内包含所有行内框的最小盒子定义为行框（line box），所有行框填满父级块状盒子。竖直方向上的 `maring`、`border`、`padding` 不影响盒子的排布，这一效果有点类似绝对定位的元素抽身于文档流之外。
* 解释 3：块状盒子设置了 `height` 以后，`padding-bottom` 可能会失效，视觉上达不到居中的效果。
 
### 令行内元素的 `line-height` 等于父容器盒子的 `height`
 
* 局限：一般只适合文字只有单行的情况
* 解释：这一技巧利用了 `leading` 在内容框上下等量排布的特性。
 
### 利用 CSS `table` 布局
```css
.container {
    height: 200px;
    display: table;
}
.container span {
    display: table-cell;
    vertical-align: middle;
}
```

### 利用 `flex` 布局
设置元素 `margin: auto` 可以使元素在父容器中水平/竖直居中
```css
.container {
    height: 500px;
    display: flex;
}
 
.container .centered {
    margin: auto;
}
```
如果 flexbox 中的元素为匿名元素，可以在父容器设置 `justify-content` （`flex-direction` 方向上）和 `align-items` （与 `flex-direction` 垂直方向上）属性为 `center`
```css
.container {
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
}
```
在使用 `flex` 布局的父容器中定义 `justify-content` 和 `align-items` 是通用的方法。如果能选择到容器中的元素话，给子元素应用 `margin: auto` 的方法更佳。原因是这种方法提供了更好的回退机制，如果 `flex` 不被支持，至少可以保证水平方向上的居中。前提是子元素是块级元素并且设置了 `width`。
 
 
### 利用伪元素（pseudo-element）对齐
```css
.container {
    height: 500px;
}
.container:before,
.container .centered {
    display: inline-block;
    vertical-align: middle;
}
.container:before {
    content:' ';
    height: 100%;
}
.centered {
    width: 200px;
}
```
 
竖直居中块级元素
----------------------------------------
### 绝对定位子元素
 
前提：定义子元素的 `height`
```css
.container {
    height: 500px;
    position: relative;
}
.centered {
    height: 200px;
    position: absolute;
    top: 50%;
    margin-top: -100px; /* `height` 的一半 */
}
```
 
### 绝对定位子元素，配合 `transform` 属性
```css
.container {
    position: relative;
}
.centered {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
```
解释：通过绝对定位将子元素向下移动父容器 `height` 50% 长度的距离之后，需要再向上移动子元素 `height` 50% 的长度。绝大部分 CSS 属性百分比的值都是相对父容器的；而 `translate()` 中的百分比正好是相对于子元素本身的 `height` 或者 `width`。
 
 
### 利用 `flex` 布局
同前一节所述。
 
 
总结
----------------------------------------
对于竖直居中问题，在知道子元素 `width`、`height` 等属性的情况下，一般可以通过绝对定位的方式解决。
 
如果这些属性未知，一般采用其他布局方式，其中：
* `table` 和伪元素对齐浏览器支持都不错（IE8+，IE7 不支持伪元素和 CSS `table`）；
* `flex` 需要加前缀处理。
 
 
参考资料
----------------------------------------
* [Verou, Lea. _CSS Secrets: Better Solutions to Everyday Web Design Problems_. 1st ed. 2015.](http://lea.verou.me/)
* [Centering in CSS: A Complete Guide](https://css-tricks.com/centering-css-complete-guide/)
* [Centering in the Unknown](https://css-tricks.com/centering-in-the-unknown/)
* [解读 CSS 布局之 - 水平垂直居中](http://f2e.souche.com/blog/jie-du-cssbu-ju-zhi-shui-ping-chui-zhi-ju-zhong/)
* [Understanding the CSS box model for inline elements](https://hacks.mozilla.org/2015/03/understanding-inline-box-model/)
* [Visual formatting model, Cascading Style Sheets Level 2 Revision 1 (CSS 2.1) Specification](https://www.w3.org/TR/CSS2/visuren.html#inline-formatting)
* [彻底理解 CSS 中的 BFC](http://www.itkaoyan.cn/?p=709)
* [Stack Overflow: How to horizontally center a floating element of a variable width](http://stackoverflow.com/questions/1232096/how-to-horizontally-center-a-floating-element-of-a-variable-width)
* [Centering things](https://www.w3.org/Style/Examples/007/center.en.html)