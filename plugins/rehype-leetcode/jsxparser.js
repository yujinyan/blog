const REMOVE_BRACKETS_RE = /<(.+) \/>/
const ATTRIBUTE_RE = /(\w+)={(.+)}/

const parse = (input) => {
  const m1 = input.match(REMOVE_BRACKETS_RE)
  if (!m1) return
  const insideBrackets = m1[1]
  const pairs = insideBrackets.split(/\s+/)
  const props = {}
  for (let i = 1; i < pairs.length; i++) {
    const match = pairs[i].match(ATTRIBUTE_RE)
    if (!match) continue
    props[match[1]] = eval(match[2])
  }

  return {
    tag: pairs[0],
    props,
  }
}
module.exports = parse
