const parse = require("./jsxparser")

test("legal jsx 2 props", () => {
  expect(parse(`<LeetCode.ProblemCard id={191} thisSite={true} />`))
    .toStrictEqual({
      tag: "LeetCode.ProblemCard",
      props: { id: 191, thisSite: true },
    })
})

test("legal jsx 1 props", () => {
  expect(parse(`<LeetCode.ProblemCard id={191}  />`))
    .toStrictEqual({
      tag: "LeetCode.ProblemCard",
      props: { id: 191 },
    })
})

test("skip if cannot resolve identifier", () => {
  expect(parse(`<img src={Kotlin} alt="Kotlin" />`))
    .toBe(undefined)
})
