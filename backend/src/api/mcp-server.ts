import { McpServerConfig } from '../../../shared/types';
import { corsHeaders } from '../middleware/cors';
import { McpServerMemoryRepository } from '../repository/memory/mcp-server-memory-repository';
import { Env } from 'worker-configuration';

export async function handleMcpServerRequest(request: Request, env: Env, userPrefix?: string): Promise<Response> {
  const mcpRepo = new McpServerMemoryRepository(env, userPrefix);
  const url = new URL(request.url);
  const path = url.pathname;
  const pathParts = path.split('/');
  const serverName = pathParts.length > 3 ? pathParts[3] : null;

  try {
    // Add a new MCP server
    if (path === '/api/mcp-server' && request.method === 'POST') {
      const mcpServerConfig: McpServerConfig = await request.json();
      
      // Validate required fields
      if (!mcpServerConfig.name) {
        return new Response(JSON.stringify({ error: 'Missing required field: name' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Validate that url is provided
      if (!mcpServerConfig.url) {
        return new Response(JSON.stringify({ error: 'Url must be provided' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Check if server with same name already exists
      const existingServers = await mcpRepo.getMcpServers();
      if (existingServers.some(server => server.name === mcpServerConfig.name)) {
        return new Response(JSON.stringify({ error: 'MCP server with this name already exists' }), {
          status: 409,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Add the MCP server
      await mcpRepo.addMcpserver(mcpServerConfig);
      
      return new Response(JSON.stringify({ success: true, server: mcpServerConfig }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Update an existing MCP server
    if (serverName && path === `/api/mcp-server/${serverName}` && request.method === 'PUT') {
      const mcpServerConfig: McpServerConfig = await request.json();
      
      // Validate required fields
      if (!mcpServerConfig.name) {
        return new Response(JSON.stringify({ error: 'Missing required field: name' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Validate that url is provided
      if (!mcpServerConfig.url) {
        return new Response(JSON.stringify({ error: 'Url must be provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Check if server exists
      const existingServers = await mcpRepo.getMcpServers();
      if (!existingServers.some(server => server.name === serverName)) {
        return new Response(JSON.stringify({ error: 'MCP server not found' }), {
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Update the MCP server
      await mcpRepo.updateMcpServer(serverName, mcpServerConfig);
      
      return new Response(JSON.stringify({ success: true, server: mcpServerConfig }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Delete a MCP server
    if (serverName && path === `/api/mcp-server/${serverName}` && request.method === 'DELETE') {
      // Check if server exists
      const existingServers = await mcpRepo.getMcpServers();
      if (!existingServers.some(server => server.name === serverName)) {
        return new Response(JSON.stringify({ error: 'MCP server not found' }), {
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Delete the MCP server
      await mcpRepo.deleteMcpServer(serverName);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error handling MCP server request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
