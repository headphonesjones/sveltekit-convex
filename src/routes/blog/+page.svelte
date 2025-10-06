<script lang="ts">
	let { data } = $props();
	
	// Format dates nicely
	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog</title>
	<meta name="description" content="Read our latest blog posts" />
</svelte:head>

<div class="blog-container">
	<h1>Blog</h1>
	
	{#if data.posts.length === 0}
		<p class="empty-state">No posts published yet. Check back soon!</p>
	{:else}
		<div class="posts-grid">
			{#each data.posts as post (post._id)}
				<article class="post-card">
					<a href="/blog/{post.slug}">
						<h2>{post.title}</h2>
						<p class="excerpt">{post.excerpt}</p>
						<div class="meta">
							<time datetime={new Date(post.publishedAt || post.createdAt).toISOString()}>
								{formatDate(post.publishedAt || post.createdAt)}
							</time>
							{#if post.tags && post.tags.length > 0}
								<div class="tags">
									{#each post.tags as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
					</a>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	.blog-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	h1 {
		font-size: 2.5rem;
		margin-bottom: 2rem;
		font-weight: 700;
	}
	
	.empty-state {
		color: #666;
		font-style: italic;
		text-align: center;
		padding: 3rem;
	}
	
	.posts-grid {
		display: grid;
		gap: 2rem;
	}
	
	.post-card {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
		transition: all 0.2s ease;
	}
	
	.post-card:hover {
		border-color: #666;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}
	
	.post-card a {
		text-decoration: none;
		color: inherit;
	}
	
	.post-card h2 {
		font-size: 1.75rem;
		margin-bottom: 0.75rem;
		font-weight: 600;
		color: #111;
	}
	
	.excerpt {
		color: #555;
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	
	.meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.9rem;
		color: #777;
	}
	
	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	
	.tag {
		background: #f0f0f0;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
	}
</style>
