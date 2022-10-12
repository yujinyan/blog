import React from "react"
import tw from "twin.macro"

// @ts-ignore
import LeetCodeIcon from "./LeetCode.svg"
import { Link } from "gatsby"

type Difficulty = "easy" | "medium" | "hard"
type Problem = {
  id: number,
  title: string,
  difficulty: Difficulty,
  acceptance: number,
  slug: string,
  thisSite: boolean
}

function ProblemCard(props: Problem) {
  const title = <>
    <span className="ordinal">№ </span>{props.id}. {props.title}
  </>

  return <section className="flex items-center mb-4 not-prose">
    <img className="m-0 w-16" src={LeetCodeIcon} alt="LeetCode" />
    <div className="ml-2">
      <DifficultyLevel difficulty={props.difficulty} />
      <div className="text-2xl m-0 leading-tight">
        {
          props.thisSite ?
            <Link className="text-body" to={`/leetcode/${props.slug}`}>{title} 🐟</Link> :
            <a className="text-body " href={`https://leetcode.com/problems/${props.slug}`}>
              {title}
            </a>
        }
      </div>
      <ProblemAttributes {...props} />
    </div>
  </section>
}

function DifficultyLevel({difficulty}: {difficulty: Difficulty}) {
  switch (difficulty) {
    case "medium": return <Chip className="border-yellow-500 text-yellow-500 dark:text-yellow-200">{difficulty}</Chip>
    case "easy": return <Chip className="border-green-500 text-green-500 dark:text-green-200">{difficulty}</Chip>
    case "hard": return <Chip className="border-red-400 text-red-400 dark:text-red-200">{difficulty}</Chip>
    // case "easy": return <span className="text-green-500 dark:text-green-400">{difficulty}</span>
    // case "hard": return <span className="text-red-500 dark:text-red-400">{difficulty}</span>
  }
}

function ProblemAttributes({ id, difficulty, acceptance, slug, thisSite }: Problem) {
  return <div className="font-mono text-sm text-gray-400">
    {(acceptance * 100).toFixed(0)}% ac·
    {/*{DifficultyLevel(difficulty)} · {` `}*/}
    <a href={`https://leetcode-cn.com/problems/${slug}`}>力扣中文站</a>
    {
      thisSite && <>{`·`}<a href={`https://leetcode.com/problems/${slug}`}>LeetCode</a></>
    }
  </div>
}

const Chip = tw.span`rounded-2xl font-mono text-xs py-px px-2 border`
export default {
  DifficultyLevel, ProblemAttributes, ProblemCard,
}
