import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { authComponent, createAuth } from './auth';

const http = httpRouter();

// Test endpoint to verify HTTP routing works
http.route({
	path: '/test',
	method: 'GET',
	handler: httpAction(async () => {
		return new Response(JSON.stringify({ message: 'HTTP router is working!' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	})
});

console.log('[Convex HTTP] Registering auth routes...');
authComponent.registerRoutes(http, createAuth);
console.log('[Convex HTTP] Auth routes registered');

export default http;
