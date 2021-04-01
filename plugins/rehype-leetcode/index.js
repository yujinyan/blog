const visit = require("unist-util-visit")
const jsxparser = require("./jsxparser")

const data = require("../../content/blog/leetcode/data.json")

const LEETCODE_RE = /<(LeetCode.+) id={(\d+)}/
const LEVEL_TO_DIFFICULTY = {
  1: "easy", 2: "medium", 3: "hard",
}

const problems = {
  _data: data.stat_status_pairs,
  _length: data.stat_status_pairs.length,
  getById: function(id) {
    // console.log(`length is ${this._length}`)
    const position = this._length - id
    // console.log(`id is ${id}, position is ${this._length}`)
    const _data = this._data[position]
    const idInData = _data.stat.question_id
    if (idInData != id) {
      throw Error(`leetcode id not match, looking for ${id}, but found ${idInData} at position ${position}`)
    }
    return {
      id,
      title: _data.stat.question__title,
      slug: _data.stat.question__title_slug,
      acceptance: _data.stat.total_acs / _data.stat.total_submitted,
      difficulty: LEVEL_TO_DIFFICULTY[_data.difficulty.level],
    }
  },
}

module.exports = () => {
  return tree => {
    visit(tree, "jsx", (node) => {
      const jsx = jsxparser(node.value)
      if (!jsx?.tag?.startsWith("LeetCode")) return

      const tag = jsx.tag
      const id = jsx.props["id"]
      const problem = problems.getById(id)
      const props = { ...jsx.props, ...problem }

      let propertyStr = ""
      Object.entries(props).forEach(([key, value]) => {
        propertyStr += `${key}="${value}" `
      })
      node.value = `<${tag} ${propertyStr} />`
    })
  }
}