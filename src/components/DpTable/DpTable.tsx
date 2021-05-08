import React, { useMemo, useState } from "react"
import "./dp-table.scss"

interface DpTableProp {
  dimension: [number, number],
  compute: (dp: Array<Array<number>>, marker: DpMarker) => void,
  horizontalHeader?: (j) => number,
  verticalHeader?: (i) => number,
  explanation?: React.FC<{ selected: Coordinates, dp: Array<Array<number>> }>
}

type Coordinates = [number, number]

type DpMarker = (i: number, j: number) => {
  comparing: (coordinates: Array<Coordinates>) => void
}

type MarkerFactory = () => {
  isComparing: (selected: Coordinates, i: number, j: number) => boolean
  marker: DpMarker
}

const markerFactory: MarkerFactory = () => {
  function key(c: Coordinates): string;
  function key(i: number, j: number): string;
  function key(arg1: any, arg2?: any) {
    return arg2 == undefined ?
      `${arg1[0]}.${arg1[1]}` : `${arg1}.${arg2}`
  }

  const comparing: { [key: string]: Array<Coordinates> } = {}

  return {
    isComparing: (selected, i, j) => {
      const k = key(selected)
      return comparing[k] &&
        comparing[k].some(([x, y]) => x == i && y == j)
    },
    marker: (i, j) => {
      return {
        comparing: (coordinates) => {
          comparing[key(i, j)] = coordinates
        },
      }
    },
  }
}

const marker: DpMarker = (i, j) => {
  return {
    i, j,
    comparing: (coordinates) => {
      // console.log(coordinates)
    },
  }
}

export default (props: DpTableProp) => {
  const [selected, setSelected] = useState<Coordinates>([-1, -1])
  const m = props.dimension[0]
  const n = props.dimension[1]

  const [dp, factory] = useMemo(() => {
    const _dp = Array(m)
    const _factory = markerFactory()
    for (let i = 0; i < m; i++) {
      _dp[i] = Array(n).fill(0)
    }
    props.compute(_dp, _factory.marker)
    return [_dp, _factory]
  }, [])

  console.log("selected", selected)

  return (
    <>
      <table className="dp-table dp">
        <tbody>
        {
          props.horizontalHeader &&
          <tr>
            {props.verticalHeader && <th />}
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
                  <td
                    key={j}
                    onClick={_ => setSelected([i, j])}
                    className={
                      `${factory.isComparing(selected, i, j) ? "is-comparing " : " "}` +
                      `${selected[0] == i && selected[1] == j ? "is-active " : " "}`
                    }
                  >{dp[i][j]}</td>,
                )
              }
            </tr>,
          )
        }
        </tbody>
      </table>
      {
        props.explanation && <div className="dp">
          {props.explanation?.({ selected, dp })}
        </div>
      }
    </>
  )
}
