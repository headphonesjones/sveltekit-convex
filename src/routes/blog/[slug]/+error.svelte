<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Post Not Found</title>
</svelte:head>

<div class="error-container">
	<h1>Post Not Found</h1>
	<p>{$page.error?.message || 'The post you\'re looking for doesn\'t exist.'}</p>
	<a href="/blog" class="back-link">← Back to Blog</a>
</div>

<style>
	.error-container {
		max-width: 750px;
		margin: 0 auto;
		padding: 4rem 2rem;
		text-align: center;
	}
	
	.error-container h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}
	
	.error-container p {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}
	
	.back-link {
		display: inline-block;
		color: #0066cc;
		text-decoration: none;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border: 2px solid #0066cc;
		border-radius: 6px;
		transition: all 0.2s;
	}
	
	.back-link:hover {
		background: #0066cc;
		color: white;
	}
</style>
