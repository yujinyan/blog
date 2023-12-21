import { type Component, type ParentComponent, type Signal } from "solid-js"
import "./DpTable.scss"

interface DpTableProp {
    dimension: [number, number],
    dp: DpResult,
    selectedSignal: Signal<[number, number]>,
    horizontalHeader?: string[],
    verticalHeader?: string[],
}

type Coordinates = [number, number]
type CoordinateKey = `${number}.${number}`

export interface DpResult {
    dp: number[][],
    comparing: Record<CoordinateKey, Coordinates[]>
}

export function key(arg1: any, arg2?: any): CoordinateKey {
    return arg2 == undefined ?
        `${arg1[0]}.${arg1[1]}` : `${arg1}.${arg2}`
}

function isComparing(
    comparing: DpResult['comparing'],
    selected: Coordinates | number | any, i: number, j: number
) {

    const k = key(selected)
    return comparing[k] &&
        comparing[k].some(([x, y]) => x == i && y == j)
}


export function dpFactory(m: number, n: number): DpResult {
    const dp = Array(m)
    for (let i = 0; i < m; i++) {
        dp[i] = Array(n).fill(0)
    }

    const comparing = {}
    return { dp, comparing }
}


export const DpTable: Component<DpTableProp> = (props: DpTableProp) => {
    const [selected, setSelected] = props.selectedSignal
    const m = props.dimension[0]
    const n = props.dimension[1]
    const { dp, comparing } = props.dp;

    return (
        <>
            <table class="dp-table dp">
                <tbody>
                    {
                        props.horizontalHeader && 
                        <tr>
                            {props.verticalHeader && <th />}
                            {[...Array(n)].map((_, j) => (
                                props.horizontalHeader && <th>{props.horizontalHeader[j]}</th>
                            ))}
                        </tr>
                    }
                    {
                        [...Array(m)].map((_, i) =>
                            <tr>
                                {
                                    props.verticalHeader && <th>{props.verticalHeader[i]}</th>
                                }
                                {
                                    [...Array(n)].map((_, j) =>
                                        <td
                                            onClick={_ => setSelected([i, j])}
                                            classList={
                                                {
                                                    "is-active": selected()[0] == i && selected()[1] == j,
                                                    "is-comparing": isComparing(comparing, selected(), i, j)

                                                }
                                            }
                                        >{dp[i][j]}</td>,
                                    )
                                }
                            </tr>,
                        )
                    }
                </tbody>
            </table>
        </>
    )
}
