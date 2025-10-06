<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	// Get redirect URL from query params
	const redirectUrl = $derived($page.url.searchParams.get('redirect') || '/admin');

	async function handleSignUp(e: Event) {
		e.preventDefault();
		error = '';

		// Validate passwords match
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		// Validate password strength
		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		loading = true;

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name
			});

			if (result.error) {
				error = result.error.message || 'Sign up failed';
			} else {
				// Wait for auth state to update before redirecting
				// Give it a bit more time to ensure session is fully established
				await new Promise((resolve) => setTimeout(resolve, 300));
				// Redirect after successful sign up
				goto(redirectUrl);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Create Account</h1>

		<form onsubmit={handleSignUp}>
			<div class="form-group">
				<label for="name">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Your name"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					minlength="8"
					disabled={loading}
				/>
				<small>Must be at least 8 characters</small>
			</div>

			<div class="form-group">
				<label for="confirm-password">Confirm Password</label>
				<input
					id="confirm-password"
					type="password"
					bind:value={confirmPassword}
					placeholder="••••••••"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error">
					{error}
				</div>
			{/if}

			<button type="submit" disabled={loading}>
				{loading ? 'Creating account...' : 'Sign Up'}
			</button>
		</form>

		<p class="auth-link">
			Already have an account? <a href="/auth/sign-in?redirect={encodeURIComponent(redirectUrl)}">
				Sign in
			</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
	}

	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.875rem;
		font-weight: 700;
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}

	small {
		font-size: 0.75rem;
		color: #6b7280;
	}

	button {
		padding: 0.75rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #2563eb;
	}

	button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.error {
		padding: 0.75rem;
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.auth-link {
		margin-top: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.auth-link a {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-link a:hover {
		text-decoration: underline;
	}
</style>
