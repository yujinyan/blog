import { type JSXElement, type ParentComponent } from "solid-js"

type Difficulty = "easy" | "medium" | "hard"
export type Problem = {
    id: number,
    title: string,
    difficulty: Difficulty,
    acceptance: number,
    slug: string,
    thisSite?: boolean,
}

export function ProblemCard(props: Problem & { image?: JSXElement }) {
    const title = <>
        <span class="ordinal">№ </span>{props.id}. {props.title}
    </>

    return <section class="flex items-center mb-4 not-prose">
        {props.image}
        <div class="ml-2">
            <DifficultyLevel difficulty={props.difficulty} />
            <div class="text-2xl m-0 leading-tight">
                {
                    props.thisSite ?
                        <a class="text-body" href={`/leetcode/${props.slug}`}>{title} 🐟</a> :
                        <a class="text-body " href={`https://leetcode.com/problems/${props.slug}`}>
                            {title}
                        </a>
                }
            </div>
            <ProblemAttributes {...props} />
        </div>
    </section>
}

function DifficultyLevel({ difficulty }: { difficulty: Difficulty }) {
    switch (difficulty) {
        case "medium": return <Chip class="border-yellow-500 text-yellow-500 dark:text-yellow-200">{difficulty}</Chip>
        case "easy": return <Chip class="border-green-500 text-green-500 dark:text-green-200">{difficulty}</Chip>
        case "hard": return <Chip class="border-red-400 text-red-400 dark:text-red-200">{difficulty}</Chip>
    }
}

function ProblemAttributes({ id, difficulty, acceptance, slug, thisSite }: Problem) {
    return <div class="font-mono text-sm text-base-content/50">
        {(acceptance * 100).toFixed(0)}% ac·
        <a href={`https://leetcode-cn.com/problems/${slug}`}>力扣中文站</a>
        {
            thisSite && <>{`·`}<a href={`https://leetcode.com/problems/${slug}`}>LeetCode</a></>
        }
    </div>
}

const Chip: ParentComponent<{ class: string }> = (props) => <div class={`inline rounded-2xl font-mono text-xs py-px px-2 border ${props.class}`}>{props.children}</div>
