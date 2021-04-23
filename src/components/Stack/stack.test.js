const { reporter } = require("./Stack")

// todo: test infra not working
test("can report", () => {
  const report = reporter()
  const stack = []
  stack.push(1)
  report(stack)
  stack.push(2)
  report(stack)
  stack.push(3)
  report(stack)

  expect(report.result).toBe([[1], [1, 2], [1, 2, 3]])
})