import React, { useState } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"

// const Stack = ({ elements }: { elements: Array<number> }) => {
//   const [number, value] = useState(0)
//   return elements.map((it) => <div>{it}</div>)
// }

const Stack = () => {
  const [number, setNumber] = useState(0)
  return <div>
    <button onClick={() => setNumber(number + 1)}>add</button>
    <TransitionGroup>
      {
        [...Array(number)].map((_, index) =>
          <CSSTransition
            key={index}
            className="item"
          >
            <div>{index}</div>
          </CSSTransition>,
        )
      }
    </TransitionGroup>
  </div>
}

const Stack2 = ({ children }) => {
  const states = []
  const reportStackState = (index, nums) => {
    states[index] = nums
  }
  children(reportStackState)

  const [index, updateIndex] = useState(-1)

  return <div>
    {
      [...Array(states.length).map((_, index) =>
        <button
          key={index}
          onClick={() => updateIndex(index)}
        >{index}
        </button>),
      ]
    }
    {
      states[index].map((item, index) => <div key={index}>{item}</div>)
    }
  </div>
}

const Stack3 = ({ report }) => {
  const states = report.result
  const [state, updateState] = useState(0)
  return <div>
    <button onClick={
      () => updateState(Math.max(0, state - 1))}
    >{`<`}</button>
    <button onClick={
      () => updateState(Math.min(states.length - 1, state + 1))
    }>{`>`}</button>
    {
      states[state].map((item, index) => <div key={index}>{item}</div>)
    }
  </div>
}

export const reporter = () => {
  const result = []
  const report = (stack: Array<number>) => {
    console.log(`reporting ${stack}`)
    result.push([...stack])
  }
  report.result = result
  return report
}


export default Stack3

