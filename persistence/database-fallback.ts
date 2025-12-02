/**
 * Database Fallback Configuration for WAI SDK v9.0
 * 
 * Provides robust fallback mechanisms when primary database is unavailable
 * Ensures system remains functional with graceful degradation
 */

import { UnifiedStorageAdapter } from '../storage/unified-storage-adapter';

export interface DatabaseFallbackConfig {
  enabled: boolean;
  fallbackMode: 'memory' | 'sqlite' | 'local-storage';
  retryAttempts: number;
  retryInterval: number;
  healthCheckInterval: number;
}

export class DatabaseFallbackManager {
  private config: DatabaseFallbackConfig;
  private storageAdapter: UnifiedStorageAdapter;
  private retryCount: number = 0;
  private isRetrying: boolean = false;

  constructor(config: DatabaseFallbackConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🔄 Initializing Database Fallback Manager...');
    
    // Configure storage adapter with fallback
    this.storageAdapter = new UnifiedStorageAdapter({
      provider: 'postgresql',
      connectionString: process.env.DATABASE_URL,
      fallbackProvider: this.config.fallbackMode as any
    });

    // Try to connect
    const connected = await this.storageAdapter.connect();
    
    if (!connected) {
      console.log('⚠️ Primary database unavailable, fallback active');
      this.startRetryProcess();
    } else {
      console.log('✅ Database connected successfully');
    }

    // Start health monitoring
    this.startHealthMonitoring();
  }

  private async startRetryProcess(): Promise<void> {
    if (this.isRetrying || this.retryCount >= this.config.retryAttempts) {
      return;
    }

    this.isRetrying = true;
    console.log(`🔄 Attempting database reconnection (${this.retryCount + 1}/${this.config.retryAttempts})`);

    setTimeout(async () => {
      try {
        const connected = await this.storageAdapter.connect();
        if (connected) {
          console.log('✅ Database reconnected successfully');
          this.retryCount = 0;
          this.isRetrying = false;
          return;
        }
      } catch (error) {
        console.error('❌ Database reconnection failed:', error);
      }

      this.retryCount++;
      this.isRetrying = false;
      
      if (this.retryCount < this.config.retryAttempts) {
        this.startRetryProcess();
      } else {
        console.log('⚠️ Max retry attempts reached, continuing in fallback mode');
      }
    }, this.config.retryInterval);
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        const isHealthy = await this.storageAdapter.isHealthy();
        if (!isHealthy && this.retryCount < this.config.retryAttempts) {
          this.startRetryProcess();
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  getStorageAdapter(): UnifiedStorageAdapter {
    return this.storageAdapter;
  }

  getStatus() {
    return {
      fallbackMode: this.config.fallbackMode,
      retryCount: this.retryCount,
      isRetrying: this.isRetrying,
      storageStatus: this.storageAdapter?.getStorageStatus() || { connected: false, degraded: true }
    };
  }
}

// Default configuration
export const defaultFallbackConfig: DatabaseFallbackConfig = {
  enabled: true,
  fallbackMode: 'memory',
  retryAttempts: 5,
  retryInterval: 30000, // 30 seconds
  healthCheckInterval: 60000 // 1 minute
};