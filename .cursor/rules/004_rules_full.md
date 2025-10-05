---
description: Main Project Tech Stack Full
globs:
alwaysApply: false
---

# SvelteKit + Convex Starter Template - Cursor Rules

This document provides comprehensive documentation for this SvelteKit project template. It serves as the authoritative guide for AI assistants and developers working on projects built from this starter.

---

## 🎯 Project Philosophy

This is a modern, type-safe, full-stack SvelteKit starter template designed for rapid application development. The stack prioritizes:

- **Type Safety**: End-to-end TypeScript with compile-time guarantees
- **Developer Experience**: Minimal boilerplate, maximum productivity
- **Modern Patterns**: Svelte 5 runes, functional error handling, reactive utilities
- **Real-time Capabilities**: Built-in support for live data synchronization
- **Performance**: Optimized by default with SvelteKit's built-in optimizations

---

## 📦 Package Manager: Bun

**CRITICAL**: This project uses **Bun**, NOT npm or yarn.

### Why Bun?

- **Speed**: 2-3x faster than npm/yarn for installations
- **All-in-one**: Runtime + package manager + bundler + test runner
- **Drop-in replacement**: Compatible with Node.js APIs and npm packages
- **Better caching**: Workspaces and global cache for faster installs

### Common Commands

```bash
# Install dependencies
bun install

# Add a package
bun add package-name

# Add a dev dependency
bun add -d package-name

# Remove a package
bun remove package-name

# Run scripts
bun run dev
bun run build

# Run files directly
bun run file.ts
```

### Important Notes

- Always use `bun` commands, never `npm` or `yarn`
- `bun.lock` is the lockfile (equivalent to package-lock.json)
- Bun has native TypeScript support - no transpilation needed for scripts

---

## 🔷 SvelteKit: The Foundation

SvelteKit is the meta-framework built on top of Svelte 5, providing routing, server-side rendering, API routes, and more.

### Svelte 5 Runes System

Svelte 5 introduces **runes** - built-in compiler keywords prefixed with `$` that replace the old reactive syntax.

#### `$state` - Reactive State

Creates deeply reactive state that automatically updates the UI.

```svelte
<script>
	// Old Svelte 4 way: let count = 0;
	let count = $state(0); // New Svelte 5 way

	// Objects and arrays are deeply reactive
	let user = $state({
		name: 'Alice',
		profile: { age: 30 }
	});

	// Mutations work directly
	function updateAge() {
		user.profile.age += 1; // UI updates automatically
	}
</script>

<button onclick={() => count++}>
	Clicked {count} times
</button>
```

**Key Rules:**

- DO NOT destructure reactive state objects - it breaks reactivity
- DO mutate objects/arrays directly - proxies handle reactivity
- Use `$state.raw()` for non-reactive data (rare cases)
- Use `$state.snapshot()` to get plain object copies (for external APIs)

#### `$derived` - Computed Values

Creates reactive computed values that update when dependencies change.

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2); // Recomputes when count changes

	// For complex logic, use $derived.by
	let status = $derived.by(() => {
		if (count === 0) return 'empty';
		if (count < 10) return 'low';
		return 'high';
	});
</script>

<p>Count: {count}, Doubled: {doubled}, Status: {status}</p>
```

**Key Rules:**

- Keep derived values PURE - no side effects
- Use `$derived.by()` for multi-line logic
- Derived values can be reassigned (useful for optimistic UI)
- Old Svelte 4 `$:` syntax is replaced by `$derived`

#### `$effect` - Side Effects

Executes code when reactive dependencies change.

```svelte
<script>
	let count = $state(0);

	// Runs after DOM updates
	$effect(() => {
		console.log(`Count changed to ${count}`);
		document.title = `Count: ${count}`;

		// Return cleanup function
		return () => {
			console.log('Cleaning up...');
		};
	});

	// Run BEFORE DOM updates (rare, for things like scroll position)
	$effect.pre(() => {
		const scrollPos = element.scrollTop;
		return () => {
			element.scrollTop = scrollPos;
		};
	});
</script>
```

**Key Rules:**

- Use for DOM manipulation, logging, analytics, subscriptions
- DO NOT use for state synchronization (use `$derived` instead)
- Always return cleanup functions when needed
- Effects run after DOM updates by default
- Use `$effect.pre()` only for pre-DOM operations

#### `$props` - Component Props

Defines component props with TypeScript support and default values.

```svelte
<script>
	// Old Svelte 4: export let title; export let count = 0;

	// New Svelte 5
	let {
		title, // Required prop
		count = 0, // Optional with default
		onUpdate, // Callback prop
		...rest // Rest props
	} = $props();
</script>

<div {...rest}>
	<h1>{title}</h1>
	<p>{count}</p>
</div>
```

**Key Rules:**

- DO NOT mutate props directly
- Use callbacks to communicate changes to parent
- Props are readonly by default
- Use `$bindable()` for two-way binding (rare cases)

#### `$inspect` - Debugging

Development-only tool for debugging reactive values.

```svelte
<script>
	let count = $state(0);

	// Logs to console when count changes
	$inspect(count);

	// With label
	$inspect('Current count:', count);
</script>
```

### SvelteKit Remote Functions

**Remote functions** enable type-safe, direct server-to-client communication without manual API routes.

#### Configuration

Already enabled in `svelte.config.js`:

```javascript
export default {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

#### Four Types of Remote Functions

1. **`query`** - Read data (GET-like)

```typescript
// src/routes/api/posts.remote.ts
import { query } from '@sveltejs/kit';

export const getPosts = query(async () => {
	// Can access server-only modules
	const posts = await db.posts.findMany();
	return posts;
});

// Usage in component
import { getPosts } from './api/posts.remote';

let posts = $state(await getPosts());
```

2. **`form`** - Handle form submissions

```typescript
// src/routes/auth/login.remote.ts
import { form } from '@sveltejs/kit';

export const login = form(async (event, formData) => {
	const email = formData.get('email');
	const password = formData.get('password');

	// Validate and authenticate
	const user = await authenticate(email, password);

	return { success: true, user };
});
```

3. **`command`** - Execute state-changing operations

```typescript
// src/routes/posts/create.remote.ts
import { command } from '@sveltejs/kit';

export const createPost = command(async (event, title: string, content: string) => {
	const post = await db.posts.create({
		data: { title, content }
	});
	return post;
});
```

4. **`prerender`** - Fetch data at build time

```typescript
// src/routes/blog/[slug]/page.remote.ts
import { prerender } from '@sveltejs/kit';

export const getPost = prerender(async (slug: string) => {
	return await db.posts.findUnique({ where: { slug } });
});
```

#### Remote Functions Best Practices

- **Security**: Remote functions run on server - safe for secrets/credentials
- **Type Safety**: Full TypeScript inference from server to client
- **Error Handling**: Throw errors on server, catch on client
- **Performance**: Use for simple operations; complex logic should use load functions
- **Validation**: Always validate input on server side

### SvelteKit Performance Optimizations

SvelteKit includes these optimizations by default:

1. **Code Splitting**: Each route loads only its required code
2. **Asset Preloading**: Links preload assets before navigation
3. **File Hashing**: Enables aggressive caching with content hashes
4. **Request Coalescing**: Combines multiple data fetches into one HTTP request
5. **Parallel Loading**: Fetches data simultaneously when possible
6. **Data Inlining**: Embeds fetch results in HTML to avoid duplicate requests
7. **Conservative Invalidation**: Re-fetches only when dependencies change
8. **Prerendering**: Generates static HTML for SEO and instant loads
9. **Link Preloading**: Hovers trigger prefetching of next page

**Additional Performance Tips:**

- Use `preloadData()` for critical navigation paths
- Implement proper caching headers in `+server.ts` files
- Use `$app/navigation` for client-side navigation
- Lazy load heavy components with dynamic imports
- Optimize images (consider `@sveltejs/enhanced-img`)

### SvelteKit State Management

The "Svelte way" for state management:

#### 1. Component State (Most Common)

```svelte
<script>
	// Local state - use for component-specific data
	let isOpen = $state(false);
</script>
```

#### 2. Shared State via Context

```svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';

  let sharedState = $state({ count: 0 });
  setContext('shared', sharedState);
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';

  let shared = getContext('shared');
</script>
<button onclick={() => shared.count++}>
  {shared.count}
</button>
```

#### 3. URL State (For Shareable State)

```svelte
<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	// Read from URL
	const searchQuery = $derived(page.url.searchParams.get('q') ?? '');

	// Update URL
	function setQuery(query) {
		const url = new URL(window.location.href);
		url.searchParams.set('q', query);
		goto(url, { replaceState: true });
	}
</script>
```

#### 4. Server State (Load Functions)

```typescript
// +page.ts or +page.server.ts
export async function load({ fetch, params }) {
	const post = await fetch(`/api/posts/${params.id}`).then((r) => r.json());
	return { post };
}
```

```svelte
<!-- +page.svelte -->
<script>
	let { data } = $props();
</script>

<h1>{data.post.title}</h1>
```

**Critical Rules:**

- NEVER use shared state on the server (causes data leakage between users)
- Keep load functions PURE (no side effects)
- Use `page.data` for server-loaded data
- Use context for component tree state
- Use URL for shareable/bookmarkable state

### SvelteKit Authentication Patterns

Two main approaches:

#### 1. Session-Based (Database-Backed)

```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		event.locals.user = await db.session.findUnique({
			where: { id: sessionId },
			include: { user: true }
		});
	}

	return resolve(event);
}
```

**Pros**: Immediate revocation, centralized control
**Cons**: Database query on every request

#### 2. Token-Based (JWT)

```typescript
// hooks.server.ts
import jwt from 'jsonwebtoken';

export async function handle({ event, resolve }) {
	const token = event.cookies.get('token');

	if (token) {
		try {
			event.locals.user = jwt.verify(token, SECRET);
		} catch {}
	}

	return resolve(event);
}
```

**Pros**: No database queries, stateless, better performance
**Cons**: Cannot immediately revoke, token size limits

**In this starter**: We use **Better Auth** (detailed below) which handles both patterns.

---

## 🎨 Runed: Svelte 5 Utility Library

Runed provides battle-tested utilities built on Svelte 5 runes. Think of it as "lodash for Svelte reactivity."

### Core Reactive Utilities

#### `useSearchParams` - URL Search Param Reactivity

```svelte
<script>
	import { useSearchParams } from 'runed';

	const searchParams = useSearchParams();

	// Reactive access
	const query = $derived(searchParams.current.get('q') ?? '');

	// Update URL
	function updateQuery(value) {
		searchParams.current.set('q', value);
	}
</script>

<input value={query} oninput={(e) => updateQuery(e.target.value)} />
```

#### `watch` - React to Changes

```svelte
<script>
	import { watch } from 'runed';

	let count = $state(0);

	// Watch for changes
	watch(
		() => count,
		(newCount, oldCount) => {
			console.log(`Count changed from ${oldCount} to ${newCount}`);
		}
	);
</script>
```

#### `resource` - Async Resource Management

```svelte
<script>
	import { resource } from 'runed';

	const userId = $state(1);

	// Automatically refetches when userId changes
	const userResource = resource(() => fetch(`/api/users/${userId}`).then((r) => r.json()));
</script>

{#if userResource.loading}
	<p>Loading...</p>
{:else if userResource.error}
	<p>Error: {userResource.error.message}</p>
{:else if userResource.data}
	<p>User: {userResource.data.name}</p>
{/if}
```

### State Management Utilities

#### `PersistedState` - LocalStorage/SessionStorage

```svelte
<script>
	import { PersistedState } from 'runed';

	// Persists to localStorage
	const theme = new PersistedState('theme', 'light');

	function toggleTheme() {
		theme.current = theme.current === 'light' ? 'dark' : 'light';
	}
</script>

<button onclick={toggleTheme}>
	Current theme: {theme.current}
</button>
```

#### `StateHistory` - Undo/Redo

```svelte
<script>
	import { StateHistory } from 'runed';

	const history = new StateHistory('');

	function type(char) {
		history.push(history.current + char);
	}
</script>

<input bind:value={history.current} />
<button onclick={() => history.undo()}>Undo</button>
<button onclick={() => history.redo()}>Redo</button>
```

#### `Context` - Type-Safe Context

```svelte
<script>
	import { Context } from 'runed';

	// Define once
	const userContext = new Context<User>('user');

	// In parent
	userContext.set({ name: 'Alice', id: 1 });

	// In child
	const user = userContext.get();
</script>
```

### Element Utilities

#### `activeElement` - Track Focus

```svelte
<script>
	import { activeElement } from 'runed';

	const focused = activeElement();
</script>

<p>Currently focused: {focused.current?.tagName}</p>
```

#### `ScrollState` - Track Scrolling

```svelte
<script>
	import { ScrollState } from 'runed';

	const scroll = new ScrollState(element);

	const isScrollingDown = $derived(scroll.directions.bottom);
</script>

{#if isScrollingDown}
	<button class="scroll-to-top">↑</button>
{/if}
```

#### `ElementSize` - Responsive Components

```svelte
<script>
	import { ElementSize } from 'runed';

	let element;
	const size = new ElementSize(() => element);
</script>

<div bind:this={element}>
	Width: {size.width}px, Height: {size.height}px
</div>
```

### Browser Utilities

#### `useEventListener` - Declarative Events

```svelte
<script>
	import { useEventListener } from 'runed';

	useEventListener(window, 'resize', () => {
		console.log('Window resized!');
	});

	useEventListener(document, 'keydown', (e) => {
		if (e.key === 'Escape') {
			closeModal();
		}
	});
</script>
```

### When to Use Runed

- **DO use** when you need common reactive patterns
- **DO use** for cross-cutting concerns (focus, scroll, resize)
- **DO use** for URL state management
- **DO use** for persisted state
- **DON'T use** when simple `$state` suffices
- **DON'T use** as a crutch for poor architecture

---

## ⚠️ Neverthrow: Functional Error Handling

Neverthrow provides a `Result` type for type-safe error handling without try-catch.

### The Result Type

```typescript
import { ok, err, Result } from 'neverthrow';

// Result<SuccessType, ErrorType>
function divide(a: number, b: number): Result<number, string> {
	if (b === 0) {
		return err('Cannot divide by zero');
	}
	return ok(a / b);
}
```

### Basic Usage

```typescript
const result = divide(10, 2);

// Pattern matching
result.match({
	ok: (value) => console.log('Success:', value),
	err: (error) => console.error('Error:', error)
});

// Unwrapping (throws if error)
const value = result.unwrap();

// Safe unwrapping with default
const value = result.unwrapOr(0);

// Check if ok/err
if (result.isOk()) {
	console.log(result.value);
}
```

### Chaining Operations

```typescript
const result = divide(10, 2)
	.map((n) => n * 2) // Transform success value
	.map((n) => n.toString()) // Chain transformations
	.mapErr((e) => `Error: ${e}`) // Transform error
	.andThen((s) => {
		// Chain Result-returning operations
		if (s.length > 5) {
			return err('Too long');
		}
		return ok(s);
	});
```

### Async Results

```typescript
import { ResultAsync } from 'neverthrow';

async function fetchUser(id: string): Promise<Result<User, Error>> {
	try {
		const response = await fetch(`/api/users/${id}`);
		if (!response.ok) {
			return err(new Error('Not found'));
		}
		const user = await response.json();
		return ok(user);
	} catch (error) {
		return err(error);
	}
}

// Or use ResultAsync for cleaner code
const userResult = ResultAsync.fromPromise(
	fetch('/api/users/1').then((r) => r.json()),
	(error) => new Error('Fetch failed')
);
```

### Combining Results

```typescript
import { combine } from 'neverthrow';

const result1 = ok(1);
const result2 = ok(2);
const result3 = ok(3);

// Combine multiple results
const combined = combine([result1, result2, result3]);
// Result<[1, 2, 3], never>

// First error short-circuits
const mixed = combine([ok(1), err('failed'), ok(3)]);
// Result<never, 'failed'>
```

### Integration with SvelteKit

```typescript
// +page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await fetchUser(params.id);

	return result.match({
		ok: (user) => ({ user }),
		err: (e) => error(404, e.message)
	});
};
```

### When to Use Neverthrow

- **DO use** for operations that can fail predictably
- **DO use** in data fetching, validation, parsing
- **DO use** at system boundaries (API calls, DB queries)
- **DO use** when you want exhaustive error handling
- **DON'T use** for unexpected errors (use try-catch)
- **DON'T use** everywhere (adds complexity)
- **DON'T use** for simple boolean checks

### ESLint Plugin

This project includes `eslint-plugin-neverthrow` for enforcing best practices:

```json
{
	"plugins": ["neverthrow"],
	"rules": {
		"neverthrow/must-use-result": "error"
	}
}
```

---

## 🗄️ Convex: Real-time Backend Database

Convex is a Backend-as-a-Service providing a real-time database, serverless functions, file storage, and scheduled jobs - all with TypeScript.

### Core Concepts

1. **Reactive Queries**: Automatically re-run when data changes
2. **Serverless Functions**: Write backend logic without infrastructure
3. **Type Safety**: Full TypeScript inference from backend to frontend
4. **Real-time**: WebSocket-based live updates
5. **Transactional**: All operations are ACID-compliant

### Setup

```bash
# Install Convex
bun add convex convex-svelte

# Initialize Convex project
bunx convex init
```

This creates:

- `convex/` directory for backend code
- `.env.local` with Convex URL
- `convex.json` config file

### Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	posts: defineTable({
		title: v.string(),
		content: v.string(),
		authorId: v.id('users'),
		published: v.boolean(),
		createdAt: v.number(),
		tags: v.array(v.string())
	})
		.index('by_author', ['authorId'])
		.index('by_published', ['published', 'createdAt']),

	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string())
	}).index('by_email', ['email'])
});
```

**Key Points:**

- Schema is TypeScript - full type safety
- Indexes improve query performance
- Support for nested objects, arrays, unions
- Automatic migrations when schema changes

### Query Functions (Read Data)

```typescript
// convex/posts.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('posts')
			.filter((q) => q.eq(q.field('published'), true))
			.order('desc')
			.take(10);
	}
});

export const get = query({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.id);
		if (!post) {
			throw new Error('Post not found');
		}
		return post;
	}
});

export const byAuthor = query({
	args: { authorId: v.id('users') },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('authorId', args.authorId))
			.collect();
	}
});
```

### Mutation Functions (Write Data)

```typescript
// convex/posts.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		authorId: v.id('users')
	},
	handler: async (ctx, args) => {
		const postId = await ctx.db.insert('posts', {
			title: args.title,
			content: args.content,
			authorId: args.authorId,
			published: false,
			createdAt: Date.now(),
			tags: []
		});
		return postId;
	}
});

export const update = mutation({
	args: {
		id: v.id('posts'),
		title: v.optional(v.string()),
		content: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
	}
});

export const remove = mutation({
	args: { id: v.id('posts') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
```

### Using Convex in SvelteKit

```svelte
<!-- +layout.svelte -->
<script>
	import { ConvexProvider } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	let { children } = $props();
</script>

<ConvexProvider client={PUBLIC_CONVEX_URL}>
	{@render children()}
</ConvexProvider>
```

```svelte
<!-- PostsList.svelte -->
<script>
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	// Reactive query - automatically updates when data changes
	const posts = useQuery(api.posts.list, {});
</script>

{#if $posts === undefined}
	<p>Loading...</p>
{:else if $posts.length === 0}
	<p>No posts yet</p>
{:else}
	<ul>
		{#each $posts as post}
			<li>{post.title}</li>
		{/each}
	</ul>
{/if}
```

```svelte
<!-- CreatePost.svelte -->
<script>
	import { useMutation } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const createPost = useMutation(api.posts.create);

	let title = $state('');
	let content = $state('');

	async function handleSubmit() {
		await createPost({
			title,
			content,
			authorId: currentUser.id
		});
		title = '';
		content = '';
	}
</script>

<form onsubmit={handleSubmit}>
	<input bind:value={title} placeholder="Title" />
	<textarea bind:value={content} placeholder="Content" />
	<button type="submit">Create Post</button>
</form>
```

### Convex Actions (External APIs)

For operations that need to call external APIs, use actions:

```typescript
// convex/notifications.ts
import { action } from './_generated/server';
import { v } from 'convex/values';

export const sendEmail = action({
	args: {
		to: v.string(),
		subject: v.string(),
		body: v.string()
	},
	handler: async (ctx, args) => {
		// Can use fetch, access env vars, call mutations
		const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.SENDGRID_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: args.to,
				subject: args.subject,
				html: args.body
			})
		});

		// Can call mutations to update database
		await ctx.runMutation(api.notifications.markSent, {
			email: args.to
		});

		return response.ok;
	}
});
```

### Scheduled Functions (Cron Jobs)

```typescript
// convex/crons.ts
import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Run every day at midnight
crons.daily('clean-old-posts', { hourUTC: 0, minuteUTC: 0 }, internal.posts.cleanOldPosts);

// Run every hour
crons.hourly('send-digest', { minuteUTC: 0 }, internal.emails.sendDigest);

export default crons;
```

### File Storage

```typescript
// Upload file
export const uploadImage = mutation({
	args: { storageId: v.string() },
	handler: async (ctx, args) => {
		const url = await ctx.storage.getUrl(args.storageId);
		return url;
	}
});

// In component
const uploadFile = async (file: File) => {
	const storageId = await convex.mutation(api.files.generateUploadUrl);
	const result = await fetch(storageId, {
		method: 'POST',
		body: file
	});
	// Use storageId in mutation
};
```

### Best Practices

1. **Indexes**: Add indexes for all queries (Convex will warn you)
2. **Pagination**: Use `.paginate()` for large datasets
3. **Authentication**: Store user info in ctx.auth (see Better Auth integration)
4. **Transactions**: All mutations are automatically transactional
5. **Error Handling**: Throw errors in functions - caught automatically
6. **Real-time**: Queries auto-update - embrace reactive patterns
7. **Type Safety**: Import from `_generated/` for full types

### Integration with Neverthrow

```typescript
export const getSafe = query({
	args: { id: v.id('posts') },
	handler: async (ctx, args): Promise<Result<Post, string>> => {
		const post = await ctx.db.get(args.id);
		if (!post) {
			return err('Post not found');
		}
		return ok(post);
	}
});
```

---

## 🔐 Better Auth: Authentication System

Better Auth is a modern authentication library that works seamlessly with SvelteKit and Convex.

### Why Better Auth?

- **Framework Agnostic**: Works with any JS framework
- **Flexible**: Email/password, OAuth, magic links, 2FA
- **Type Safe**: Full TypeScript support
- **Database Agnostic**: Works with Convex, Prisma, Drizzle, etc.
- **Secure**: Built-in CSRF protection, secure cookies
- **Modern**: Built for the edge, serverless-ready

### Installation

```bash
bun add better-auth
```

### Configuration with Convex

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { convexAdapter } from 'better-auth/adapters/convex';

export const auth = betterAuth({
	database: convexAdapter({
		deploymentUrl: process.env.CONVEX_URL!
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true
	},

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		}
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // Update every 24 hours
	},

	callbacks: {
		async afterSignUp({ user }) {
			// Send welcome email
			await sendWelcomeEmail(user.email);
		}
	}
});

export type Auth = typeof auth;
```

### SvelteKit Integration

```typescript
// src/hooks.server.ts
import { auth } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Attach auth methods to event.locals
	event.locals.auth = auth;

	// Get session
	const session = await auth.getSession(event.request);
	event.locals.session = session;
	event.locals.user = session?.user;

	return resolve(event);
};
```

```typescript
// src/app.d.ts
import type { Auth } from '$lib/auth';

declare global {
	namespace App {
		interface Locals {
			auth: Auth;
			session: Session | null;
			user: User | null;
		}
	}
}
```

### Auth API Routes

```typescript
// src/routes/auth/[...all]/+server.ts
import { auth } from '$lib/auth';

export const GET = auth.handler;
export const POST = auth.handler;
```

This creates routes:

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/sign-out`
- `/auth/callback/[provider]`
- etc.

### Client-Side Usage

```typescript
// src/lib/auth.client.ts
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:5173' // Your app URL
});
```

```svelte
<!-- SignUp.svelte -->
<script>
	import { authClient } from '$lib/auth.client';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');

	async function handleSignUp() {
		const result = await authClient.signUp.email({
			email,
			password,
			name
		});

		if (result.error) {
			error = result.error.message;
		} else {
			// Redirect to dashboard
			window.location.href = '/dashboard';
		}
	}
</script>

<form onsubmit={handleSignUp}>
	<input bind:value={name} placeholder="Name" />
	<input bind:value={email} type="email" placeholder="Email" />
	<input bind:value={password} type="password" placeholder="Password" />
	<button type="submit">Sign Up</button>
	{#if error}<p class="error">{error}</p>{/if}
</form>
```

```svelte
<!-- SignIn.svelte -->
<script>
	import { authClient } from '$lib/auth.client';

	let email = $state('');
	let password = $state('');

	async function signIn() {
		await authClient.signIn.email({ email, password });
	}

	async function signInWithGithub() {
		await authClient.signIn.social({ provider: 'github' });
	}
</script>

<form onsubmit={signIn}>
	<input bind:value={email} type="email" />
	<input bind:value={password} type="password" />
	<button type="submit">Sign In</button>
</form>

<button onclick={signInWithGithub}> Sign in with GitHub </button>
```

### Server-Side Auth

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	return {
		user: locals.user
	};
};
```

### Protected Routes

```typescript
// src/routes/dashboard/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?redirect=${url.pathname}`);
	}

	return {
		user: locals.user
	};
};
```

### Integration with Convex Queries

```typescript
// convex/posts.ts
import { query } from './_generated/server';

export const myPosts = query({
	handler: async (ctx) => {
		// Get user from auth
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		return await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('authorId', identity.subject))
			.collect();
	}
});
```

### Two-Factor Authentication

```typescript
// Enable 2FA in config
export const auth = betterAuth({
	// ... other config
	twoFactor: {
		enabled: true,
		issuer: 'YourApp'
	}
});
```

```svelte
<!-- Enable2FA.svelte -->
<script>
	import { authClient } from '$lib/auth.client';

	async function enable2FA() {
		const { qrCode, secret } = await authClient.twoFactor.generate();
		// Show QR code to user
	}

	async function verify2FA(code: string) {
		await authClient.twoFactor.verify({ code });
	}
</script>
```

### Password Reset

```svelte
<script>
	import { authClient } from '$lib/auth.client';

	let email = $state('');

	async function requestReset() {
		await authClient.forgetPassword({ email });
		// Email sent with reset link
	}
</script>
```

### Session Management

```svelte
<script>
	import { authClient } from '$lib/auth.client';

	async function signOut() {
		await authClient.signOut();
		window.location.href = '/';
	}

	async function getSessions() {
		const sessions = await authClient.listSessions();
		return sessions;
	}

	async function revokeSession(sessionId: string) {
		await authClient.revokeSession({ sessionId });
	}
</script>
```

### Best Practices

1. **Always validate on server**: Never trust client-side auth checks
2. **Use HttpOnly cookies**: Better Auth does this by default
3. **HTTPS only**: Required for production
4. **Rate limiting**: Implement on auth routes
5. **Email verification**: Enable for production
6. **2FA**: Offer to users handling sensitive data
7. **Session timeout**: Configure appropriate expiry
8. **CSRF protection**: Enabled by default

---

## 🔄 How Everything Works Together

### The Complete Stack Flow

```
User Request
    ↓
SvelteKit Route (+page.svelte)
    ↓
Better Auth (Check authentication)
    ↓
Convex Client (useQuery/useMutation)
    ↓
Convex Functions (queries/mutations)
    ↓
Convex Database (Real-time reactive)
    ↓
Data flows back with WebSocket updates
    ↓
Svelte 5 Runes (Reactivity)
    ↓
Runed Utilities (Enhanced patterns)
    ↓
Neverthrow (Type-safe error handling)
    ↓
UI Updates
```

### Example: Full-Stack Feature

Let's build a complete "Todo List" feature:

#### 1. Define Schema (Convex)

```typescript
// convex/schema.ts
export default defineSchema({
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
		userId: v.string(),
		createdAt: v.number()
	}).index('by_user', ['userId', 'createdAt'])
});
```

#### 2. Create Backend Functions (Convex)

```typescript
// convex/todos.ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		return await ctx.db
			.query('todos')
			.withIndex('by_user', (q) => q.eq('userId', identity.subject))
			.order('desc')
			.collect();
	}
});

export const create = mutation({
	args: { text: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		return await ctx.db.insert('todos', {
			text: args.text,
			completed: false,
			userId: identity.subject,
			createdAt: Date.now()
		});
	}
});

export const toggle = mutation({
	args: { id: v.id('todos') },
	handler: async (ctx, args) => {
		const todo = await ctx.db.get(args.id);
		if (!todo) throw new Error('Todo not found');

		await ctx.db.patch(args.id, {
			completed: !todo.completed
		});
	}
});

export const remove = mutation({
	args: { id: v.id('todos') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
```

#### 3. Create Frontend Component (SvelteKit + Svelte 5)

```svelte
<!-- src/routes/todos/+page.svelte -->
<script>
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { PersistedState } from 'runed';
	import { err, ok, type Result } from 'neverthrow';

	// Reactive query - auto-updates when data changes
	const todos = useQuery(api.todos.list, {});

	// Mutations
	const createTodo = useMutation(api.todos.create);
	const toggleTodo = useMutation(api.todos.toggle);
	const removeTodo = useMutation(api.todos.remove);

	// Local state with Svelte 5 runes
	let newTodoText = $state('');
	let error = $state<string | null>(null);

	// Persisted UI preference
	const showCompleted = new PersistedState('show-completed', true);

	// Derived filtered list
	const filteredTodos = $derived(
		$todos?.filter((todo) => showCompleted.current || !todo.completed) ?? []
	);

	// Derived stats
	const stats = $derived({
		total: $todos?.length ?? 0,
		completed: $todos?.filter((t) => t.completed).length ?? 0,
		pending: $todos?.filter((t) => !t.completed).length ?? 0
	});

	// Create todo with error handling
	async function handleCreate() {
		const result = await validateAndCreate(newTodoText);

		result.match({
			ok: () => {
				newTodoText = '';
				error = null;
			},
			err: (e) => {
				error = e;
			}
		});
	}

	// Validation with Neverthrow
	function validateAndCreate(text: string): Promise<Result<void, string>> {
		if (!text.trim()) {
			return Promise.resolve(err('Todo text cannot be empty'));
		}

		if (text.length > 200) {
			return Promise.resolve(err('Todo text too long (max 200 chars)'));
		}

		return createTodo({ text: text.trim() })
			.then(() => ok(undefined))
			.catch((e) => err(e.message));
	}

	// Side effect - log when todos change
	$effect(() => {
		if ($todos) {
			console.log(`Todos updated. Total: ${$todos.length}`);
		}
	});
</script>

<div class="todos">
	<h1>My Todos</h1>

	<!-- Stats -->
	<div class="stats">
		<span>Total: {stats.total}</span>
		<span>Completed: {stats.completed}</span>
		<span>Pending: {stats.pending}</span>
	</div>

	<!-- Create form -->
	<form onsubmit|preventDefault={handleCreate}>
		<input bind:value={newTodoText} placeholder="What needs to be done?" maxlength="200" />
		<button type="submit">Add</button>
	</form>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	<!-- Filter toggle -->
	<label>
		<input type="checkbox" bind:checked={showCompleted.current} />
		Show completed
	</label>

	<!-- Todo list -->
	{#if $todos === undefined}
		<p>Loading todos...</p>
	{:else if filteredTodos.length === 0}
		<p>No todos yet!</p>
	{:else}
		<ul>
			{#each filteredTodos as todo (todo._id)}
				<li class:completed={todo.completed}>
					<input
						type="checkbox"
						checked={todo.completed}
						onchange={() => toggleTodo({ id: todo._id })}
					/>
					<span>{todo.text}</span>
					<button onclick={() => removeTodo({ id: todo._id })}> Delete </button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.todos {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}
	.stats {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.error {
		color: red;
	}
	.completed {
		opacity: 0.6;
		text-decoration: line-through;
	}
</style>
```

#### 4. Protect the Route (Better Auth)

```typescript
// src/routes/todos/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Require authentication
	if (!locals.user) {
		redirect(303, `/auth/sign-in?redirect=${url.pathname}`);
	}

	return {
		user: locals.user
	};
};
```

### Key Patterns Demonstrated

1. **Svelte 5 Runes**: `$state`, `$derived`, `$effect` for reactivity
2. **Runed**: `PersistedState` for localStorage
3. **Neverthrow**: `Result` type for validation errors
4. **Convex**: Real-time queries and mutations
5. **Better Auth**: Route protection
6. **TypeScript**: Full type safety throughout

---

## 📋 Development Checklist

### Starting a New Project

- [ ] Run `bun install`
- [ ] Set up Convex: `bunx convex init`
- [ ] Configure Better Auth (if needed)
- [ ] Update `.env` with API keys
- [ ] Define database schema in `convex/schema.ts`
- [ ] Set up authentication routes if needed
- [ ] Configure `svelte.config.js` (already has remote functions enabled)

### Adding a New Feature

- [ ] Define data schema in Convex
- [ ] Create queries/mutations in `convex/`
- [ ] Create route in `src/routes/`
- [ ] Use Svelte 5 runes for reactivity
- [ ] Consider Runed utilities for common patterns
- [ ] Wrap error-prone operations in Neverthrow Results
- [ ] Add authentication checks if needed
- [ ] Test real-time updates
- [ ] Add loading/error states

### Code Review Checklist

- [ ] Using `$state` not plain `let` for reactive values
- [ ] Using `$derived` not `$:` for computed values
- [ ] Using `$effect` not `$:` for side effects
- [ ] Props use `$props()` not `export let`
- [ ] Event handlers use `onclick` not `on:click`
- [ ] No shared state on server (in +page.server.ts)
- [ ] Load functions are pure (no side effects)
- [ ] Authentication checked on server side
- [ ] Proper error handling (try-catch or Neverthrow)
- [ ] TypeScript types for all functions
- [ ] Convex queries have proper indexes
- [ ] Using Bun commands, not npm

---

## 🚨 Common Pitfalls

### 1. Destructuring Reactive State

```svelte
<!-- ❌ WRONG -->
<script>
  let user = $state({ name: 'Alice' });
  let { name } = user; // Breaks reactivity!
</script>

<!-- ✅ CORRECT -->
<script>
  let user = $state({ name: 'Alice' });
  const name = $derived(user.name); // Stays reactive
</script>
```

### 2. Using npm Instead of Bun

```bash
# ❌ WRONG
npm install package-name

# ✅ CORRECT
bun add package-name
```

### 3. Side Effects in $derived

```svelte
<!-- ❌ WRONG -->
<script>
  let count = $state(0);
  let doubled = $derived(() => {
    console.log(count); // Side effect!
    return count * 2;
  });
</script>

<!-- ✅ CORRECT -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2); // Pure

  $effect(() => {
    console.log(count); // Side effects in $effect
  });
</script>
```

### 4. Shared State on Server

```typescript
// ❌ WRONG - Leaks data between users!
let cachedUser: User;

export const load: PageServerLoad = async () => {
	cachedUser = await fetchUser();
	return { user: cachedUser };
};

// ✅ CORRECT - Use locals or database
export const load: PageServerLoad = async ({ locals }) => {
	const user = await fetchUser();
	return { user };
};
```

### 5. Not Handling Convex Loading States

```svelte
<!-- ❌ WRONG -->
<script>
  const posts = useQuery(api.posts.list, {});
</script>
<ul>
  {#each $posts as post}
    <li>{post.title}</li>
  {/each}
</ul>

<!-- ✅ CORRECT -->
<script>
  const posts = useQuery(api.posts.list, {});
</script>
{#if $posts === undefined}
  Loading...
{:else}
  <ul>
    {#each $posts as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{/if}
```

### 6. Forgetting Convex Indexes

```typescript
// ❌ WRONG - Slow query without index
export const byAuthor = query({
	handler: async (ctx, { authorId }) => {
		return await ctx.db
			.query('posts')
			.filter((q) => q.eq(q.field('authorId'), authorId))
			.collect();
	}
});

// ✅ CORRECT - Use index
export const byAuthor = query({
	handler: async (ctx, { authorId }) => {
		return await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('authorId', authorId))
			.collect();
	}
});
```

---

## 🎓 Learning Resources

### Official Documentation

- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Convex Docs](https://docs.convex.dev)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Runed Docs](https://runed.dev/docs)
- [Neverthrow Docs](https://github.com/supermacro/neverthrow)
- [Bun Docs](https://bun.sh/docs)

### Quick References

- [Svelte 5 LLMs txt](https://svelte.dev/llms-small.txt)
- [SvelteKit Remote Functions](https://svelte.dev/docs/kit/remote-functions)
- [SvelteKit Performance](https://svelte.dev/docs/kit/performance)
- [SvelteKit Auth](https://svelte.dev/docs/kit/auth)
- [SvelteKit State Management](https://svelte.dev/docs/kit/state-management)

---

## 💡 Final Notes

This starter template represents a modern, type-safe, real-time full-stack architecture. Every technology was chosen for a specific reason:

- **SvelteKit**: Best-in-class DX with minimal boilerplate
- **Svelte 5**: Revolutionary reactivity with runes
- **Convex**: Real-time backend without the complexity
- **Better Auth**: Secure, flexible authentication
- **Runed**: Proven reactive patterns
- **Neverthrow**: Functional error handling
- **Bun**: Speed and simplicity

When building with this stack:

1. Embrace reactivity - don't fight it
2. Trust the type system - it's there to help
3. Start simple - add complexity only when needed
4. Use the right tool for each job
5. Keep server and client boundaries clear

Happy building! 🚀
