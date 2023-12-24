import {defineCollection, reference, z} from 'astro:content';

const languages = ["en", "zh-cmn-Hans"] as const;
const bookStatuses = ["done", "planned"] as const;

const blog = defineCollection({
	type: "content",
	// Type-check frontmatter using a schema
	schema: ({image}) => z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		date: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		updatedDate: z
			.string()
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		heroImage: image().optional(),
		issueId: z.number().optional(),
		discussionId: z.number().optional(),
		lang: z.enum(languages).default("zh-cmn-Hans"),
		book: reference("book").optional(),
	}),
});

const book = defineCollection({
	type: "data",
	schema: ({image}) => z.object({
		id: z.string(),
		title: z.string(),
		year: z.number(),
		author: z.string(),
		status: z.enum(bookStatuses).default("planned"),
		cover: image(),
		post: reference("blog").optional()
	})
})

const bookmark = defineCollection({
	type: "data",
	schema: ({image}) => z.object({
		url: z.string(),
		title: z.string(),
		description: z.string().optional(),
		image: image().optional(),
	})
})

export const collections = { blog, book, leetcode: blog, bookmark };
export type Lang = typeof languages[number];
export type BookStatus = typeof bookStatuses[number]
