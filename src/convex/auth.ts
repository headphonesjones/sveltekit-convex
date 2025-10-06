import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuth } from 'better-auth';

// Use SITE_URL from Convex environment (set via: bunx convex env set SITE_URL http://localhost:5173)
// TEMPORARY: Hardcoded for debugging - remove once working
const siteUrl = process.env.SITE_URL || 'http://localhost:5173';
console.log('[Convex Auth] SITE_URL:', siteUrl);

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>, { optionsOnly } = { optionsOnly: false }) => {
	console.log('[Convex Auth] createAuth called with baseURL:', siteUrl);
	return betterAuth({
		// disable logging when createAuth is called just to generate options.
		// this is not required, but there's a lot of noise in logs without it.
		logger: {
			disabled: optionsOnly
		},
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		trustedOrigins: [
			'http://localhost:5173',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:3210',
			'https://marvelous-corgi-142.convex.cloud',
			process.env.CONVEX_SITE_URL
		].filter(Boolean) as string[],
		// Configure simple, non-verified email/password to get started
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false
		},
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex()
		]
	});
};

// Example function for getting the current user
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx);
	}
});
