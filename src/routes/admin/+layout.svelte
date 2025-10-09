<script lang="ts">
	import { signOut } from '$lib/auth-client';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { children } = $props();

	const convex = useConvexClient();

	// Get session ID from localStorage
	const sessionId = $state(
		browser ? localStorage.getItem('convex-auth-session-id') : null
	);

	// Check authentication status using the session ID
	const isAuthQuery = useQuery(api.users.isAuthenticated, { sessionId });

	// Track current path for redirects
	const currentPath = $derived($page.url.pathname);

	// Debug logging
	$effect(() => {
		console.log('[Admin Layout] Auth query state:', {
			data: isAuthQuery.data,
			isLoading: isAuthQuery.isLoading,
			error: isAuthQuery.error
		});
	});

	// Redirect if not authenticated
	$effect(() => {
		if (isAuthQuery.data === false) {
			console.log('[Admin Layout] Not authenticated, redirecting to sign-in');
			goto(`/auth/sign-in?redirect=${currentPath}`);
		} else if (isAuthQuery.data === true) {
			console.log('[Admin Layout] User is authenticated');
		}
	});

	async function handleSignOut() {
		await signOut(convex);
		goto('/auth/sign-in');
	}
</script>

{#if isAuthQuery.data === undefined}
	<div class="loading-container">
		<p>Loading...</p>
	</div>
{:else if isAuthQuery.data === false}
	<div class="loading-container">
		<p>Redirecting to login...</p>
	</div>
{:else}
	<div class="admin-layout">
		<header>
			<nav>
				<a href="/admin">Dashboard</a>
				<a href="/admin/new">New Post</a>
				<a href="/blog">View Blog</a>
			</nav>
			<div class="user-info">
				<button onclick={handleSignOut} class="sign-out-btn">Sign Out</button>
			</div>
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
