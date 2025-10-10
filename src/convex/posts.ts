import { query, mutation, QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';

// Helper function to check if slug exists
async function slugExists(
	ctx: QueryCtx | MutationCtx,
	slug: string,
	excludeId?: Id<'posts'>
): Promise<boolean> {
	const existing = await ctx.db
		.query('posts')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.first();
	
	if (!existing) return false;
	if (excludeId && existing._id === excludeId) return false;
	return true;
}

// Get all published posts (for public blog listing)
// Returns only fields needed for the listing page (excludes large 'content' field)
export const listPublished = query({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;
		
		const posts = await ctx.db
			.query('posts')
			.withIndex('by_published', (q) => 
				q.eq('published', true)
			)
			.order('desc')
			.take(limit);
		
		// Return only fields needed for listing (excludes large 'content' field)
		return posts.map(post => ({
			_id: post._id,
			_creationTime: post._creationTime,
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			tags: post.tags
		}));
	}
});

// Get a single post by slug
export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const post = await ctx.db
			.query('posts')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();
		
		if (!post) {
			return null;
		}
		
		// Only return published posts for public access
		// Admin routes will use different queries
		if (!post.published) {
			return null;
		}
		
		return post;
	}
});

// Get all posts (including drafts) - for admin
export const listAll = query({
	args: {
		paginationOpts: v.object({
			numItems: v.number(),
			cursor: v.union(v.string(), v.null())
		})
	},
	handler: async (ctx, args) => {
		// In production, add auth check here
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Not authenticated');
		
		return await ctx.db
			.query('posts')
			.withIndex('by_created')
			.order('desc')
			.paginate(args.paginationOpts);
	}
});

// Get a single post by ID (for editing)
export const getById = query({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		// In production, add auth check here
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Not authenticated');
		
		return await ctx.db.get(args.id);
	}
});

// Create a new post
export const create = mutation({
	args: {
		title: v.string(),
		slug: v.string(),
		content: v.string(),
		excerpt: v.string(),
		published: v.boolean(),
		tags: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		// In production, add auth check here
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Not authenticated');
		
		// Check if slug already exists
		if (await slugExists(ctx, args.slug)) {
			throw new Error('A post with this slug already exists');
		}
		
		const now = Date.now();
		
		const postId = await ctx.db.insert('posts', {
			title: args.title,
			slug: args.slug,
			content: args.content,
			excerpt: args.excerpt,
			published: args.published,
			publishedAt: args.published ? now : undefined,
			createdAt: now,
			updatedAt: now,
			tags: args.tags ?? []
			// authorId: identity.subject // Add when auth is enabled
		});
		
		return postId;
	}
});

// Update an existing post
export const update = mutation({
	args: {
		id: v.id('posts'),
		title: v.optional(v.string()),
		slug: v.optional(v.string()),
		content: v.optional(v.string()),
		excerpt: v.optional(v.string()),
		published: v.optional(v.boolean()),
		tags: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		// In production, add auth check here
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Not authenticated');
		
		const { id, ...updates } = args;
		
		const existingPost = await ctx.db.get(id);
		if (!existingPost) {
			throw new Error('Post not found');
		}
		
		// If slug is being updated, check for duplicates
		if (updates.slug && updates.slug !== existingPost.slug) {
			if (await slugExists(ctx, updates.slug, id)) {
				throw new Error('A post with this slug already exists');
			}
		}
		
		// If publishing for the first time, set publishedAt
		const patchData: any = {
			...updates,
			updatedAt: Date.now()
		};
		
		if (updates.published && !existingPost.published) {
			patchData.publishedAt = Date.now();
		}
		
		await ctx.db.patch(id, patchData);
		
		return id;
	}
});

// Delete a post
export const remove = mutation({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		// In production, add auth check here
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Not authenticated');
		
		await ctx.db.delete(args.id);
	}
});
