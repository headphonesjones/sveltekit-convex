<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';

	let { children } = $props();

	// Get auth state
	const auth = useAuth();
	const session = authClient.useSession();
	const isAuthenticated = $derived(auth.isAuthenticated);

	let currentPath = $state('');

	// Track current path
	$effect(() => {
		currentPath = $page.url.pathname;
	});

	// Redirect if not authenticated
	$effect(() => {
		if (!auth.isLoading && !isAuthenticated && currentPath) {
			goto(`/auth/sign-in?redirect=${currentPath}`);
		}
	});

	async function handleSignOut() {
		await authClient.signOut();
		goto('/auth/sign-in');
	}
</script>

{#if auth.isLoading}
	<div class="loading-container">
		<p>Loading...</p>
	</div>
{:else}
	<div class="admin-layout">
		<header>
			<nav>
				<a href="/admin">Dashboard</a>
				<a href="/admin/new">New Post</a>
				<a href="/blog">View Blog</a>
			</nav>
			{#if isAuthenticated && $session.data?.user}
				<div class="user-info">
					<span>Logged in as {$session.data.user.name || $session.data.user.email}</span>
					<button onclick={handleSignOut} class="sign-out-btn">Sign Out</button>
				</div>
			{/if}
		</header>

		{@render children()}
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		font-size: 1.125rem;
		color: #6b7280;
	}

	.admin-layout {
		min-height: 100vh;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		color: #374151;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	nav a:hover {
		color: #3b82f6;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info span {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.sign-out-btn {
		padding: 0.5rem 1rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.sign-out-btn:hover {
		background: #dc2626;
	}
</style>
