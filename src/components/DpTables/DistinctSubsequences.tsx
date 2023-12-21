import { DpTable, dpFactory, key } from "@/components/DpTable"
import { type Component, createSignal, type Accessor, Switch, Match } from "solid-js"

export const s = "babgbag"
export const t = "bag"

function dp() {
  const S = s.length, T = t.length
  const { dp, comparing } = dpFactory(S + 1, T + 1)
  for (let j = 0; j <= S; j++) dp[0][j] = 1
  for (let i = 1; i <= T; i++) {
    for (let j = 1; j <= S; j++) {
      if (s.charAt(j - 1) === t.charAt(i - 1)) {
        dp[i][j] = dp[i][j - 1] + dp[i - 1][j - 1]
        comparing[key(i, j)] = [[i, j - 1], [i - 1, j - 1]]
      } else {
        dp[i][j] = dp[i][j - 1]
        comparing[key(i, j)] = [[i, j - 1]]
      }
    }
  }
  return { dp, comparing }
}

const Explanation: Component<{ selected: Accessor<[number, number]> }> = ({ selected }) => {
  const i = () => selected()[0]
  const j = () => selected()[1]
  const charEquals = () => s.charAt(j() - 1) === t.charAt(i() - 1)
  const meaning = () => <p class="explanation">
    Suppose we're filling this <span class="is-active p-1 rounded">highlighted cell</span>. {` `}
    The value inside denotes how many times {` `}
    <code>{t.slice(0, i())}</code> can be found in {` `}
    <code>{s.slice(0, j())}</code>.
  </p>
  const isCharEqualQuestion = () => <span>
    Is <code>{s.charAt(j() - 1)}</code> equal to <code>{t.charAt(i() - 1)}</code>?
  </span>
  return <Switch>
    <Match when={i() < 0 || j() < 0} >{``}</Match>
    <Match when={i() === 0}>
      <section class="explanation">
        <p>
          The first row is filled with <code>1</code>.
          Because the empty string is subsequence of any string, but only <code>1</code> times.
        </p>
      </section>
    </Match>
    <Match when={j() === 0}>
      <section class="explanation">
        <p><code>s == ""</code></p>
        <p><code>t == "{t.slice(0, i())}"</code></p>
        <p>
          <code>s</code> won't contain <code>t</code>, so fill in <code>0</code>
        </p>
      </section>
    </Match>
    <Match when={true}>
      <section class="explanation">
        {meaning()}
        <p>We're looking for:</p>
        <ul>
          <li>number of {` `}
            <code>{t.slice(0, i())}</code> in {` `}
            <code>{s.slice(0, j())}</code>
          </li>
        </ul>
        <Switch>
          <Match when={charEquals()}>
              <p>{isCharEqualQuestion()} Yes.</p>
              <p>Then the value in this cell equals <i>the sum</i> of the following two:</p>
              <ol>
                <li>number of {` `}
                  <code>{t.slice(0, i() - 1)}</code> in {` `}
                  <code>{s.slice(0, j() - 1)}</code>
                </li>
                <li>number of {` `}
                  <code>{t.slice(0, i())}</code> in {` `}
                  <code>{s.slice(0, j() - 1)}</code>
                </li>
              </ol>
              <p>In the first case, the current character <code>{s.charAt(j() - 1)}</code> continues the matching pattern.
              </p>
              <p>In the second case, the pattern <code>{t.slice(0, i())}</code> was already fully matched.</p>
          </Match>
          <Match when={true}>
              <p>{isCharEqualQuestion()} No.</p>
              <p>
                Therefore, we have the same number of distinct subsequences {` `}
                as we had without the new character {` `}
                <code>{s.charAt(j() - 1)}</code>.
              </p>
          </Match>
        </Switch>
      </section>
    </Match>
  </Switch>
}

export default function () {
  const selectedSignal = createSignal<[number, number]>([-1, -1])
  return <>
    <DpTable
      dimension={[t.length + 1, s.length + 1]}
      horizontalHeader={[`""`, "b", "a", "b", "g", "b", "a", "g"]}
      verticalHeader={[`""`, "b", "a", "g"]}
      selectedSignal={selectedSignal}
      dp={dp()}
    >
    </DpTable>
    <Explanation selected={selectedSignal[0]} />
  </>
}
