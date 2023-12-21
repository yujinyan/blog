
import { DpTable, dpFactory, key } from "@/components/DpTable"
import { type Component, createSignal, type Accessor, Switch, Match } from "solid-js"

const text1 = "abcbdab"
const text2 = "obdcaba"

function dp() {
    const m = text1.length
    const n = text2.length
    const { dp, comparing } = dpFactory(m + 1, n + 1)
    for (let i = 1; i <= m; i++) {
        const char1 = text1.charAt(i - 1)
        for (let j = 1; j <= n; j++) {
            const char2 = text2.charAt(j - 1)
            if (char1 === char2) {
                dp[i][j] = dp[i - 1][j - 1] + 1
                comparing[key(i, j)] = [[i - 1, j - 1]]
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                comparing[key(i, j)] = [[i - 1, j], [i, j - 1]]
            }
        }
    }
    return { dp, comparing }
}

const Explanation: Component<{ selected: Accessor<[number, number]> }> = ({ selected }) => {
    const i = () => selected()[0]
    const j = () => selected()[1]
    const char1 = () => text1.charAt(i() - 1)
    const char2 = () => text2.charAt(j() - 1)
    const charIsEqual = () => char1 === char2

    return <Switch>
        <Match when={i() < 0 || j() < 0}>{``}</Match>
        <Match when={true}>
            <section class="explanation">
                <p>
                    We're looking for the number of common subsequence in
                    <code>{text1.substring(0, i())}</code> and <code>{text2.substring(0, j())}</code>.
                </p>
                <p>
                    Notice <code>{text2.charAt(j() - 1)}</code>{` `}
                    is {!charIsEqual && "not"} equal to{` `}
                    <code>{text1.charAt(i() - 1)}</code>.
                </p>
                <Switch>
                    <Match when={charIsEqual()}>
                        <p>
                            We have found another character <code>{char1()}</code> to increase the common subsequence.{` `}
                            The answer is equal to 1 plus previous answer without this common character, located at {` `}
                            <code>Dp[i - 1][j - 1]</code>
                        </p>
                    </Match>
                    <Match when={true}>
                        <div>
                            <p>Since these two characters are different, we consider each of them separately.</p>
                            <ul>
                                <li>If we take <code>{text1.charAt(i() - 1)}</code>, the answer is located in the cell to the left.</li>
                                <li>If we take <code>{text2.charAt(j() - 1)}</code>, the answer is located in the cell above.</li>
                            </ul>
                            <p>The answer of the current cell is the max of the previous two.</p>
                        </div>

                    </Match>
                </Switch>
            </section>
        </Match>
    </Switch>
}

export default function LongestCommonSubsequence() {
    const selectedSignal = createSignal<[number, number]>([-1, -1]);
    return <>
        <DpTable
            dimension={[text1.length + 1, text2.length + 1]}
            horizontalHeader={[`""`, "o", "b", "d", "c", "a", "b", "a"]}
            verticalHeader={[`""`, "a", "b", "c", "b", "d", "a", "b"]}
            selectedSignal={selectedSignal}
            dp={dp()}
        >
        </DpTable>
        <Explanation selected={selectedSignal[0]} />
    </>
}
