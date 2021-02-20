const { allHanzi } = require("./isHanzi")
test('all hanzi', () => {
  expect(allHanzi("你好")).toBe(true)
  expect(allHanzi("你好ah")).toBe(false)
  // todo
  // expect(allHanzi("「结构化并发」")).toBe(false)
})
