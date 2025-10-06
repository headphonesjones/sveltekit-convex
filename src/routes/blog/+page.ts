import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '../../convex/_generated/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	const posts = await convex.query(api.posts.listPublished, { limit: 20 });
	
	return {
		posts
	};
};

// Enable prerendering for static generation
export const prerender = true;
