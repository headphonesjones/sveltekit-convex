import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '../../../convex/_generated/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const post = await convex.query(api.posts.getBySlug, { slug: params.slug });
	
	return {
		post: post ?? null,
		slug: params.slug
	};
};

// Enable prerendering for static generation (great for SEO)
export const prerender = true;

