import { BotConfig, McpServerConfig } from '@shared/types';

export function getBots(): BotConfig[] {
  try {
    const data = localStorage.getItem('bots');
    return data ? JSON.parse(data) as BotConfig[] : [];
  } catch {
    return [];
  }
}

export function saveBots(bots: BotConfig[]) {
  localStorage.setItem('bots', JSON.stringify(bots));
}

export function getMcpServers(): McpServerConfig[] {
  try {
    const data = localStorage.getItem('mcp_servers');
    return data ? JSON.parse(data) as McpServerConfig[] : [];
  } catch {
    return [];
  }
}

export function saveMcpServers(servers: McpServerConfig[]) {
  localStorage.setItem('mcp_servers', JSON.stringify(servers));
}
