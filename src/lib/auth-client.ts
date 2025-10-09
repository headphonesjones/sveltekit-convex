import type { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

/**
 * Sign in with email and password
 * 
 * Convex Auth's Password provider creates a session and returns JWT tokens.
 * We store the session ID to maintain authentication state.
 */
export async function signIn(
	convex: ConvexClient,
	email: string,
	password: string
): Promise<{ success: boolean; error?: string }> {
	try {
		console.log('Calling Convex auth signIn action...');
		const result = await convex.action(api.auth.signIn, {
			provider: 'password',
			params: { email, password, flow: 'signIn' }
		}) as any;
		console.log('Convex auth signIn result:', result);

		// The action returns tokens with the session information
		if (result?.tokens) {
			console.log('Sign-in successful');
			
			// Extract the session ID from the JWT subject
			// Format is: userId|sessionId
			const token = result.tokens.token;
			const payload = JSON.parse(atob(token.split('.')[1]));
			const [userId, sessionId] = payload.sub.split('|');
			
			console.log('User ID:', userId);
			console.log('Session ID:', sessionId);
			
			// Store the session ID
			localStorage.setItem('convex-auth-session-id', sessionId);
			localStorage.setItem('convex-auth-user-id', userId);
		}

		return { success: true };
	} catch (error) {
		console.error('Sign in error:', error);
		// Extract more detailed error message
		const errorMessage = error instanceof Error 
			? error.message 
			: typeof error === 'object' && error !== null && 'message' in error
			? String(error.message)
			: 'Sign in failed';
		
		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Sign up with email and password
 * @param convex - The Convex client from useConvexClient()
 */
export async function signUp(
	convex: ConvexClient,
	email: string,
	password: string,
	name?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Call the Convex auth signIn action with signUp flow
		await convex.action(api.auth.signIn, {
			provider: 'password',
			params: { email, password, name, flow: 'signUp' }
		});

		return { success: true };
	} catch (error) {
		console.error('Sign up error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Sign up failed'
		};
	}
}

/**
 * Sign out
 * @param convex - The Convex client from useConvexClient()
 */
export async function signOut(convex: ConvexClient): Promise<void> {
	try {
		// Call the Convex auth signOut action
		await convex.action(api.auth.signOut, {});
		
		// Clear the stored session info
		localStorage.removeItem('convex-auth-session-id');
		localStorage.removeItem('convex-auth-user-id');
		console.log('Signed out, cleared session');
	} catch (error) {
		console.error('Sign out error:', error);
		// Clear session even if signOut fails
		localStorage.removeItem('convex-auth-session-id');
		localStorage.removeItem('convex-auth-user-id');
	}
}
