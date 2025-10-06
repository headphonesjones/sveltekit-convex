import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	posts: defineTable({
		title: v.string(),
		slug: v.string(),
		content: v.string(),
		excerpt: v.string(),
		published: v.boolean(),
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
		authorId: v.optional(v.string()),
		tags: v.optional(v.array(v.string()))
	})
		.index('by_slug', ['slug'])
		.index('by_published', ['published', 'publishedAt'])
		.index('by_created', ['createdAt'])
});
