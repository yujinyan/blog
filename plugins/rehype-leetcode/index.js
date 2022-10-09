const visit = require("unist-util-visit")

const _data = require("./data.json")
const problemsById = _data.stat_status_pairs.reduce((acc, item) => {
  acc[item.stat.frontend_question_id] = item
  return acc
}, {})
const LEVEL_TO_DIFFICULTY = {
  1: "easy", 2: "medium", 3: "hard",
}

const problems = {
  getById: function(id) {
    const _data = problemsById[id]
    if (!_data) throw Error(`leetcode problem with id ${id} not found.`)
    return {
      id,
      title: _data.stat.question__title,
      slug: _data.stat.question__title_slug,
      acceptance: _data.stat.total_acs / _data.stat.total_submitted,
      difficulty: LEVEL_TO_DIFFICULTY[_data.difficulty.level],
    }
  },
}

// For tree node structure, refer to
// https://github.com/syntax-tree/mdast-util-mdx-jsx#syntax-tree
module.exports = () => {
  return tree => {
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (!node.name.startsWith("LeetCode")) {
        return
      }
      const idAttribute = node.attributes.find(a => a.name === "id")
      const leetcodeProblem = problems.getById(idAttribute.value.value)
      Object.entries(leetcodeProblem).forEach(([key, value]) => {
        node.attributes.push(
          {
            type: "mdxJsxAttribute",
            name: key,
            value
          }
        )
      })
    })
  }
}
