import { IntegrationConfig, IntegrationRepository } from '../../../../shared/types';

const integrationsByUser: Record<string, IntegrationConfig[]> = {};

export class IntegrationMemoryRepository implements IntegrationRepository {
  private userPrefix: string;

  constructor(userPrefix?: string) {
    this.userPrefix = userPrefix || 'default';
    if (!integrationsByUser[this.userPrefix]) {
      integrationsByUser[this.userPrefix] = [];
    }
  }

  private get userIntegrations(): IntegrationConfig[] {
    return integrationsByUser[this.userPrefix];
  }

  async getIntegrations(): Promise<IntegrationConfig[]> {
    return [...this.userIntegrations];
  }

  async addIntegration(integration: IntegrationConfig): Promise<void> {
    this.userIntegrations.push(integration);
  }

  async updateIntegration(name: string, integration: IntegrationConfig): Promise<void> {
    const index = this.userIntegrations.findIndex(i => i.name === name);
    if (index === -1) throw new Error(`Integration with name ${name} not found`);
    this.userIntegrations[index] = integration;
  }

  async deleteIntegration(name: string): Promise<void> {
    const index = this.userIntegrations.findIndex(i => i.name === name);
    if (index === -1) throw new Error(`Integration with name ${name} not found`);
    this.userIntegrations.splice(index, 1);
  }
}
