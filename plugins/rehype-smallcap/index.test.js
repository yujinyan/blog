const h = require("hastscript")
const findAndReplace = require("hast-util-find-and-replace")
const inspect = require("unist-util-inspect")

const tree = h("section", [
  // "hello world",
  h("p", ["hello world"]),
  h("h2", ["hello world"]),
])

console.log(inspect(tree))

findAndReplace(tree, "world", () => {
  return h("span", ["world"])
})

console.log(inspect(tree))

