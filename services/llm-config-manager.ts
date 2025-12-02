
export class LLMConfigManager {
  private config: any;
  private enabled: Map<string, boolean> = new Map();
  
  constructor() {
    this.loadConfig();
    this.initializeProviders();
  }
  
  private loadConfig() {
    const configPath = path.join(__dirname, '../config/llm-config.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  enableProvider(providerId: string): boolean {
    if (!this.config.providers[providerId]) {
      throw new Error(`Provider ${providerId} not found in configuration`);
    }
    
    this.config.providers[providerId].enabled = true;
    this.enabled.set(providerId, true);
    this.saveConfig();
    console.log(`✅ Enabled LLM provider: ${providerId}`);
    return true;
  }
  
  disableProvider(providerId: string): boolean {
    if (!this.config.providers[providerId]) {
      throw new Error(`Provider ${providerId} not found in configuration`);
    }
    
    this.config.providers[providerId].enabled = false;
    this.enabled.set(providerId, false);
    this.saveConfig();
    console.log(`❌ Disabled LLM provider: ${providerId}`);
    return true;
  }
  
  addProvider(providerId: string, config: any): boolean {
    this.config.providers[providerId] = {
      enabled: true,
      ...config
    };
    this.enabled.set(providerId, true);
    this.saveConfig();
    console.log(`➕ Added new LLM provider: ${providerId}`);
    return true;
  }
  
  removeProvider(providerId: string): boolean {
    if (!this.config.providers[providerId]) {
      throw new Error(`Provider ${providerId} not found`);
    }
    
    delete this.config.providers[providerId];
    this.enabled.delete(providerId);
    this.saveConfig();
    console.log(`🗑️ Removed LLM provider: ${providerId}`);
    return true;
  }
  
  getEnabledProviders(): string[] {
    return Object.keys(this.config.providers)
      .filter(id => this.config.providers[id].enabled);
  }
  
  getProviderConfig(providerId: string) {
    return this.config.providers[providerId];
  }
  
  updateApiKey(providerId: string, apiKey: string): boolean {
    const envVar = this.config.providers[providerId]?.apiKeyEnv;
    if (!envVar) {
      throw new Error(`Provider ${providerId} not found or no API key environment variable configured`);
    }
    
    process.env[envVar] = apiKey;
    console.log(`🔑 Updated API key for provider: ${providerId}`);
    return true;
  }
  
  private initializeProviders() {
    Object.keys(this.config.providers).forEach(providerId => {
      const provider = this.config.providers[providerId];
      this.enabled.set(providerId, provider.enabled);
    });
  }
  
  private saveConfig() {
    const configPath = path.join(__dirname, '../config/llm-config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }
  
  getRoutingStrategy() {
    return this.config.routing;
  }
  
  getFallbackChain() {
    return this.config.fallbackChain;
  }
}

export const llmConfigManager = new LLMConfigManager();
