<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { authClient } from '$lib/auth-client';
	import '../app.css';

	let { children } = $props();

	// Set up Convex with Better Auth (includes setupConvex)
	createSvelteAuthClient({ authClient });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
