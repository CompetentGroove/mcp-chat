import { corsHeaders } from '../middleware/cors';
import { schemas } from './schemas';
import { chatPaths } from './paths/chat';
import { toolPaths } from './paths/tool';

// Handler for OpenAPI documentation endpoints
export async function handleApiDocs(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/docs/openapi.json' && request.method === 'GET') {
    // Generate the OpenAPI specification
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'y-gui API',
        description: 'API for y-gui chat application',
        version: '1.0.0',
      },
      servers: [
        {
          url: '/',
          description: 'Current server',
        },
      ],
      components: {
        schemas,
      },
      paths: {
        ...chatPaths,
        ...toolPaths,
      },
    };

    return new Response(JSON.stringify(openApiSpec), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
  });
}
