import { EventEmitter } from 'events';

class ProductionIntegrationManager extends EventEmitter {
  private ready: boolean = true;

  isReady(): boolean {
    return this.ready;
  }
}

export const productionIntegrationManager = new ProductionIntegrationManager();
