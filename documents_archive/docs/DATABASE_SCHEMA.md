# WAI SDK Platform - Database Schema

## Overview

The WAI SDK Platform uses PostgreSQL as its primary database with Drizzle ORM for type-safe database operations.

## Core Tables

### agents
Stores agent definitions and configurations.

```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  roma_level VARCHAR(10) NOT NULL,
  capabilities TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_roma_level ON agents(roma_level);
CREATE INDEX idx_agents_status ON agents(status);
```

### agent_executions
Tracks agent task executions.

```sql
CREATE TABLE agent_executions (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(255),
  input JSONB,
  output JSONB,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6)
);

CREATE INDEX idx_executions_agent ON agent_executions(agent_id);
CREATE INDEX idx_executions_status ON agent_executions(status);
```

### llm_providers
Stores LLM provider configurations.

```sql
CREATE TABLE llm_providers (
  id SERIAL PRIMARY KEY,
  provider_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'healthy',
  models TEXT[],
  config JSONB,
  last_health_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### mcp_tools
Stores MCP tool definitions.

```sql
CREATE TABLE mcp_tools (
  id SERIAL PRIMARY KEY,
  tool_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  input_schema JSONB,
  output_schema JSONB,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tools_category ON mcp_tools(category);
```

### orchestration_sessions
Tracks orchestration sessions.

```sql
CREATE TABLE orchestration_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER,
  agents_used TEXT[],
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metadata JSONB
);
```

### users
User accounts for authentication.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_executions_date ON agent_executions(started_at);
CREATE INDEX idx_tools_status ON mcp_tools(status);
```

## Migrations

Run migrations using Drizzle:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:push

# Force sync (development only)
npm run db:push --force
```

## Backup

```bash
# Backup database
pg_dump wai_sdk > backup_$(date +%Y%m%d).sql

# Restore
psql wai_sdk < backup.sql
```
