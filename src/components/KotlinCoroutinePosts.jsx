import React from "react"
import CoroutineSvg from "~/assets/kotlin-coroutine.svg"
import { Link } from "gatsby"

const Item = ({ to, children }) => <p className="m-0 leading-tight">
  <Link to={to}>{children}</Link>
</p>

export default () => <section className="flex p-6 space-x-4 shadow-lg content-start mx-auto max-w-lg mb-8 rounded-lg border">
  <img className="m-0 w-12 h-12 flex-shrink-0" src={CoroutineSvg} alt="Kotlin Coroutine" />
  <div className="flex-grow">
    <h2 className="m-0 -mt-2 mb-4 border-b flex-grow pb-2">Kotlin 协程系列文章</h2>
    <div className="space-y-4">
      <Item to="/posts/kotlin-coroutine-context-scope">谈谈 Kotlin 协程的 Context 和 Scope</Item>
      <Item to="/posts/understanding-kotlin-suspend-functions">理解 Kotlin 的 suspend 函数</Item>
      <Item to="/posts/kotlin-flow-introduction">初识 Kotlin Flow</Item>
      <Item to="/posts/kotlin-coroutine-retrofit">Kotlin 协程与 Retrofit</Item>
    </div>
  </div>
</section>