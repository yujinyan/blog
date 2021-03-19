import React from "react"
import "./dp-table.scss"

interface DpTableProp {
  dimension: [number, number],
  compute: (dp: Array<Array<number>>) => void,
  horizontalHeader?: (j) => number,
  verticalHeader?: (i) => number
}

export default (props: DpTableProp) => {
  const m = props.dimension[0]
  const n = props.dimension[1]
  const dp = Array(m)
  for (let i = 0; i < n; i++) {
    dp[i] = Array(n).fill(0)
  }

  console.dir(dp)

  props.compute(dp)

  return (
    <table className="dp-table">
      <tbody>
      {
        props.horizontalHeader &&
        <tr>
          {<th />}
          {[...Array(n)].map((_, j) => <th key={j}>{props.horizontalHeader(j)}</th>)}
        </tr>
      }
      {
        [...Array(m)].map((_, i) =>
          <tr key={i}>
            {
              props.verticalHeader && <th key={i}>{props.verticalHeader(i)}</th>
            }
            {
              [...Array(n)].map((_, j) =>
                <td key={j}>{dp[i][j]}</td>,
              )
            }
          </tr>,
        )
      }
      </tbody>
    </table>
  )
}