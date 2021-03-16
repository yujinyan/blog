const findAndReplace = require("hast-util-find-and-replace")

// https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins
const CAPS_RE = /([A-Z!"#$%&'()*+,./:;<=>?@\^_`{|}~\-]{2,}\b)/g

// Reference:
// https://github.com/daneden/gatsby-remark-smallcaps/blob/master/src/index.js
module.exports = () => {
  // return null
  return tree => {
    findAndReplace(tree, CAPS_RE, (match) => {
      return {
        type: "element",
        tagName: "span",
        properties: {
          class: "smcp",
        },
        children: [{ type: "text", value: match }],
      }
    }, {
      ignore: [...findAndReplace.ignore, "code"],
    })
  }
}
