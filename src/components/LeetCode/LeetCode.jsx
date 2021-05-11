import React from "react"

import LeetCodeIcon from "./LeetCode.svg"
import { Link } from "gatsby"


const DifficultyLevel = (difficulty) =>
  <span className={`lc-level ${difficulty}`}>{difficulty}</span>

const ProblemAttributes = ({ id, difficulty, acceptance, slug, thisSite }) =>
  <div className="lc-attributes smcp">
    {DifficultyLevel(difficulty)} | {` `}
    Accept. {(acceptance * 100).toFixed(0)}% | {` `}
    <a href={`https://leetcode-cn.com/problems/${slug}`}>力扣中文站</a>
    {
      thisSite && <>
        {` | `}
        <a href={`https://leetcode.com/problems/${slug}`}>LeetCode</a>
      </>
    }
  </div>

const ProblemCard = (props) => {
  const title = <>
    <span className="ordn">№ </span>{props.id}. {props.title}
  </>

  return <section className="flex items-center mb-4 space-x-2" >
    <img className="m-0" src={LeetCodeIcon} alt="LeetCode" width="36" />
    <div>
      <p className="lc-title border-b m-0 leading-tight">
        {
          props.thisSite ?
            <Link to={`/leetcode/${props.slug}`}>{title} 🐟</Link> :
            <a href={`https://leetcode.com/problems/${props.slug}`}>
              {title}
            </a>
        }
      </p>
      <ProblemAttributes {...props} />
    </div>
  </section>
}

export default {
  DifficultyLevel, ProblemAttributes, ProblemCard,
}


