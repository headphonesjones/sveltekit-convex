import { query } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

/**
 * Get the current authenticated user
 * Returns the user document from the Convex Auth users table
 */
export const currentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			return null;
		}

		// auth.getUserId() returns a properly typed Id<'users'>
		// Get user document directly by ID from the users table (created by Convex Auth)
		const user = await ctx.db.get(userId);
		return user;
	}
});

/**
 * Check if user is authenticated by checking if they have an active session
 */
export const isAuthenticated = query({
	args: { sessionId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		console.log('[isAuthenticated] Checking session:', args.sessionId);
		
		// If no session ID provided, check via Convex Auth
		if (!args.sessionId) {
			const userId = await auth.getUserId(ctx);
			console.log('[isAuthenticated] No sessionId, userId from auth:', userId);
			return userId !== null;
		}
		
		// Check if the session exists and is valid
		const session = await ctx.db
			.query('authSessions')
			.filter((q) => q.eq(q.field('_id'), args.sessionId))
			.first();
		
		console.log('[isAuthenticated] Session found:', !!session);
		console.log('[isAuthenticated] Session expirationTime:', session?.expirationTime);
		
		if (!session) {
			return false;
		}
		
		// Check if session is expired
		const now = Date.now();
		if (session.expirationTime && session.expirationTime < now) {
			console.log('[isAuthenticated] Session expired');
			return false;
		}
		
		console.log('[isAuthenticated] Session valid');
		return true;
	}
});

