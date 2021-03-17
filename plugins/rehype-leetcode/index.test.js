const unified = require("unified")
const htmlParser = require("rehype-parse")

const inspect = require("unist-util-inspect")
const rehype2react = require("rehype-react")

const React = require("react")


const tree = unified()
  .use(htmlParser)
  .use(rehype2react, { createElement: React.createElement })
  .parse(`
<LeetCode.ProblemCard id={300} title="Longest Increasing subsequence"
difficulty="medium" acceptance={0.65} />
`)

console.log(inspect(tree))
