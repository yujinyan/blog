const visit = require('unist-util-visit')
const select = require('unist-util-select').select

module.exports = async (config, pluginOptions) => {
  const { markdownAST } = config

  visit(markdownAST, "figCustomBlock", node => {
    const captionNode = select('figCustomBlockHeading', node)
    const svgNode = select('figCustomBlockBody paragraph html', node)

    node.children = [svgNode, captionNode]
  })

  return markdownAST
}
