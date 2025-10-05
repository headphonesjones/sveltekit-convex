---
description: Condensed Tech Stack Reference
globs:
alwaysApply: true
---

# SvelteKit + Convex Starter - Quick Reference

**Philosophy**: Modern, type-safe, full-stack template for rapid development with real-time capabilities.

**Stack**: SvelteKit + Svelte 5 + Convex + Better Auth + Runed + Neverthrow + Bun

---

## 🔴 Critical Rules

1. **USE BUN, NOT NPM/YARN**: `bun add`, `bun install`, `bun run dev`
2. **USE SVELTE 5 RUNES**: `$state`, `$derived`, `$effect`, `$props` (NOT Svelte 4 syntax)
3. **NO SHARED STATE ON SERVER**: Causes data leakage between users
4. **REMOTE FUNCTIONS ENABLED**: Already configured in svelte.config.js

---

## 🔷 Svelte 5 Runes (Quick Reference)

### `$state` - Reactive State

```svelte
<script>
	let count = $state(0);
	let user = $state({ name: 'Alice', age: 30 });

	// Mutations work directly (deep reactivity)
	user.age += 1; // UI updates automatically
</script>
```

**Rules**: DON'T destructure state objects | DO mutate directly | Use `$state.snapshot()` for external APIs

### `$derived` - Computed Values

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	// Complex logic
	let status = $derived.by(() => {
		if (count === 0) return 'empty';
		return count < 10 ? 'low' : 'high';
	});
</script>
```

**Rules**: Keep PURE (no side effects) | Use `$derived.by()` for multi-line | Can reassign (optimistic UI)

### `$effect` - Side Effects

```svelte
<script>
	let count = $state(0);

	$effect(() => {
		console.log(`Count: ${count}`);
		document.title = `Count: ${count}`;

		return () => console.log('Cleanup'); // Optional cleanup
	});
</script>
```

**Rules**: Use for DOM, logging, analytics | NOT for state sync | Return cleanup when needed | `$effect.pre()` for pre-DOM ops

### `$props` - Component Props

```svelte
<script>
	let {
		title, // Required
		count = 0, // Default value
		onUpdate, // Callback
		...rest // Rest props
	} = $props();
</script>
```

**Rules**: DON'T mutate props | Use callbacks for parent communication | `$bindable()` for two-way (rare)

---

## 🔄 SvelteKit Patterns

### State Management Hierarchy

1. **Component State**: `let isOpen = $state(false)` - Most common
2. **Context**: `setContext('key', value)` / `getContext('key')` - Component tree
3. **URL State**: `page.url.searchParams` - Shareable state
4. **Server State**: Load functions - Server data

### Load Functions

```typescript
// +page.ts or +page.server.ts
export async function load({ fetch, params }) {
	const data = await fetch(`/api/posts/${params.id}`).then((r) => r.json());
	return { data };
}
```

```svelte
<script>
	let { data } = $props();
</script>
```

**Critical**: NEVER share state on server | Keep load functions PURE

### Remote Functions (4 Types)

```typescript
// query - Read data
export const getPosts = query(async () => {
	return await db.posts.findMany();
});

// form - Handle submissions
export const login = form(async (event, formData) => {
	const email = formData.get('email');
	return { success: true };
});

// command - Mutations
export const createPost = command(async (event, title: string) => {
	return await db.posts.create({ data: { title } });
});

// prerender - Build-time data
export const getPost = prerender(async (slug: string) => {
	return await db.posts.findUnique({ where: { slug } });
});
```

---

## 🎨 Runed Utilities (Most Used)

```svelte
<script>
	import {
		useSearchParams, // URL params reactivity
		PersistedState, // localStorage
		StateHistory, // Undo/redo
		Context, // Type-safe context
		activeElement, // Track focus
		ScrollState, // Scroll tracking
		useEventListener // Declarative events
	} from 'runed';

	// Examples
	const theme = new PersistedState('theme', 'light');
	const history = new StateHistory('');
	const searchParams = useSearchParams();

	useEventListener(window, 'resize', () => console.log('Resized'));
</script>
```

**When to use**: Common reactive patterns, URL/storage state, DOM utilities
**When NOT to use**: Simple `$state` suffices, poor architecture crutch

---

## ⚠️ Neverthrow (Error Handling)

```typescript
import { ok, err, Result } from 'neverthrow';

// Define function returning Result
function divide(a: number, b: number): Result<number, string> {
	if (b === 0) return err('Cannot divide by zero');
	return ok(a / b);
}

// Use with pattern matching
divide(10, 2).match({
	ok: (value) => console.log('Success:', value),
	err: (error) => console.error('Error:', error)
});

// Chain operations
divide(10, 2)
	.map((n) => n * 2)
	.mapErr((e) => `Error: ${e}`)
	.andThen((n) => (n > 20 ? ok(n) : err('Too small')));

// Async
const userResult = ResultAsync.fromPromise(
	fetch('/api/users/1').then((r) => r.json()),
	(error) => new Error('Fetch failed')
);
```

**When to use**: Predictable failures, validation, API calls, DB queries
**When NOT to use**: Unexpected errors (use try-catch), simple booleans, everywhere (adds complexity)

---

## 🗄️ Convex Database

### Setup

```bash
bun add convex convex-svelte
bunx convex init
```

### Schema

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
		createdAt: v.number()
	})
		.index('by_author', ['authorId'])
		.index('by_published', ['published', 'createdAt'])
});
```

### Queries & Mutations

```typescript
// convex/posts.ts
import { query, mutation } from './_generated/server';
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

export const create = mutation({
	args: { title: v.string(), content: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db.insert('posts', {
			...args,
			published: false,
			createdAt: Date.now()
		});
	}
});

// Use indexes for performance
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

### Using in Components

```svelte
<script>
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const posts = useQuery(api.posts.list, {});
	const createPost = useMutation(api.posts.create);

	let title = $state('');
	let content = $state('');

	async function handleSubmit() {
		await createPost({ title, content });
		title = '';
		content = '';
	}
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

**Best Practices**:

- Always add indexes (Convex warns you)
- Use `.paginate()` for large datasets
- All mutations are transactional
- Embrace real-time - queries auto-update
- Import from `_generated/` for types

---

## 🔐 Better Auth

### Setup

```bash
bun add better-auth
```

### Configuration

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { convexAdapter } from 'better-auth/adapters/convex';

export const auth = betterAuth({
	database: convexAdapter({
		deploymentUrl: process.env.CONVEX_URL!
	}),
	emailAndPassword: { enabled: true },
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7 // 7 days
	}
});
```

### Integration

```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.getSession(event.request);
	event.locals.session = session;
	event.locals.user = session?.user;
	return resolve(event);
};

// src/routes/auth/[...all]/+server.ts
export const GET = auth.handler;
export const POST = auth.handler;
```

### Client Usage

```typescript
// src/lib/auth.client.ts
import { createAuthClient } from 'better-auth/client';
export const authClient = createAuthClient({
	baseURL: 'http://localhost:5173'
});
```

```svelte
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
```

### Protected Routes

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?redirect=${url.pathname}`);
	}
	return { user: locals.user };
};
```

### With Convex

```typescript
// convex/posts.ts
export const myPosts = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		return await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('authorId', identity.subject))
			.collect();
	}
});
```

---

## 🔄 Complete Integration Example

**Scenario**: Todo list with auth, real-time updates, error handling, persisted UI state

### 1. Schema (Convex)

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

### 2. Backend (Convex)

```typescript
// convex/todos.ts
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
		if (!todo) throw new Error('Not found');
		await ctx.db.patch(args.id, { completed: !todo.completed });
	}
});
```

### 3. Frontend (SvelteKit + Svelte 5)

```svelte
<script>
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '../convex/_generated/api';
	import { PersistedState } from 'runed';
	import { err, ok } from 'neverthrow';

	// Real-time queries
	const todos = useQuery(api.todos.list, {});
	const createTodo = useMutation(api.todos.create);
	const toggleTodo = useMutation(api.todos.toggle);

	// Local state
	let newTodoText = $state('');
	let error = $state<string | null>(null);

	// Persisted UI preference
	const showCompleted = new PersistedState('show-completed', true);

	// Derived state
	const filteredTodos = $derived(
		$todos?.filter((t) => showCompleted.current || !t.completed) ?? []
	);

	const stats = $derived({
		total: $todos?.length ?? 0,
		completed: $todos?.filter((t) => t.completed).length ?? 0
	});

	// With error handling
	async function handleCreate() {
		if (!newTodoText.trim()) {
			error = 'Todo cannot be empty';
			return;
		}

		try {
			await createTodo({ text: newTodoText.trim() });
			newTodoText = '';
			error = null;
		} catch (e) {
			error = e.message;
		}
	}

	// Side effect
	$effect(() => {
		if ($todos) console.log(`Todos updated: ${$todos.length}`);
	});
</script>

<div>
	<h1>My Todos</h1>
	<p>Total: {stats.total} | Completed: {stats.completed}</p>

	<form onsubmit|preventDefault={handleCreate}>
		<input bind:value={newTodoText} placeholder="New todo" />
		<button type="submit">Add</button>
	</form>

	{#if error}<p class="error">{error}</p>{/if}

	<label>
		<input type="checkbox" bind:checked={showCompleted.current} />
		Show completed
	</label>

	{#if $todos === undefined}
		<p>Loading...</p>
	{:else}
		<ul>
			{#each filteredTodos as todo (todo._id)}
				<li>
					<input
						type="checkbox"
						checked={todo.completed}
						onchange={() => toggleTodo({ id: todo._id })}
					/>
					{todo.text}
				</li>
			{/each}
		</ul>
	{/if}
</div>
```

### 4. Protection (Better Auth)

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?redirect=${url.pathname}`);
	}
	return { user: locals.user };
};
```

**Key Patterns Shown**:

- ✅ Svelte 5 runes ($state, $derived, $effect)
- ✅ Runed (PersistedState)
- ✅ Convex (real-time queries/mutations)
- ✅ Better Auth (route protection)
- ✅ Error handling
- ✅ Type safety throughout

---

## 🚨 Common Pitfalls

### ❌ Destructuring Reactive State

```svelte
let user = $state({ name: 'Alice' });
let { name } = user; // BREAKS REACTIVITY!

// ✅ Use:
const name = $derived(user.name);
```

### ❌ Side Effects in $derived

```svelte
let doubled = $derived(() => {
  console.log(count); // NO! Side effect
  return count * 2;
});

// ✅ Use:
let doubled = $derived(count * 2);
$effect(() => console.log(count));
```

### ❌ Shared Server State

```typescript
let cachedUser: User; // LEAKS DATA BETWEEN USERS!

// ✅ Use locals or database, never global
```

### ❌ Missing Convex Loading State

```svelte
{#each $posts as post}
	// Crashes if undefined
	<li>{post.title}</li>
{/each}

// ✅ Always check:
{#if $posts === undefined}
	Loading...
{:else}
	{#each $posts as post}...{/each}
{/if}
```

### ❌ Forgetting Indexes

```typescript
.filter(q => q.eq(q.field('authorId'), authorId)) // SLOW!

// ✅ Use indexes:
.withIndex('by_author', q => q.eq('authorId', authorId))
```

### ❌ Using npm

```bash
npm install package-name  # WRONG!
bun add package-name      # CORRECT!
```

---

## 📋 Quick Checklist

### New Feature

- [ ] Define Convex schema with indexes
- [ ] Create queries/mutations
- [ ] Use `$state`/`$derived`/`$effect` properly
- [ ] Handle loading states (`$posts === undefined`)
- [ ] Add auth checks on server side
- [ ] Test real-time updates
- [ ] Use Bun commands only

### Code Review

- [ ] `$state` not `let` for reactive values
- [ ] `$derived` not `$:` for computed
- [ ] `$effect` not `$:` for side effects
- [ ] `$props()` not `export let`
- [ ] `onclick` not `on:click`
- [ ] No shared server state
- [ ] Pure load functions
- [ ] Server-side auth checks
- [ ] Proper error handling
- [ ] TypeScript types
- [ ] Convex indexes exist

---

## 🎯 Tech Stack Flow

```
User → SvelteKit Route
     → Better Auth (check session)
     → Convex Client (useQuery/useMutation)
     → Convex Functions (queries/mutations)
     → Convex DB (real-time)
     → WebSocket updates
     → Svelte 5 Runes (reactivity)
     → Runed (utilities)
     → Neverthrow (error handling)
     → UI Updates
```

---

## 💡 Core Principles

1. **Embrace Reactivity**: Don't fight Svelte's reactivity system
2. **Trust Types**: Full TypeScript from DB to UI
3. **Start Simple**: Add complexity only when needed
4. **Use Right Tools**: Each has a specific purpose
5. **Clear Boundaries**: Server vs client state separation

**When to use what**:

- **$state**: Component-local reactive data
- **$derived**: Computed values from state
- **$effect**: Side effects (DOM, logging, analytics)
- **Runed**: Common patterns (URL state, storage, DOM utils)
- **Neverthrow**: Predictable error handling
- **Convex**: All backend data and logic
- **Better Auth**: Authentication flows

---

## 📚 Quick Links

- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Convex Docs](https://docs.convex.dev)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Runed Docs](https://runed.dev/docs)
- [Neverthrow](https://github.com/supermacro/neverthrow)
- [Bun Docs](https://bun.sh/docs)

---

**Remember**: Use **Bun** (not npm), **Svelte 5 runes** (not Svelte 4 syntax), **server-side auth checks**, and **Convex indexes**. 🚀
