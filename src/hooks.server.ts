import type { Handle } from '@sveltejs/kit';

// Convex Auth handles sessions client-side
// No server-side hooks needed for client-side auth
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};