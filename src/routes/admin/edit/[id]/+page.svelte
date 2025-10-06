<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { goto } from '$app/navigation';
	import { err, ok, type Result } from 'neverthrow';
	import type { Id } from '$convex/_generated/dataModel';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	
	let { data } = $props();
	
	const postId = data.postId as Id<'posts'>;
	
	const query = useQuery(api.posts.getById, { id: postId });
	const convex = useConvexClient();
	
	// Form state
	let title = $state('');
	let slug = $state('');
	let excerpt = $state('');
	let content = $state('');
	let tags = $state('');
	let published = $state(false);
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	
	// Load post data when available
	$effect(() => {
		if (query.data) {
			title = query.data.title;
			slug = query.data.slug;
			excerpt = query.data.excerpt;
			content = query.data.content;
			tags = query.data.tags?.join(', ') || '';
			published = query.data.published;
		}
	});
	
	function slugify(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
	
	function generateSlug() {
		if (query.data && (!slug || slug === query.data.slug)) {
			slug = slugify(title);
		}
	}
	
	function validatePost(): Result<void, string> {
		if (!title.trim()) {
			return err('Title is required');
		}
		
		if (title.length > 200) {
			return err('Title is too long (max 200 characters)');
		}
		
		if (!slug.trim()) {
			return err('Slug is required');
		}
		
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return err('Slug can only contain lowercase letters, numbers, and hyphens');
		}
		
		if (!excerpt.trim()) {
			return err('Excerpt is required');
		}
		
		if (excerpt.length > 500) {
			return err('Excerpt is too long (max 500 characters)');
		}
		
		if (!content.trim()) {
			return err('Content is required');
		}
		
		return ok(undefined);
	}
	
	async function handleSubmit(shouldPublish: boolean) {
		error = null;
		isSubmitting = true;
		
		const validation = validatePost();
		if (validation.isErr()) {
			error = validation.error;
			isSubmitting = false;
			return;
		}
		
		try {
			const tagArray = tags
				.split(',')
				.map((t) => t.trim())
				.filter((t) => t.length > 0);
			
			await convex.mutation(api.posts.update, {
				id: postId,
				title: title.trim(),
				slug: slug.trim(),
				excerpt: excerpt.trim(),
				content: content.trim(),
				published: shouldPublish,
				tags: tagArray.length > 0 ? tagArray : undefined
			});
			
			goto('/admin');
		} catch (e: any) {
			error = e.message || 'Failed to update post';
			isSubmitting = false;
		}
	}
	
	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			return;
		}
		
		isDeleting = true;
		
		try {
			await convex.mutation(api.posts.remove, { id: postId });
			goto('/admin');
		} catch (e: any) {
			error = e.message || 'Failed to delete post';
			isDeleting = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Post - Blog Admin</title>
</svelte:head>

<div class="editor-container">
	{#if query.isLoading}
		<p class="loading">Loading post...</p>
	{:else if query.error}
		<div class="error-state">
			<p>Error: {query.error.toString()}</p>
			<a href="/admin" class="btn-primary">Back to Admin</a>
		</div>
	{:else if !query.data}
		<div class="error-state">
			<p>Post not found</p>
			<a href="/admin" class="btn-primary">Back to Admin</a>
		</div>
	{:else}
		<header class="editor-header">
			<h1>Edit Post</h1>
			<div class="actions">
				<a href="/admin" class="btn-secondary">Cancel</a>
			</div>
		</header>
		
		{#if error}
			<div class="error-banner">
				{error}
			</div>
		{/if}
		
		<form class="editor-form">
			<div class="form-group">
				<label for="title">Title *</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					onblur={generateSlug}
					placeholder="Enter post title"
					maxlength="200"
				/>
				<span class="hint">{title.length}/200</span>
			</div>
			
			<div class="form-group">
				<label for="slug">Slug *</label>
				<input
					id="slug"
					type="text"
					bind:value={slug}
					placeholder="url-friendly-slug"
					pattern="[a-z0-9-]+"
				/>
				<span class="hint">URL: /blog/{slug || 'your-slug'}</span>
			</div>
			
			<div class="form-group">
				<label for="excerpt">Excerpt *</label>
				<textarea
					id="excerpt"
					bind:value={excerpt}
					placeholder="Brief description of the post"
					rows="3"
					maxlength="500"
				></textarea>
				<span class="hint">{excerpt.length}/500</span>
			</div>
			
			<div class="form-group">
				<label for="tags">Tags</label>
				<input
					id="tags"
					type="text"
					bind:value={tags}
					placeholder="javascript, svelte, tutorial (comma-separated)"
				/>
			</div>
			
			<div class="form-group">
				<label for="content">Content *</label>
				<TiptapEditor 
					bind:content={content}
					placeholder="Write your post content here..."
					minHeight="400px"
				/>
				<span class="hint">Use the toolbar to format your content. HTML is generated automatically.</span>
			</div>
			
			<div class="form-actions">
				<button
					type="button"
					onclick={handleDelete}
					class="btn-danger"
					disabled={isSubmitting || isDeleting}
				>
					{isDeleting ? 'Deleting...' : 'Delete Post'}
				</button>
				<div class="right-actions">
					{#if published}
						<button
							type="button"
							onclick={() => handleSubmit(false)}
							class="btn-secondary"
							disabled={isSubmitting || isDeleting}
						>
							Unpublish
						</button>
						<button
							type="button"
							onclick={() => handleSubmit(true)}
							class="btn-primary"
							disabled={isSubmitting || isDeleting}
						>
							{isSubmitting ? 'Updating...' : 'Update'}
						</button>
					{:else}
						<button
							type="button"
							onclick={() => handleSubmit(false)}
							class="btn-secondary"
							disabled={isSubmitting || isDeleting}
						>
							{isSubmitting ? 'Saving...' : 'Save Draft'}
						</button>
						<button
							type="button"
							onclick={() => handleSubmit(true)}
							class="btn-primary"
							disabled={isSubmitting || isDeleting}
						>
							{isSubmitting ? 'Publishing...' : 'Publish'}
						</button>
					{/if}
				</div>
			</div>
		</form>
	{/if}
</div>

<style>
	.editor-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.loading {
		text-align: center;
		padding: 3rem;
		color: #666;
	}
	
	.error-state {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.error-state p {
		font-size: 1.25rem;
		color: #666;
		margin-bottom: 1.5rem;
	}
	
	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e0e0e0;
	}
	
	h1 {
		font-size: 2rem;
		font-weight: 700;
	}
	
	.error-banner {
		background: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
	}
	
	.editor-form {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 2rem;
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #333;
	}
	
	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}
	
	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: #0066cc;
	}
	
	textarea {
		resize: vertical;
		line-height: 1.6;
	}
	
	.hint {
		display: block;
		font-size: 0.85rem;
		color: #666;
		margin-top: 0.25rem;
	}
	
	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e0e0e0;
	}
	
	.right-actions {
		display: flex;
		gap: 1rem;
	}
	
	button {
		padding: 0.625rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		background: #0066cc;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #0052a3;
	}
	
	.btn-secondary,
	a.btn-secondary {
		background: white;
		color: #333;
		border: 1px solid #ccc;
		text-decoration: none;
		display: inline-block;
		padding: 0.5rem 1.25rem;
	}
	
	.btn-secondary:hover:not(:disabled),
	a.btn-secondary:hover {
		border-color: #999;
		background: #f5f5f5;
	}
	
	.btn-danger {
		background: #dc3545;
		color: white;
	}
	
	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}
</style>
