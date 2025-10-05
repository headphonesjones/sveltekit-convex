# Tech Stack Overview

This SvelteKit starter template uses a modern, type-safe, full-stack architecture optimized for rapid development and real-time capabilities.

## Core Technologies

### 🎨 Frontend

- **SvelteKit 2.x** - Meta-framework for Svelte with SSR, routing, and API routes
- **Svelte 5** - Component framework with revolutionary runes-based reactivity system
- **Runed** - Utility library for Svelte 5 (reactive patterns, state management, DOM utilities)

### 🗄️ Backend

- **Convex** - Real-time database with serverless functions and type-safe APIs
- **Better Auth** - Flexible authentication with session/token support (optional, project-dependent)

### 🛠️ Development

- **Bun** - Fast JavaScript runtime and package manager (NOT npm!)
- **TypeScript** - Full type safety across the entire stack
- **Neverthrow** - Functional error handling with Result types

## Key Features

✅ **End-to-end Type Safety** - TypeScript from database to UI
✅ **Real-time Data** - Automatic reactive updates via Convex WebSockets
✅ **Modern Reactivity** - Svelte 5 runes ($state, $derived, $effect, $props)
✅ **Remote Functions** - Type-safe client-server communication without boilerplate
✅ **Functional Error Handling** - Neverthrow Result types for predictable errors
✅ **Authentication Ready** - Better Auth integration with Convex
✅ **Performance Optimized** - SvelteKit's built-in optimizations
✅ **Developer Experience** - Minimal boilerplate, maximum productivity

## Quick Command Reference

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Initialize Convex (first time)
bunx convex init

# Add packages
bun add package-name
bun add -d dev-package-name
```

## 📖 Cursor Rules Documentation

The project uses **Cursor's `.mdc` format** for optimal AI consumption and automatic context inclusion.

### 🎯 Primary Rules (Always Applied)

**[001_quick_reference.mdc](./.cursor/rules/001_quick_reference.mdc)** - Daily development reference

Automatically included in AI context:

- ✅ Critical rules (Bun, Svelte 5 runes, no server state)
- ✅ Core syntax for all technologies
- ✅ Essential patterns and best practices
- ✅ Common pitfalls and quick checklists
- **Priority**: 1 | **Always Apply**: Yes

### 📦 Optional Rules (Include as Needed)

**[002_integration_example.mdc](./.cursor/rules/002_integration_example.mdc)** - Complete integration example

Full-stack todo app showing all technologies working together:

- Convex schema, queries, mutations
- Svelte 5 component with all runes in action
- Better Auth route protection
- Runed utilities (PersistedState)
- **Priority**: 2 | **Include when**: Building features, understanding integration

**[003_detailed_reference.mdc](./.cursor/rules/003_detailed_reference.mdc)** - Advanced patterns

Deep dives and edge cases:

- Advanced Svelte 5 runes (`$state.raw`, `$effect.pre`, `$effect.root`)
- Convex pagination, actions, cron jobs, file storage
- Better Auth 2FA and session management
- Neverthrow advanced patterns
- **Priority**: 3 | **Include when**: Complex scenarios, edge cases

### 📝 How Cursor Uses These

1. **001_quick_reference.mdc** is automatically included (alwaysApply: true)
2. Other files can be included by referencing them with `@002_integration_example.mdc`
3. Files match specific globs (e.g., `*.svelte`, `**/convex/**/*`)
4. Priority determines order when multiple rules apply

## Important Notes

⚠️ **Always use Bun, NOT npm or yarn**
⚠️ **Use Svelte 5 runes syntax (not Svelte 4 reactive statements)**
⚠️ **Remote functions are enabled by default**
⚠️ **Some projects may not use authentication - check before implementing**

---

_This tech stack is designed as a flexible starter template. Not all features (like authentication) may be present in every project built from this template._
