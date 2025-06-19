import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './worker-configuration';
import chatRouter from './api/chat-router';
import shareRouter from './api/share-router';
import toolRouter from './api/tool-router';
import { handleApiDocs } from './openapi';

// Create the main Hono app with the Variables type
const app = new Hono<{ 
  Bindings: Env; 
  Variables: {
    userPrefix: string;
    userInfo: any;
  }
}>();

// Set CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}));

// Public endpoint for OpenAPI spec
app.get('/api/docs/openapi.json', (c) => {
  // Convert Hono request to standard Request for the existing handler
  const request = new Request(c.req.url, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body
  });
  return handleApiDocs(request);
});

// Set default user context for all API routes
app.use('/api/*', async (c, next) => {
  c.set('userPrefix', 'default');
  c.set('userInfo', null);
  await next();
});

// Mount authenticated API routers
app.route('/api/share', shareRouter);
app.route('/api/chats', chatRouter);
app.route('/api/chat', chatRouter);
app.route('/api/tool', toolRouter);

// For non-API routes, serve static assets
app.all('*', async (c) => {
  // Convert Hono request to standard Request for ASSETS.fetch
  const request = new Request(c.req.url, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body
  });
  return c.env.ASSETS.fetch(request);
});

// Export the fetch handler
export default {
  // Fetch handler (HTTP requests)
  fetch: app.fetch
};
