import { Match, Switch, createSignal, type Accessor } from "solid-js";
import { DpTable, dpFactory, key, type DpResult } from "@/components/DpTable";

export const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

function dp() {
    const { dp: _dp, comparing } = dpFactory(nums.length + 1, 1)
    const dp = _dp[0]
    dp[0] = nums[0]
    for (let j = 1; j < nums.length; j++) {
        comparing[key(0, j)] = [[0, j - 1]]
        const cur = nums[j]
        dp[j] = Math.max(dp[j - 1] + cur, cur)
    }

    return { dp: _dp, comparing }
}

const Explanation = ({ selected, dp: _dp }: { selected: Accessor<[number, number]>, dp: DpResult }) => {
    const i = () => selected()[0]
    const j = () => selected()[1]
    const dp = _dp.dp


    return <Switch>
        <Match when={i() < 0 || j() < 0}>{``}</Match>
        <Match when={j() === 0}>
            <section class="explanation">
                <p>We have only one number, the max subarray sum equals this number <code>{nums[j()]}</code>.</p>
            </section>
        </Match>
        <Match when={true}>
            <section class="explanation">
                <p>The highlighted value denotes the sum of max subarray <em>ending with this value</em> <code>{nums[j()]}</code>.
                </p>
                <p>To get this value, we can iterate and compare all the subarrays ending with this number.</p>
                <ol>
                    {
                        [...Array(j() + 1)].map((_, $j) => <li>
                            <code>{nums.slice($j, j() + 1).join(",")}</code>
                        </li>)
                    }
                </ol>
                <p>
                    In this way, we check systematically all the subarrays of <code>nums</code>.
                    However, the algorithm is <code>O(n^2)</code>.</p>
                <p>
                    Does knowing the max subarray sum ending at the previous position help?
                    (The previous sum is <code>dp[0][j - 1]</code>.)
                    There are only two cases:
                </p>
                <ol>
                    <li>either we <em>prepend</em> the previous subarray to the current value,</li>
                    <li>or we discard the previous subarray and just take the current value. The previous sum is negative.</li>
                </ol>
                <p>
                    Current value is <code>{nums[j()]}</code>,
                    and the max subarray sum ending at previous position is <code>{dp[0][j() - 1]}</code>.
                </p>
                <p>
                    We can get bigger subarray sum by {` `}
                    <Switch>
                        <Match when={dp[0][j() - 1] < 0}>
                            discarding the previous subarray and just take current value.
                        </Match>
                        <Match when={true}>
                            adding the previous sum and the current value.
                        </Match>
                    </Switch>
                    The result is <code>{dp[0][j()]}</code>.
                </p>
            </section>
        </Match>
    </Switch>
}

export default function LongestCommonSubsequence() {
    const selectedSignal = createSignal<[number, number]>([-1, -1]);
    const _dp = dp()
    return <>
        <DpTable
            dimension={[1, nums.length]}
            horizontalHeader={["-2", "1", "-3", "4", "-1", "2", "1", "-5", "4"]}
            verticalHeader={["dp"]}
            selectedSignal={selectedSignal}
            dp={_dp}
        >
        </DpTable>
        <Explanation selected={selectedSignal[0]} dp={_dp} />
    </>
}
