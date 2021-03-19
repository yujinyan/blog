import React from "react"
import { formatErrorDetails } from "gatsby/dist/query/utils"

interface DpTableProp {
  dimension: [number, number],
  compute: (dp: Array<Array<number>>, i: number, j: number) => number,
}

export default (props: DpTableProp) => {
  const m = props.dimension[0]
  const n = props.dimension[1]
  const dp = Array(m)
  for (let i = 0; i < n; i++) {
    dp.push(Array(n))
  }
  console.log(m, n)
  return (
    <table className="dp-table">
      <tbody>
      {
        [...Array(m)].map((_, i) =>
          <tr key={i}>
            {
              [...Array(n)].map((_, j) =>
                <td key={j}>{props.compute(dp, i, j)}</td>,
              )
            }
          </tr>,
        )
        // [...Array(m)].map(
        //   (_, i) => (<tr key={i}>
        //     {[...Array(n).map((_, j) => <td key={j}>{i} - {j}</td>)]}
        //   </tr>),
        // )
      }
      </tbody>
    </table>
  )
}