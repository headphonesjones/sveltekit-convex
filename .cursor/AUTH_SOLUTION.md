# Convex Auth with SvelteKit - Session-Based Solution

## The Challenge

Convex Auth's Password provider is designed primarily for React applications, where JWT tokens are automatically handled by React hooks. In SvelteKit with `convex-svelte`, the JWT tokens weren't being properly sent via WebSocket connections.

## The Solution: Session-Based Authentication

Instead of trying to pass JWT tokens through WebSockets (which doesn't work with `convex-svelte`), we extract the session ID from the JWT and query the session table directly.

---

## Implementation

### 1. Backend Configuration

**Auth Setup** (`src/convex/auth.ts`):
```typescript
import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [Password]
});
```

**HTTP Routes** (`src/convex/http.ts`):
```typescript
import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
```

**Schema with Auth Tables** (`src/convex/schema.ts`):
```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
	...authTables,  // Includes users, authSessions, authAccounts, etc.
	posts: defineTable({
		// Your tables...
	})
});
```

### 2. Auth Queries

**Session Validation** (`src/convex/users.ts`):
```typescript
import { query } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

export const isAuthenticated = query({
	args: { sessionId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		if (!args.sessionId) {
			const userId = await auth.getUserId(ctx);
			return userId !== null;
		}
		
		// Check if session exists and is valid
		const session = await ctx.db
			.query('authSessions')
			.filter((q) => q.eq(q.field('_id'), args.sessionId))
			.first();
		
		if (!session) return false;
		
		// Check expiration
		const now = Date.now();
		return !session.expirationTime || session.expirationTime > now;
	}
});
```

### 3. Client Helpers

**Auth Functions** (`src/lib/auth-client.ts`):
```typescript
import type { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

export async function signIn(
	convex: ConvexClient,
	email: string,
	password: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const result = await convex.action(api.auth.signIn, {
			provider: 'password',
			params: { email, password, flow: 'signIn' }
		}) as any;

		if (result?.tokens) {
			// Extract session ID from JWT payload
			const token = result.tokens.token;
			const payload = JSON.parse(atob(token.split('.')[1]));
			const [userId, sessionId] = payload.sub.split('|');
			
			// Store for auth checks
			localStorage.setItem('convex-auth-session-id', sessionId);
			localStorage.setItem('convex-auth-user-id', userId);
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Sign in failed'
		};
	}
}

export async function signOut(convex: ConvexClient): Promise<void> {
	await convex.action(api.auth.signOut, {});
	localStorage.removeItem('convex-auth-session-id');
	localStorage.removeItem('convex-auth-user-id');
}
```

### 4. Protected Routes

**Admin Layout** (`src/routes/admin/+layout.svelte`):
```svelte
<script>
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const convex = useConvexClient();
	
	// Get session ID from localStorage
	const sessionId = $state(
		browser ? localStorage.getItem('convex-auth-session-id') : null
	);

	// Check authentication status
	const isAuthQuery = useQuery(api.users.isAuthenticated, { sessionId });

	// Redirect if not authenticated
	$effect(() => {
		if (isAuthQuery.data === false) {
			goto('/auth/sign-in');
		}
	});

	async function handleSignOut() {
		await signOut(convex);
		goto('/auth/sign-in');
	}
</script>

{#if isAuthQuery.data === undefined}
	<p>Loading...</p>
{:else if isAuthQuery.data}
	<!-- Protected content -->
	<button onclick={handleSignOut}>Sign Out</button>
	{@render children()}
{/if}
```

---

## How It Works

### Authentication Flow

```
1. User submits credentials
   ↓
2. signIn() calls api.auth.signIn action
   ↓
3. Convex Auth validates and creates session
   ↓
4. Returns JWT with { sub: "userId|sessionId" }
   ↓
5. Client extracts sessionId from JWT
   ↓
6. Stores sessionId in localStorage
   ↓
7. Protected routes query authSessions table
   ↓
8. Session is valid → user is authenticated ✅
```

### Why This Approach Works

**Problem with JWT Tokens:**
- Convex Auth's JWTs are designed for React's `ConvexAuthProvider`
- The provider handles token storage and WebSocket authentication automatically
- In SvelteKit with `convex-svelte`, tokens don't propagate to WebSocket connections
- `ctx.auth.getUserIdentity()` returns `null` even with valid tokens

**Session-Based Solution:**
- Extract session ID from JWT payload (`sub` field contains `userId|sessionId`)
- Store session ID in localStorage
- Query `authSessions` table directly to validate authentication
- Works perfectly with SvelteKit's client-side routing
- No WebSocket token issues

---

## Key Files

```
src/
├── lib/
│   └── auth-client.ts          # signIn, signOut helpers
├── routes/
│   ├── auth/
│   │   ├── sign-in/
│   │   │   └── +page.svelte    # Sign in form
│   │   └── sign-up/
│   │       └── +page.svelte    # Sign up form
│   └── admin/
│       └── +layout.svelte      # Protected route wrapper

convex/
├── auth.ts                     # Convex Auth config
├── http.ts                     # Auth HTTP routes
├── users.ts                    # isAuthenticated query
└── schema.ts                   # Schema with authTables
```

---

## Testing

1. **Sign Up:**
   - Go to `/auth/sign-up`
   - Enter email and password
   - Creates user in `users` table
   - Creates session in `authSessions` table

2. **Sign In:**
   - Go to `/auth/sign-in`
   - Enter credentials
   - Extracts and stores session ID
   - Redirects to protected route

3. **Protected Routes:**
   - Try accessing `/admin`
   - If not authenticated → redirects to sign-in
   - If authenticated → shows content

4. **Sign Out:**
   - Click sign out button
   - Clears session from localStorage
   - Redirects to sign-in page

---

## Advantages

✅ **Works with SvelteKit** - No React dependencies needed
✅ **Type-Safe** - Full TypeScript support from DB to UI
✅ **Real-Time** - Auth queries auto-update via Convex
✅ **Simple** - No complex token management
✅ **Secure** - Sessions stored in database, validated on every request
✅ **Persistent** - Sessions survive page reloads via localStorage

---

## Future Enhancements

- Add password reset flow (via Convex Auth's built-in support)
- Add email verification
- Add OAuth providers (GitHub, Google, etc.)
- Add session refresh logic
- Add "remember me" functionality
- Server-side rendering support (if needed)

---

## Documentation

- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Convex Auth Password Provider](https://labs.convex.dev/auth/config/passwords)
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [convex-svelte Package](https://www.npmjs.com/package/convex-svelte)
