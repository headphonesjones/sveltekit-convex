<script lang="ts">
	let { data } = $props();
	
	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.excerpt} />
</svelte:head>

<article class="post">
	<header class="post-header">
		<a href="/blog" class="back-link">← Back to Blog</a>
		<h1>{data.post.title}</h1>
		<div class="post-meta">
			<time datetime={new Date(data.post.publishedAt || data.post.createdAt).toISOString()}>
				{formatDate(data.post.publishedAt || data.post.createdAt)}
			</time>
			{#if data.post.tags && data.post.tags.length > 0}
				<div class="tags">
					{#each data.post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</header>
	
	<div class="post-content">
		{@html data.post.content}
	</div>
</article>

<style>
	.post {
		max-width: 750px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.post-header {
		margin-bottom: 3rem;
	}
	
	.back-link {
		display: inline-block;
		color: #666;
		text-decoration: none;
		margin-bottom: 1rem;
		font-size: 0.95rem;
		transition: color 0.2s;
	}
	
	.back-link:hover {
		color: #111;
	}
	
	h1 {
		font-size: 3rem;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 1rem;
		color: #111;
	}
	
	.post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.95rem;
		color: #666;
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
	
	.post-content {
		font-size: 1.125rem;
		line-height: 1.8;
		color: #333;
	}
	
	.post-content :global(h2) {
		font-size: 2rem;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
	}
	
	.post-content :global(h3) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}
	
	.post-content :global(p) {
		margin-bottom: 1.5rem;
	}
	
	.post-content :global(ul),
	.post-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}
	
	.post-content :global(li) {
		margin-bottom: 0.5rem;
	}
	
	.post-content :global(code) {
		background: #f5f5f5;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.9em;
	}
	
	.post-content :global(pre) {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}
	
	.post-content :global(pre code) {
		background: none;
		padding: 0;
	}
	
	.post-content :global(blockquote) {
		border-left: 4px solid #e0e0e0;
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: #555;
	}
	
	.post-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 2rem 0;
	}
	
	.post-content :global(a) {
		color: #0066cc;
		text-decoration: underline;
	}
	
	.post-content :global(a:hover) {
		color: #0052a3;
	}
</style>
