import _data  from './data.json';

const problemsById = _data.stat_status_pairs.reduce((acc, item) => {
    acc[item.stat.frontend_question_id] = item
    return acc
  }, {})
  const LEVEL_TO_DIFFICULTY = {
    1: "easy", 2: "medium", 3: "hard",
  }

/**
 * @param {number} id 
 * @returns {{id: number, title: string, slug: string, acceptance: number, difficulty: 'easy' | 'medium' | 'hard' }}
 */
export function getProblemById(id) {
  const _data = problemsById[id]
  if (!_data) throw Error(`leetcode problem with id ${id} not found.`)
  return {
    id,
    title: _data.stat.question__title,
    slug: _data.stat.question__title_slug,
    acceptance: _data.stat.total_acs / _data.stat.total_submitted,
    difficulty: LEVEL_TO_DIFFICULTY[_data.difficulty.level],
  }
}