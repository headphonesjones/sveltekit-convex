import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '$convex/_generated/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const post = await convex.query(api.posts.getBySlug, { slug: params.slug });
	
	if (!post) {
		error(404, 'Post not found');
	}
	
	return {
		post
	};
};

// Enable prerendering for static generation
export const prerender = true;
