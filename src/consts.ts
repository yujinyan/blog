// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = `All posts | Yu Jinyan's Blog`;
export const SITE_DESCRIPTION = `Yu Jinyan's personal site to blog his learnings of technology.`;
export const GITHUB_URL = 'https://github.com/yujinyan/blog'
export const INDEX_TITLE = `Jinyan's Blog`;
export const AUTHOR_NAME = 'i@yujinyan.me'

export function githubUrl(type: 'index' | number | undefined): string | undefined {
    if (type === undefined) {
        return undefined;
    }
    if (type === 'index') {
        return "https://github.com/yujinyan/blog"
    }
    return `https://github.com/yujinyan/blog/issues/${type}`
}

export function githubDiscussionUrl(discussionId: number | undefined): string | undefined {
    if (!discussionId) {
        return undefined
    }
    return `https://github.com/yujinyan/blog/discussions/${discussionId}`
}
