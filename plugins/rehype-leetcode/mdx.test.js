const mdx = require("@mdx-js/mdx")


const content = `
<LeetCode.ProblemCard id={300} title="Longest Increasing subsequence"
difficulty="medium" acceptance={0.65} />
`

const t = async () => {
  return await mdx(content)
}

t().then(console.log)