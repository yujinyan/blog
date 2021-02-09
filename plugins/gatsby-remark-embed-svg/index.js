const visit = require('unist-util-visit')
const cheerio = require("cheerio")
const fs = require('fs/promises');
const path = require('path')

module.exports = async (config, pluginOptions) => {
  const { markdownAST } = config
  const nodes = []

  visit(markdownAST, "image", node => {
    if (!node.url.startsWith("http")
      && path.extname(node.url) == '.svg'
    ) {
      nodes.push(node)
    }
  })

  await Promise.all(nodes.map(async node => {
    const fileAbsolutePath = config.markdownNode.fileAbsolutePath
    const svgPath = path.join(path.dirname(fileAbsolutePath), node.url)
    const content = processSvg(await fs.readFile(svgPath, "utf-8"))
    node.type = "html"
    node.children = undefined
    node.value = content
  }))

  return markdownAST
}

function processSvg(svgString) {
  const $ = cheerio.load(svgString)
  $('svg').addClass('excalidraw')
  return $.html()
}
