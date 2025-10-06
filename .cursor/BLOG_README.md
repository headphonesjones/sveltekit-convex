# Blog Feature Documentation

A modern, elegant blog implementation using SvelteKit 5 + Convex + Neverthrow + Runed.

## 🎯 Features

- **Public Blog**: Clean, SEO-friendly blog listing and post pages
- **Admin Dashboard**: Create, edit, and manage posts
- **Draft System**: Auto-save drafts with Runed's `PersistedState`
- **Real-time Updates**: Convex provides instant synchronization
- **Type-Safe**: Full TypeScript with Convex-generated types
- **Error Handling**: Functional error handling with Neverthrow
- **Slug-based URLs**: SEO-friendly URLs (`/blog/my-post-title`)
- **Tag Support**: Organize posts with tags
- **Prerendering**: Static generation for optimal performance

## 📁 Structure

```
src/routes/blog/
├── +page.ts              # Load all published posts
├── +page.svelte          # Blog listing page
├── [slug]/
│   ├── +page.ts          # Load individual post by slug
│   └── +page.svelte      # Individual post page
└── admin/
    ├── +page.svelte      # Admin dashboard (all posts)
    ├── new/
    │   └── +page.svelte  # Create new post
    └── edit/[id]/
        └── +page.svelte  # Edit existing post

convex/
├── schema.ts             # Database schema with indexes
└── posts.ts              # Queries and mutations
```

## 🗄️ Database Schema

```typescript
posts: {
  title: string           // Post title
  slug: string           // URL-friendly slug
  content: string        // HTML content
  excerpt: string        // Brief description
  published: boolean     // Published status
  publishedAt?: number   // Publication timestamp
  createdAt: number      // Creation timestamp
  updatedAt: number      // Last update timestamp
  authorId?: string      // Author ID (for future auth)
  tags?: string[]        // Post tags
}
```

### Indexes

- `by_slug`: Fast lookup by slug
- `by_published`: Efficient querying of published posts sorted by date
- `by_created`: Admin dashboard sorting

## 🚀 Usage

### Deploy Convex Schema

```bash
# Initialize Convex (if not already done)
bunx convex init

# Push schema to Convex
bunx convex deploy
```

### Access the Blog

- **Public Blog**: `http://localhost:5173/blog`
- **Admin Dashboard**: `http://localhost:5173/blog/admin`

### Create a Post

1. Navigate to `/blog/admin`
2. Click "New Post"
3. Fill in the details:
   - **Title**: Post title (auto-generates slug)
   - **Slug**: URL-friendly identifier
   - **Excerpt**: Brief description for listing page
   - **Tags**: Comma-separated tags
   - **Content**: HTML content (Markdown support requires additional setup)
4. Click "Save as Draft" or "Publish"

### Edit a Post

1. Go to `/blog/admin`
2. Click "Edit" on any post
3. Make changes
4. Click "Update" or "Publish"/"Unpublish"

### Delete a Post

1. Edit the post
2. Click "Delete Post"
3. Confirm deletion

## 🎨 Key Patterns Used

### Svelte 5 Runes

```svelte
// Reactive state
let title = $state('');

// Derived computed values
const filteredPosts = $derived(
  $posts?.filter(p => p.published) ?? []
);

// Side effects
$effect(() => {
  console.log(`Posts loaded: ${$posts?.length}`);
});
```

### Runed - PersistedState

Auto-save drafts to localStorage:

```svelte
const draftState = new PersistedState('blog-new-draft', {
  title: '',
  content: ''
});

// Auto-save on changes
$effect(() => {
  draftState.current = { title, content };
});
```

### Neverthrow - Result Types

Type-safe validation:

```typescript
function validatePost(): Result<void, string> {
	if (!title.trim()) {
		return err('Title is required');
	}
	return ok(undefined);
}

const validation = validatePost();
if (validation.isErr()) {
	error = validation.error;
	return;
}
```

### Convex - Real-time Queries

```svelte
// Automatically updates when data changes
const posts = useQuery(api.posts.listPublished, { limit: 20 });

{#if $posts === undefined}
  <p>Loading...</p>
{:else}
  {#each $posts as post}
    <article>{post.title}</article>
  {/each}
{/if}
```

### SvelteKit - Optimal Loading

```typescript
// +page.ts - Loads data server-side for SEO
export const load: PageLoad = async ({ parent }) => {
	const { convex } = await parent();
	const posts = await convex.query(api.posts.listPublished, {});
	return { posts };
};

// Enable static generation
export const prerender = true;
```

## 🔐 Adding Authentication

The schema and queries are already set up for authentication. To enable:

1. **Add Better Auth** (see main README)

2. **Update Convex queries** (uncomment auth checks):

```typescript
// convex/posts.ts
export const create = mutation({
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// ... rest of code
	}
});
```

3. **Protect admin routes**:

```typescript
// src/routes/blog/admin/+layout.server.ts
export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?redirect=${url.pathname}`);
	}
	return { user: locals.user };
};
```

## 🎨 Styling

Currently using vanilla CSS with modern design patterns:

- Responsive grid layout
- Hover effects and transitions
- Typography hierarchy
- Color scheme with CSS variables

To switch to Tailwind (already installed):

1. Remove `<style>` blocks
2. Add Tailwind classes to elements
3. Configure in `tailwind.config.js`

## 📝 Content Format

Currently supports **HTML** in the content field. To add Markdown support:

```bash
bun add marked
# or
bun add markdown-it
```

Then process markdown in the component:

```svelte
<script>
	import { marked } from 'marked';

	const htmlContent = $derived(marked(data.post.content));
</script>

<div class="post-content">
	{@html htmlContent}
</div>
```

## 🚀 Performance Features

- **Prerendering**: Static generation at build time
- **Convex Indexes**: Fast database queries
- **Load Functions**: Server-side data loading for SEO
- **Real-time Updates**: WebSocket subscriptions for live data
- **Code Splitting**: SvelteKit automatically splits by route

## 🔍 SEO

Each page includes proper meta tags:

```svelte
<svelte:head>
	<title>{post.title}</title>
	<meta name="description" content={post.excerpt} />
</svelte:head>
```

Add more meta tags as needed (Open Graph, Twitter Cards, etc.)

## 🐛 Error Handling

- **Client-side validation** with Neverthrow
- **404 errors** for missing posts
- **Duplicate slug detection** in mutations
- **User-friendly error messages**
- **Loading states** for all async operations

## 🎯 Next Steps

- [ ] Add authentication (Better Auth)
- [ ] Implement Markdown support
- [ ] Add image uploads (Convex file storage)
- [ ] Create rich text editor (TipTap, ProseMirror)
- [ ] Add comments system
- [ ] Implement search functionality
- [ ] Add pagination for post listings
- [ ] Create RSS feed
- [ ] Add sitemap generation
- [ ] Implement post categories
- [ ] Add related posts feature
- [ ] Create post scheduling

## 💡 Tips

1. **Slug Generation**: Automatically generated from title, but can be customized
2. **Draft Auto-save**: Drafts are saved to localStorage automatically
3. **Tags**: Use comma-separated values (e.g., "javascript, svelte, tutorial")
4. **Publishing**: Use "Save as Draft" to save without publishing
5. **Real-time**: Changes in admin are instantly reflected on published site (when using Convex subscriptions)

## 🏗️ Architecture Highlights

This implementation follows the **SvelteKit way**:

- **Progressive Enhancement**: Works without JavaScript (for published posts)
- **Server-Side Rendering**: SEO-friendly from the start
- **Type Safety**: End-to-end TypeScript with Convex
- **Modern Patterns**: Svelte 5 runes throughout
- **Reactive by Default**: Convex provides real-time updates
- **Functional Error Handling**: Neverthrow for type-safe errors
- **Elegant State Management**: Runed for localStorage persistence

---

Built with ❤️ using SvelteKit 5, Convex, Neverthrow, and Runed.
