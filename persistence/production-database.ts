/**
 * WAI SDK v9.0 - Production Database Layer  
 * Real persistence implementation for enterprise durability
 */

import { Pool } from 'pg';
import { EventEmitter } from 'events';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  duration: number;
}

export interface TransactionContext {
  id: string;
  startTime: Date;
  queries: number;
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
}

export class ProductionDatabase extends EventEmitter {
  private pool: Pool;
  private isConnected: boolean = false;
  private metrics: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    avgResponseTime: number;
    activeConnections: number;
    totalConnections: number;
  } = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    avgResponseTime: 0,
    activeConnections: 0,
    totalConnections: 0
  };

  constructor(config: DatabaseConfig) {
    super();
    
    // Resilient connection bootstrap supporting both DATABASE_URL and individual env vars
    let dbConfig: any;
    
    if (process.env.DATABASE_URL) {
      // Cloud database connection (Neon) - use proper SSL safeguards
      dbConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Neon cloud connections
        max: config.maxConnections || 20,
        idleTimeoutMillis: config.idleTimeoutMs || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMs || 10000,
      };
    } else if (process.env.PGHOST && process.env.PGUSER) {
      // Local database connection - use individual environment variables
      dbConfig = {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || String(config.port || 5432)),
        database: process.env.PGDATABASE || config.database,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: config.maxConnections || 20,
        idleTimeoutMillis: config.idleTimeoutMs || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMs || 10000,
      };
    } else {
      // No database configuration available - emit fallback immediately
      console.log('⚠️ No database configuration found - enabling fallback mode');
      setTimeout(() => this.emit('database-fallback-required', new Error('No database configuration')), 0);
      // Create a dummy pool to prevent crashes, but it won't be used
      dbConfig = {
        host: 'localhost',
        port: 5432,
        database: 'dummy',
        user: 'dummy',
        password: 'dummy',
        max: 1,
        connectionTimeoutMillis: 1000,
      };
    }

    this.pool = new Pool(dbConfig);
    
    this.setupEventHandlers();
    this.initializeDatabase();
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client) => {
      this.metrics.totalConnections++;
      this.metrics.activeConnections++;
      console.log('🔗 Database client connected');
      this.emit('client-connected');
    });

    this.pool.on('remove', (client) => {
      this.metrics.activeConnections--;
      console.log('🔌 Database client disconnected');
      this.emit('client-disconnected');
    });

    this.pool.on('error', (err, client) => {
      console.error('❌ Database pool error:', err);
      this.emit('pool-error', err);
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Check if Neon endpoint is enabled by testing a simple query first
      await this.query('SELECT 1 as test');
      await this.createTables();
      this.isConnected = true;
      console.log('✅ Production database initialized');
      this.emit('database-ready');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      
      // Check if this is the Neon endpoint disabled error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage && errorMessage.includes('endpoint has been disabled')) {
        console.log('⚠️ Neon endpoint disabled - enabling fallback mode');
        this.emit('database-fallback-required', error);
        return; // Don't throw, let fallback handle it
      }
      
      this.emit('database-error', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const tables = [
      // Agent Registry Table
      `CREATE TABLE IF NOT EXISTS agent_registry (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        capabilities JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // BMAD Dialogues Table
      `CREATE TABLE IF NOT EXISTS bmad_dialogues (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        objective TEXT NOT NULL,
        participants JSONB NOT NULL,
        phases JSONB NOT NULL DEFAULT '[]',
        outcomes JSONB,
        status VARCHAR(50) DEFAULT 'active',
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // BMAD Exchanges Table
      `CREATE TABLE IF NOT EXISTS bmad_exchanges (
        id VARCHAR(255) PRIMARY KEY,
        dialogue_id VARCHAR(255) REFERENCES bmad_dialogues(id),
        phase_name VARCHAR(255) NOT NULL,
        speaker_id VARCHAR(255) NOT NULL,
        addressee_id VARCHAR(255),
        message_type VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        confidence DECIMAL(5,4) DEFAULT 1.0,
        impact DECIMAL(5,4) DEFAULT 0.5,
        metadata JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW()
      )`,

      // CAM Memories Table
      `CREATE TABLE IF NOT EXISTS cam_memories (
        id VARCHAR(255) PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        context_id VARCHAR(255) NOT NULL,
        content_text TEXT NOT NULL,
        content_entities JSONB DEFAULT '[]',
        type VARCHAR(50) NOT NULL CHECK (type IN ('episodic', 'semantic', 'procedural')),
        importance DECIMAL(5,4) NOT NULL,
        tags JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        embedding_vector TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        accessed_at TIMESTAMP DEFAULT NOW(),
        access_count INTEGER DEFAULT 0
      )`,

      // GRPO Groups Table
      `CREATE TABLE IF NOT EXISTS grpo_groups (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        objective TEXT NOT NULL,
        agents JSONB NOT NULL,
        coordinator VARCHAR(255),
        performance JSONB NOT NULL,
        optimization JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'forming',
        metrics JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // GRPO Training Sessions Table
      `CREATE TABLE IF NOT EXISTS grpo_training_sessions (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255) REFERENCES grpo_groups(id),
        objective TEXT NOT NULL,
        hyperparameters JSONB NOT NULL,
        results JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // GRPO Episodes Table
      `CREATE TABLE IF NOT EXISTS grpo_episodes (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) REFERENCES grpo_training_sessions(id),
        group_id VARCHAR(255) REFERENCES grpo_groups(id),
        episode_number INTEGER NOT NULL,
        experiences JSONB NOT NULL,
        group_reward DECIMAL(10,6) NOT NULL,
        individual_rewards JSONB NOT NULL,
        relative_rankings JSONB NOT NULL,
        policy_updates JSONB NOT NULL,
        metadata JSONB DEFAULT '{}',
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // SLO Metrics Table
      `CREATE TABLE IF NOT EXISTS slo_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(255) NOT NULL,
        value DECIMAL(10,6) NOT NULL,
        target DECIMAL(10,6) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        threshold_type VARCHAR(10) NOT NULL CHECK (threshold_type IN ('upper', 'lower')),
        timestamp TIMESTAMP DEFAULT NOW()
      )`,

      // Audit Log Table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255),
        details JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,

      // User Sessions Table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // Configuration Table
      `CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        updated_by VARCHAR(255),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    ];

    for (const table of tables) {
      await this.query(table);
    }

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_bmad_dialogues_status ON bmad_dialogues(status)',
      'CREATE INDEX IF NOT EXISTS idx_bmad_exchanges_dialogue_id ON bmad_exchanges(dialogue_id)',
      'CREATE INDEX IF NOT EXISTS idx_cam_memories_agent_id ON cam_memories(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_cam_memories_type ON cam_memories(type)',
      'CREATE INDEX IF NOT EXISTS idx_cam_memories_importance ON cam_memories(importance DESC)',
      'CREATE INDEX IF NOT EXISTS idx_grpo_groups_status ON grpo_groups(status)',
      'CREATE INDEX IF NOT EXISTS idx_grpo_episodes_session_id ON grpo_episodes(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_slo_metrics_name_time ON slo_metrics(metric_name, timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_slo_metrics_timestamp ON slo_metrics(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_user_time ON audit_log(user_id, timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_action_time ON audit_log(action, timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)',
    ];

    for (const index of indexes) {
      try {
        await this.query(index);
      } catch (error) {
        // Ignore index creation errors (they might already exist)
        console.warn('Index creation warning:', error);
      }
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const startTime = Date.now();
    this.metrics.totalQueries++;

    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query(text, params);
        const duration = Date.now() - startTime;
        
        this.updateMetrics(duration, true);
        
        return {
          rows: result.rows,
          rowCount: result.rowCount || 0,
          command: result.command,
          duration
        };
      } finally {
        client.release();
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);
      
      console.error('❌ Database query error:', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params: params?.slice(0, 3),
        error: error instanceof Error ? error.message : String(error),
        duration
      });
      
      this.emit('query-error', { text, params, error, duration });
      throw error;
    }
  }

  async transaction<T>(
    callback: (ctx: TransactionContext) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    try {
      await client.query('BEGIN');
      
      const ctx: TransactionContext = {
        id: transactionId,
        startTime: new Date(),
        queries: 0,
        rollback: async () => {
          await client.query('ROLLBACK');
        },
        commit: async () => {
          await client.query('COMMIT');
        }
      };

      // Override query method for transaction context
      const originalQuery = this.query.bind(this);
      this.query = async <T>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        ctx.queries++;
        const startTime = Date.now();
        
        try {
          const result = await client.query(text, params);
          const duration = Date.now() - startTime;
          
          return {
            rows: result.rows,
            rowCount: result.rowCount || 0,
            command: result.command,
            duration
          };
        } catch (error) {
          console.error('❌ Transaction query error:', error);
          throw error;
        }
      };

      const result = await callback(ctx);
      
      await client.query('COMMIT');
      this.query = originalQuery; // Restore original query method
      
      console.log(`✅ Transaction ${transactionId} committed (${ctx.queries} queries)`);
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.query = this.query; // Restore original query method
      
      console.error(`❌ Transaction ${transactionId} rolled back:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private updateMetrics(duration: number, success: boolean): void {
    if (success) {
      this.metrics.successfulQueries++;
    } else {
      this.metrics.failedQueries++;
    }

    // Update rolling average response time
    const totalQueries = this.metrics.successfulQueries + this.metrics.failedQueries;
    this.metrics.avgResponseTime = (
      (this.metrics.avgResponseTime * (totalQueries - 1) + duration) / totalQueries
    );
  }

  // Agent Registry Methods
  async insertAgent(agent: any): Promise<void> {
    await this.query(
      `INSERT INTO agent_registry (id, name, category, capabilities, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       category = EXCLUDED.category,
       capabilities = EXCLUDED.capabilities,
       status = EXCLUDED.status,
       updated_at = NOW()`,
      [agent.id, agent.name, agent.category, JSON.stringify(agent.capabilities), agent.status || 'active']
    );
  }

  async getAgents(filter?: { category?: string; status?: string }): Promise<any[]> {
    let query = 'SELECT * FROM agent_registry WHERE 1=1';
    const params: any[] = [];
    
    if (filter?.category) {
      params.push(filter.category);
      query += ` AND category = $${params.length}`;
    }
    
    if (filter?.status) {
      params.push(filter.status);
      query += ` AND status = $${params.length}`;
    }
    
    query += ' ORDER BY name';
    
    const result = await this.query(query, params);
    return result.rows.map(row => ({
      ...row,
      capabilities: typeof row.capabilities === 'string' ? JSON.parse(row.capabilities) : row.capabilities
    }));
  }

  // BMAD Methods
  async insertDialogue(dialogue: any): Promise<void> {
    await this.query(
      `INSERT INTO bmad_dialogues (id, name, objective, participants, phases, outcomes, status, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        dialogue.id,
        dialogue.name,
        dialogue.objective,
        JSON.stringify(dialogue.participants),
        JSON.stringify(dialogue.phases),
        JSON.stringify(dialogue.outcomes),
        dialogue.status,
        dialogue.startTime,
        dialogue.endTime
      ]
    );
  }

  async insertExchange(exchange: any): Promise<void> {
    await this.query(
      `INSERT INTO bmad_exchanges (id, dialogue_id, phase_name, speaker_id, addressee_id, message_type, content, confidence, impact, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        exchange.id,
        exchange.dialogueId,
        exchange.phaseName,
        exchange.speakerId,
        exchange.addresseeId,
        exchange.messageType,
        exchange.content,
        exchange.confidence,
        exchange.impact,
        JSON.stringify(exchange.metadata)
      ]
    );
  }

  // CAM Methods
  async insertMemory(memory: any): Promise<void> {
    await this.query(
      `INSERT INTO cam_memories (id, agent_id, context_id, content_text, content_entities, type, importance, tags, metadata, embedding_vector)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        memory.id,
        memory.agentId,
        memory.contextId,
        memory.content.text,
        JSON.stringify(memory.content.entities),
        memory.type,
        memory.metadata.importance,
        JSON.stringify(memory.metadata.tags),
        JSON.stringify(memory.metadata),
        memory.embedding ? `[${memory.embedding.join(',')}]` : null
      ]
    );
  }

  async searchMemories(agentId: string, query: string, limit: number = 10): Promise<any[]> {
    // In production, this would use vector similarity search
    const result = await this.query(
      `SELECT * FROM cam_memories 
       WHERE agent_id = $1 
       AND (content_text ILIKE $2 OR content_entities::text ILIKE $2)
       ORDER BY importance DESC, created_at DESC
       LIMIT $3`,
      [agentId, `%${query}%`, limit]
    );
    
    return result.rows.map(row => ({
      ...row,
      content: {
        text: row.content_text,
        entities: typeof row.content_entities === 'string' ? JSON.parse(row.content_entities) : row.content_entities
      },
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }

  // SLO Methods
  async insertSLOMetric(metric: any): Promise<void> {
    await this.query(
      `INSERT INTO slo_metrics (metric_name, value, target, unit, status, threshold_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [metric.name, metric.current, metric.target, metric.unit, metric.status, metric.threshold]
    );
  }

  async getSLOMetrics(metricName?: string, hours: number = 24): Promise<any[]> {
    let query = `
      SELECT metric_name, value, target, unit, status, threshold_type, timestamp
      FROM slo_metrics 
      WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
    `;
    const params: any[] = [];
    
    if (metricName) {
      params.push(metricName);
      query += ` AND metric_name = $${params.length}`;
    }
    
    query += ' ORDER BY timestamp DESC';
    
    const result = await this.query(query, params);
    return result.rows;
  }

  // Audit Methods
  async insertAuditLog(log: any): Promise<void> {
    await this.query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [log.userId, log.action, log.resourceType, log.resourceId, JSON.stringify(log.details), log.ipAddress, log.userAgent]
    );
  }

  // Health and Metrics
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    connectionCount: number;
    avgResponseTime: number;
    totalQueries: number;
    successRate: number;
  }> {
    try {
      const startTime = Date.now();
      await this.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      const successRate = this.metrics.totalQueries > 0 
        ? this.metrics.successfulQueries / this.metrics.totalQueries
        : 1;

      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (responseTime > 100 || successRate < 0.95) {
        status = 'degraded';
      }
      if (responseTime > 1000 || successRate < 0.8) {
        status = 'down';
      }

      return {
        status,
        connectionCount: this.metrics.activeConnections,
        avgResponseTime: this.metrics.avgResponseTime,
        totalQueries: this.metrics.totalQueries,
        successRate
      };
    } catch (error) {
      return {
        status: 'down',
        connectionCount: 0,
        avgResponseTime: 0,
        totalQueries: this.metrics.totalQueries,
        successRate: 0
      };
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('🧹 Database pool closed');
    }
  }
}

// Export singleton instance with environment configuration
export const productionDB = new ProductionDatabase({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'wai_orchestration',
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password'
});