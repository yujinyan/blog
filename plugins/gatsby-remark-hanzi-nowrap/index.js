const visit = require("unist-util-visit")
const runes = require("runes")
const select = require('unist-util-select').select
const { allHanzi } = require("./isHanzi")

module.exports = ({ markdownAST }, pluginOptions) => {
  const CUTOFF_LENGTH = 10
  visit(markdownAST, "heading", node => {
    const lastTextNode = select("heading text:last-child", node)

    if (!lastTextNode || !lastTextNode.value) {
      // console.warn("empty text node", lastTextNode)
      return
    }

    if (lastTextNode.value.length < CUTOFF_LENGTH) return
    // console.log("=========")
    // console.dir(node, { depth: null })

    const r = runes(lastTextNode.value)
    const lastChars = r.slice(-2)
    if (!lastChars.every(allHanzi)) return

    lastTextNode.value = r.slice(0, r.length - 2).join("")

    node.children.push({
      type: "html",
      value: `<span class="nowrap">${lastChars.join("")}</span>`,
      children: undefined
    })

    // console.log("---------")
    // console.dir(node, { depth: null })
    // console.log("=========")
  })
  return markdownAST
}