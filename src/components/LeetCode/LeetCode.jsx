import React from "react"
import { rhythm } from "utils/typography"

import LeetCodeIcon from "./LeetCode.svg"


const DifficultyLevel = (difficulty) =>
  <span className={`lc-level ${difficulty}`}>{difficulty}</span>

const ProblemAttributes = ({ id, difficulty, acceptance, slug }) => <div className="lc-attributes smcp">
  {DifficultyLevel(difficulty)} | Acceptance {(acceptance * 100).toFixed(0)}% | <a
  href={`https://leetcode-cn.com/problems/${slug}`}>力扣中文站</a>
</div>

const ProblemCard = (props) => <section className="lc-card" style={{ marginBottom: rhythm(1) }}>
  <img src={LeetCodeIcon} alt="LeetCode" width="36" />
  <div>
    <p className="lc-title">
      <a href={`https://leetcode.com/problems/${props.slug}`}>
        <span className="ordn">№ </span>{props.id}. {props.title}
      </a>
    </p>
    <ProblemAttributes {...props} />
  </div>
</section>

export default {
  DifficultyLevel, ProblemAttributes, ProblemCard,
}


