<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { goto } from '$app/navigation';
	
	let paginationOpts = $state({ numItems: 50, cursor: null as string | null });
	const query = useQuery(api.posts.listAll, () => ({ paginationOpts }));
	
	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	function loadMore() {
		if (query.data?.continueCursor) {
			paginationOpts = { numItems: 50, cursor: query.data.continueCursor };
		}
	}
</script>

<svelte:head>
	<title>Blog Admin</title>
</svelte:head>

<div class="admin-container">
	<header class="admin-header">
		<h1>Blog Admin</h1>
		<div class="actions">
			<a href="/blog" class="btn-secondary">View Blog</a>
			<a href="/admin/new" class="btn-primary">New Post</a>
		</div>
	</header>
	
	{#if query.isLoading}
		<p class="loading">Loading posts...</p>
	{:else if query.error}
		<p class="error">Failed to load posts: {query.error.toString()}</p>
	{:else if !query.data || query.data.page.length === 0}
		<div class="empty-state">
			<p>No posts yet. Create your first post!</p>
			<a href="/admin/new" class="btn-primary">Create Post</a>
		</div>
	{:else}
		<div class="posts-table">
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Status</th>
						<th>Created</th>
						<th>Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each query.data.page as post (post._id)}
						<tr>
							<td>
								<a href="/admin/edit/{post._id}" class="post-title">
									{post.title}
								</a>
							</td>
							<td>
								<span class="status" class:published={post.published} class:draft={!post.published}>
									{post.published ? 'Published' : 'Draft'}
								</span>
							</td>
							<td>{formatDate(post.createdAt)}</td>
							<td>{formatDate(post.updatedAt)}</td>
							<td>
								<div class="action-buttons">
									<a href="/admin/edit/{post._id}" class="btn-small">Edit</a>
									{#if post.published}
										<a href="/blog/{post.slug}" class="btn-small">View</a>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			
			{#if !query.data.isDone}
				<div class="load-more">
					<button onclick={loadMore} class="btn-secondary">Load More</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.admin-header {
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
	
	.actions {
		display: flex;
		gap: 1rem;
	}
	
	.btn-primary {
		background: #0066cc;
		color: white;
		padding: 0.5rem 1.25rem;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: background 0.2s;
	}
	
	.btn-primary:hover {
		background: #0052a3;
	}
	
	.btn-secondary {
		background: white;
		color: #333;
		padding: 0.5rem 1.25rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
	}
	
	.btn-secondary:hover {
		border-color: #999;
		background: #f5f5f5;
	}
	
	.loading,
	.error {
		text-align: center;
		padding: 3rem;
		color: #666;
	}
	
	.error {
		color: #c33;
	}
	
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.empty-state p {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}
	
	.posts-table {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		overflow: hidden;
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
	}
	
	thead {
		background: #f8f8f8;
	}
	
	th {
		text-align: left;
		padding: 1rem;
		font-weight: 600;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #555;
	}
	
	td {
		padding: 1rem;
		border-top: 1px solid #e0e0e0;
	}
	
	.post-title {
		color: #111;
		text-decoration: none;
		font-weight: 500;
	}
	
	.post-title:hover {
		color: #0066cc;
	}
	
	.status {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	
	.status.published {
		background: #e6f7e6;
		color: #2d7a2d;
	}
	
	.status.draft {
		background: #fff3cd;
		color: #856404;
	}
	
	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}
	
	.btn-small {
		padding: 0.25rem 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.85rem;
		color: #333;
		transition: all 0.2s;
	}
	
	.btn-small:hover {
		border-color: #999;
		background: #f5f5f5;
	}
	
	.load-more {
		padding: 1.5rem;
		text-align: center;
		border-top: 1px solid #e0e0e0;
	}
	
	.load-more button {
		cursor: pointer;
	}
</style>
