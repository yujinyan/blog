import React from "react"
import PullQuote from "../components/PullQuote"
import { PrismSyntaxHighlight } from "../components/SyntaxHighlight"
import Layout from "../components/layout"
import Popout from "../components/Popout"
import LeetCode from "../components/LeetCode"
import {PrimaryButton} from "../components/Button"
import tw from "twin.macro"

export default function Page({ location }) {
  return <Layout location={location}>
    <article className="prose">
      <section>
        <h2>Color</h2>
        <ColorPalette />
        <p className="text-secondary-500">
          Hello World!
        </p>
      </section>

      <section>
        <h2>Typography</h2>
        <Popout className="flex flex-col gap-8 bg-gray-50  p-6 rounded-lg shadow-inner">
          {
            [{
              className: `font-mono`,
              fontName: `JetBrains Mono`,
            }, {
              className: `font-display`,
              fontName: `Roboto Slab`,
            }, {
              className: `font-subtitle`,
              fontName: `Zilla Slab`,
            }, {
              className: `font-sans`,
              fontName: `System default`,

            }
            ].map(x =>
              <div>
                <div className={`text-2xl mb-2 ${x.className} text-gray-700`}>The quick brown fox jumps over the lazy dog.</div>
                <div className="flex gap-2 items-baseline">
                  <PrimaryChip>{x.className}</PrimaryChip>
                  <Label text={x.fontName} />
                </div>
              </div>,
            )
          }
        </Popout>
        <div>
          <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.</p>
          <p> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
            est laborum.</p>
        </div>
      </section>

      <section>
        <h2>Components</h2>
        <PrimaryButton>Click me</PrimaryButton>
        <PullQuote emoji="😍">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </PullQuote>
        <pre><PrismSyntaxHighlight className="language-kotlin">{codeSnippet}</PrismSyntaxHighlight></pre>
        <LeetCode.ProblemCard id={496} title="Next Greater Element I" acceptance={0.67} difficulty="easy"
                              slug="next-greater-element-i" thisSite={false}/>
        <LeetCode.ProblemCard id={496} title="Next Greater Element I" acceptance={0.67} difficulty="hard"
                              slug="next-greater-element-i" thisSite={true} />
        <LeetCode.ProblemCard id={496} title="Next Greater Element I" acceptance={0.67} difficulty="medium"
                              slug="next-greater-element-i" thisSite={false} />
      </section>

      <section>
        <h2>Spacing</h2>
        {
          [
            { label: "2", value: "w-2" },
            { label: "4", value: "w-4" },
            { label: "6", value: "w-6" },
            { label: "horizontal", value: "w-horizontal" },
          ].map(x => <div className="flex items-center gap-2">
            <div className="w-32 text-right font-mono text-sm">{x.label}</div>
            <div className={`bg-secondary-400 h-2 ${x.value}`}></div>
          </div>)
        }
      </section>
    </article>
  </Layout>
}

const Chip = tw.span`rounded-2xl font-mono text-xs py-1 px-2`
const PrimaryChip = tw(Chip)`border border-primary-300 text-primary-500`

function ColorPalette() {
  return <div className="flex gap-2">
    <Swatch className="bg-primary-500" color="Primary" />
    <Swatch className="bg-secondary-500" color="Secondary" />
  </div>
}

function Swatch({ color, className }: { color: string, className: string }) {
  return <div>
    <div className={`w-24 h-12 rounded shadow-inner ${className}`} />
    <div className="font-mono text-gray-400 text-sm">{color}</div>
  </div>
}

function Label({ text }: { text: string }) {
  return <div className="font-mono text-gray-400 text-sm">{text}</div>
}

const codeSnippet = `
fun toRPN(s: String): List<Any> {
  val ret = mutableListOf<Any>()
  val ops = Stack<Char>();

  var i = 0
  // The first char could be a unary operator.
  var checkUnary = true // highlight-line
  while (i < s.length) {
    val c = s[i]
    // highlight-range{2-3}
    if (checkUnary) {
      if (c == '-' || c == '+') ret += 0
      checkUnary = false
    }
    // The following char could be a unary operator.
    if (c == '(') checkUnary = true // highlight-line
    /* ommitted */
  }
  while (!ops.isEmpty()) ret += ops.pop()
  return ret
}
`
