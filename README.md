# 🚀 SvelteKit + Convex Starter

A modern, type-safe, full-stack starter template for building real-time web applications with incredible developer experience.

## ✨ Features

- ⚡️ **[SvelteKit](https://svelte.dev/docs/kit)** - Modern full-stack framework with SSR, routing, and API routes
- 🎨 **[Svelte 5](https://svelte.dev)** - Revolutionary reactivity with runes (`$state`, `$derived`, `$effect`)
- 🗄️ **[Convex](https://convex.dev)** - Real-time database with automatic sync and type-safe queries
- 🔐 **[Convex Auth](https://labs.convex.dev/auth)** - Built-in authentication with password, OAuth, magic links, and OTPs
- 🛠️ **[Runed](https://runed.dev)** - Powerful Svelte 5 utility library
- ⚠️ **[Neverthrow](https://github.com/supermacro/neverthrow)** - Functional error handling with Result types
- 📦 **[Bun](https://bun.sh)** - Fast JavaScript runtime and package manager
- 🔒 **End-to-end TypeScript** - Full type safety from database to UI

## 🎯 Why This Stack?

- **Real-time by Default**: Convex automatically syncs data across clients via WebSockets
- **Type-Safe Everywhere**: Database schemas, API calls, and UI components are fully typed
- **Developer Experience**: Minimal boilerplate, maximum productivity with Svelte 5 runes
- **Modern Patterns**: Functional error handling, reactive utilities, and composable components
- **Fast**: Bun for lightning-fast installs and builds

## 🚀 Quick Start

### Prerequisites

Install [Bun](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
```

### Create a New Project

```bash
# Clone this template
git clone https://github.com/yourusername/svelte-convex-starter my-app
cd my-app

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your app! 🎉

## 📦 Setup Convex (Optional)

If you want to use the real-time database:

```bash
# Install Convex
bun add convex convex-svelte

# Initialize Convex (creates convex/ directory)
bunx convex dev --once --configure=new

# Start Convex dev server (in a separate terminal)
bunx convex dev
```

## 🔐 Setup Authentication

Authentication is already configured with Convex Auth:

```bash
# Already installed with convex-svelte
# Configuration files:
# - src/convex/auth.ts (auth setup)
# - src/convex/http.ts (auth routes)
# - src/lib/auth-client.ts (client helpers)

# Key features:
# ✅ Email + password authentication
# ✅ Session-based auth (works with SvelteKit)
# ✅ Protected routes
# ✅ Sign in/sign up forms included
```

See `src/routes/auth/` for the authentication UI.

## 📁 Project Structure

```
├── src/
│   ├── routes/          # SvelteKit routes (pages & API endpoints)
│   │   ├── auth/        # Authentication pages (sign-in, sign-up)
│   │   └── admin/       # Protected admin pages
│   ├── lib/             # Shared components and utilities
│   │   └── auth-client.ts  # Auth helper functions
│   └── app.html         # HTML template
├── convex/              # Convex backend (schemas, queries, mutations)
│   ├── auth.ts          # Convex Auth configuration
│   ├── http.ts          # HTTP routes (auth endpoints)
│   ├── users.ts         # User queries (authentication checks)
│   └── schema.ts        # Database schema (includes authTables)
├── static/              # Static assets
├── .cursor/
│   └── rules/           # Comprehensive documentation for AI assistants
│       ├── 001_quick_reference.mdc
│       ├── 002_integration_example.mdc
│       └── 003_detailed_reference.mdc
└── svelte.config.js     # SvelteKit configuration
```

## 🛠️ Available Commands

```bash
# Development
bun run dev              # Start dev server
bun run dev -- --open    # Start dev server and open browser

# Building
bun run build            # Build for production
bun run preview          # Preview production build

# Code Quality
bun run check            # Type-check your code
bun run format           # Format code with Prettier
bun run lint             # Lint code

# Convex (if using)
bunx convex dev          # Start Convex dev server
bunx convex deploy       # Deploy Convex to production
```

## 📚 Documentation

This starter comes with comprehensive documentation optimized for AI assistants (Cursor, GitHub Copilot, etc.):

- **[Quick Reference](.cursor/rules/001_quick_reference.mdc)** - Essential patterns and syntax (auto-loaded)
- **[Integration Example](.cursor/rules/002_integration_example.mdc)** - Complete full-stack todo app
- **[Detailed Reference](.cursor/rules/003_detailed_reference.mdc)** - Advanced patterns and edge cases
- **[Tech Stack Overview](.cursor/tech-stack-basics.md)** - High-level overview

### Key Concepts

#### Svelte 5 Runes

```svelte
<script>
	// Reactive state
	let count = $state(0);

	// Computed values
	let doubled = $derived(count * 2);

	// Side effects
	$effect(() => {
		console.log('Count:', count);
	});
</script>
```

#### Convex Real-time Queries

```svelte
<script>
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const posts = useQuery(api.posts.list, {});
	const createPost = useMutation(api.posts.create);
</script>

{#if $posts === undefined}
	<p>Loading...</p>
{:else}
	<ul>
		{#each $posts as post}
			<li>{post.title}</li>
		{/each}
	</ul>
{/if}
```

#### Authentication with Convex Auth

```svelte
<script>
	import { signIn, signUp, signOut } from '$lib/auth-client';
	import { useConvexClient } from 'convex-svelte';

	const convex = useConvexClient();

	async function handleSignIn() {
		const result = await signIn(convex, email, password);
		if (result.success) {
			// User is signed in!
		}
	}
</script>
```

## 🎓 Learn More

- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Runed Documentation](https://runed.dev/docs)
- [Bun Documentation](https://bun.sh/docs)

## 🚨 Important Notes

- **Always use Bun**, not npm or yarn
- **Use Svelte 5 runes** (`$state`, `$derived`, `$effect`), not Svelte 4 syntax
- **Never share state on the server** - causes data leakage between users
- **Remote functions are enabled** by default in `svelte.config.js`

## 🤝 Contributing

This is a personal starter template, but feel free to fork it and adapt it to your needs!

## 📝 License

MIT

---

**Built with ❤️ using SvelteKit, Convex, and Bun**
