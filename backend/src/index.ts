import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './worker-configuration';
import chatRouter from './api/chat-router';
import shareRouter from './api/share-router';
import toolRouter from './api/tool-router';
import { integrationRouter } from './api/integration';
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

// Public endpoints don't require authentication
app.get('/api/docs/*', (c) => {
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
app.route('/api/integrations', integrationRouter);
app.route('/api/integration', integrationRouter);

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

// Import the token refresh utility and storage utility
import { checkAndRefreshTokens } from './utils/token-refresh';

// Export both the fetch handler and scheduled handler
export default {
  // Fetch handler (HTTP requests)
  fetch: app.fetch,

  // Scheduled task handler for token refresh
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Running scheduled token refresh task at:', new Date().toISOString());

    try {
      // First, check the default user space (no prefix)
      await checkAndRefreshTokens(env, '');

      // Only refresh tokens in the default user space
      await checkAndRefreshTokens(env, 'default');

      console.log('Token refresh task completed successfully');
    } catch (error) {
      console.error('Error in scheduled token refresh task:', error);
    }
  }
};
