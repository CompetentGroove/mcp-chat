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
      serversByUser[this.userPrefix] = [];
    }
  }

  private get userServers(): McpServerConfig[] {
    return serversByUser[this.userPrefix];
  }

  async getMcpServers(): Promise<McpServerConfig[]> {
    const defaults: McpServerConfig[] = [
      {
        name: 'default',
        url: this.env.MCP_SERVER_URL
      }
    ];
    const servers = [...this.userServers];
    for (const d of defaults) {
      if (!servers.some(s => s.name === d.name)) {
        servers.push(d);
      }
    }
    return servers;
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
