# Environment Setup Required

## Create `.env` file in project root

Create a `.env` file with the following contents:

```bash
PUBLIC_CONVEX_URL=https://marvelous-corgi-142.convex.cloud
CONVEX_URL=https://marvelous-corgi-142.convex.cloud
CONVEX_DEPLOYMENT=dev:marvelous-corgi-142
```

## Set Convex environment variables

Run these commands:

```bash
bunx convex env set SITE_URL https://marvelous-corgi-142.convex.cloud
bunx convex env set BETTER_AUTH_SECRET /CM8veWZka9ABmjdRbTbH6o/BCNeAVr2GriHSDn4ECA=
```

## Restart both servers

```bash
# Terminal 1
bunx convex dev

# Terminal 2
bun run dev
```

## What Changed

I reverted my previous changes because the `convexAdapter` requires a Convex context that's only available inside Convex functions.

The **correct architecture** is:

- Auth routes run ON Convex (via the Better Auth component)
- Client points directly to Convex URL
- No SvelteKit proxy needed

This is what you originally had - the issue was likely just missing environment variables or deployment state.
