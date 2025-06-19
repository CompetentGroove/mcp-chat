import { BotConfig, BotRepository } from '../../../../shared/types';
import { Env } from 'worker-configuration';

const botsByUser: Record<string, BotConfig[]> = {};

export class BotMemoryRepository implements BotRepository {
  private userPrefix: string;
  private env: Env;

  constructor(env: Env, userPrefix?: string) {
    this.userPrefix = userPrefix || 'default';
    this.env = env;
    if (!botsByUser[this.userPrefix]) {
      let defaults: BotConfig[] = [];
      if (this.env.BOTS) {
        try {
          const parsed = JSON.parse(this.env.BOTS);
          if (Array.isArray(parsed)) {
            defaults = parsed as BotConfig[];
          }
        } catch (err) {
          console.error('Failed to parse BOTS env:', err);
        }
      }
      botsByUser[this.userPrefix] = [...defaults];
    }
  }

  private get userBots(): BotConfig[] {
    return botsByUser[this.userPrefix];
  }

  async getBots(): Promise<BotConfig[]> {
    const freeBots: BotConfig[] = [
      {
        name: 'gemini',
        model: 'google/gemini-2.5-flash-preview-05-20',
        mcp_servers: ['default']
      }
    ];
    const bots = [...this.userBots];
    for (const fb of freeBots) {
      if (!bots.some(b => b.model === fb.model)) {
        bots.push(fb);
      }
    }
    bots.sort((a, b) =>
      freeBots.findIndex(bot => bot.model === a.model) -
      freeBots.findIndex(bot => bot.model === b.model)
    );
    return bots;
  }

  async addBot(bot: BotConfig): Promise<void> {
    this.userBots.push(bot);
  }

  async updateBot(name: string, bot: BotConfig): Promise<void> {
    const index = this.userBots.findIndex(b => b.name === name);
    if (index === -1) throw new Error(`Bot with name ${name} not found`);
    this.userBots[index] = bot;
  }

  async deleteBot(name: string): Promise<void> {
    const index = this.userBots.findIndex(b => b.name === name);
    if (index === -1) throw new Error(`Bot with name ${name} not found`);
    this.userBots.splice(index, 1);
  }
}
