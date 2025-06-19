import { McpServerConfig, McpServerRepository } from '../../../../shared/types';
import { Env } from 'worker-configuration';

const serversByUser: Record<string, McpServerConfig[]> = {};

export class McpServerMemoryRepository implements McpServerRepository {
  private userPrefix: string;
  private env: Env;

  constructor(env: Env, userPrefix?: string) {
    this.userPrefix = userPrefix || 'default';
    this.env = env;
    if (!serversByUser[this.userPrefix]) {
      let defaults: McpServerConfig[] = [];
      if (this.env.MCP_SERVERS) {
        try {
          const parsed = JSON.parse(this.env.MCP_SERVERS);
          if (Array.isArray(parsed)) {
            defaults = parsed as McpServerConfig[];
          }
        } catch (err) {
          console.error('Failed to parse MCP_SERVERS env:', err);
        }
      } else if (this.env.MCP_SERVER_URL) {
        defaults = [{ name: 'default', url: this.env.MCP_SERVER_URL }];
      }
      serversByUser[this.userPrefix] = [...defaults];
    }
  }

  private get userServers(): McpServerConfig[] {
    return serversByUser[this.userPrefix];
  }

  async getMcpServers(): Promise<McpServerConfig[]> {
    return [...this.userServers];
  }

  async addMcpserver(server: McpServerConfig): Promise<void> {
    this.userServers.push(server);
  }

  async updateMcpServer(name: string, server: McpServerConfig): Promise<void> {
    const index = this.userServers.findIndex(s => s.name === name);
    if (index === -1) throw new Error(`MCP server with name ${name} not found`);
    this.userServers[index] = server;
  }

  async deleteMcpServer(name: string): Promise<void> {
    const index = this.userServers.findIndex(s => s.name === name);
    if (index === -1) throw new Error(`MCP server with name ${name} not found`);
    this.userServers.splice(index, 1);
  }
}
