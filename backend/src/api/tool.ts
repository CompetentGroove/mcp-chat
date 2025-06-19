import { corsHeaders } from '../middleware/cors';
import { McpManager } from '../mcp/mcp-manager';
import { BotMemoryRepository } from '../repository/memory/bot-memory-repository';
import { McpServerMemoryRepository } from 'src/repository/memory/mcp-server-memory-repository';
import { Message } from '../../../shared/types';
import { createMessage } from 'src/utils/message';
import { Env } from 'worker-configuration';
import type { ExecutionContext } from 'hono/dist/types/context';

/**
 * Handle tool execution confirmation
 * This endpoint allows clients to confirm or cancel tool execution
 * and directly executes the tool if confirmed
 */
export async function handleToolConfirmation(
  request: Request,
  env: Env,
  userPrefix?: string,
  ctx?: ExecutionContext
): Promise<Response> {
  // Parse request body
  interface ConfirmationRequest {
    botName: string;
    server: string;
    tool: string;
    args: any;
  }
  
  const confirmationData = await request.json() as ConfirmationRequest;
  const { botName, server, tool, args } = confirmationData;

  console.log('Tool confirmation payload:', confirmationData);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  
  const task = (async () => {
    try {
      // Initialize repositories and MCP manager
      const mcpServerRepository = new McpServerMemoryRepository(env, userPrefix);
      const mcpManager = new McpManager(mcpServerRepository);
      
      // Get the bot config
      const botRepository = new BotMemoryRepository(env, userPrefix);
      const bots = await botRepository.getBots();
      const botConfig = bots.find(bot => bot.name === botName);
      if (!botConfig) {
        await writer.write(encoder.encode(`data: {"error": "Bot not found"}\n\n`));
        await writer.close();
        return;
      }

      // Execute the tool directly
      // We've already checked that server, tool, and args are not undefined
      const toolResult = await mcpManager.executeTool(
        server as string,
        tool as string,
        args
      );

      // Create a new user message with the tool result
      const userMessage: Message = createMessage('user', toolResult, {server, tool, arguments: args});

      await writer.write(encoder.encode(`data: ${JSON.stringify(userMessage)}\n\n`));
      
      // Close the writer
      await writer.write(encoder.encode(`data: [DONE]\n\n`));
      await writer.close();
      console.log('Completed tool stream for', server, tool);
    } catch (error) {
      console.error('Error processing stream:', error);
      writer.abort(error);
    }
  })();

  ctx?.waitUntil(task);
  
  // Return the streaming response
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders
    }
  });
}
