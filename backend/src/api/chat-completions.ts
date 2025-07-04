import { Chat, Message } from '../../../shared/types';
import { ChatMemoryRepository } from '../repository/memory/chat-memory-repository';
import { BotMemoryRepository } from '../repository/memory/bot-memory-repository';
import { corsHeaders } from '../middleware/cors';
import { ProviderFactory } from '../providers/provider-factory';
import { McpManager } from '../mcp/mcp-manager';
import { ChatService } from '../service/chat';
import { createMessage } from 'src/utils/message';
import { McpServerMemoryRepository } from 'src/repository/memory/mcp-server-memory-repository';
import { Env } from 'worker-configuration';
import type { ExecutionContext } from 'hono/dist/types/context';

/**
 * Handle the chat completions endpoint
 * This function processes requests to send messages to a chat and get AI responses
 */
export async function handleChatCompletions(
  request: Request,
  env: Env,
  userPrefix?: string,
  ctx?: ExecutionContext
): Promise<Response> {
  // Get message data from request
  interface CompletionRequest {
    content: string;
    botName: string;
    chatId: string;
    server?: string;
    userMessageId?: string;
  }
  const completionData = await request.json() as CompletionRequest;
  const { content, botName, chatId, userMessageId } = completionData;

  console.log('Completion request payload:', completionData);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();


  console.log('Starting chat completion for chat', chatId);


  const task = (async () => {
    try {
      console.log('User prefix:', userPrefix);
      // Get or create the chat
      const chatRepository = new ChatMemoryRepository(userPrefix);

      // Get the bot config
      const botRepository = new BotMemoryRepository(env, userPrefix);
      const mcpServerRepository = new McpServerMemoryRepository(env, userPrefix);
      const bots = await botRepository.getBots();
      const botConfig = bots.find(bot => bot.name === botName);
      if (!botConfig) {
        await writer.write(encoder.encode(`data: {"error": "Bot not found"}\n\n`));
        await writer.close();
        return;
      }
      let resultBotConfig = botConfig;
      if (!resultBotConfig.api_key || !resultBotConfig.base_url) {
        resultBotConfig.api_key = env.OPENROUTER_FREE_KEY;
        resultBotConfig.base_url = env.OPENROUTER_BASE_URL;
      }
      if (!resultBotConfig.timeout_ms) {
        const envTimeout = parseInt(env.API_TIMEOUT_MS || '0', 10);
        if (envTimeout) {
          resultBotConfig.timeout_ms = envTimeout;
        }
      }
      console.log('Bot config:', resultBotConfig);

      // Get the provider
      const provider = ProviderFactory.createProvider(resultBotConfig);

      // Get the MCP manager
      const mcpManager = new McpManager(mcpServerRepository);

      // Create the chat service
      const chatService = new ChatService(chatRepository, provider, mcpManager, chatId, resultBotConfig);

      await chatService.initializeChat(writer);

      let userMessage: Message;
      
      // If userMessageId is provided, find the existing user message
      if (userMessageId) {
        const chat = await chatRepository.getChat(chatId);
        if (!chat) {
          await writer.write(encoder.encode(`data: {"error": "Chat not found"}\n\n`));
          return;
        }
        
        const existingUserMessage = chat.messages.find((msg: Message) => msg.id === userMessageId && msg.role === 'user');
        if (!existingUserMessage) {
          await writer.write(encoder.encode(`data: {"error": "User message not found"}\n\n`));
          return;
        }
        
        userMessage = existingUserMessage;
      } else {
        // Create a new user message with unique ID
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        userMessage = createMessage('user', content, { 
          server: completionData.server,
          id: messageId
        });
      }

      // Process the user message
      await chatService.processUserMessage(userMessage, writer, userMessageId);
      
      // Close the writer
      await writer.write(encoder.encode(`data: [DONE]\n\n`));
      await writer.close();
      console.log('Completed streaming for chat', chatId);
    } catch (error: unknown) {
      console.error('Error processing stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await writer.write(encoder.encode(`data: {"error": "${errorMessage}"}\n\n`));
      await writer.close();
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
