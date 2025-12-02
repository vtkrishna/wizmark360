# WAI SDK v1.0 - Getting Started Guide

> **Version**: 1.0.0  
> **Last Updated**: November 25, 2025

## Introduction

The WAI SDK v1.0 is an enterprise-grade AI orchestration platform designed for autonomous multi-agent coordination. This guide will help you get started quickly.

## Prerequisites

- Node.js 20.x or later
- PostgreSQL 15+ (for memory persistence)
- API keys for your preferred LLM providers

## Installation

### Package Installation

```bash
# Install core package
npm install @wai/core

# Install additional packages as needed
npm install @wai/agents @wai/tools @wai/memory @wai/protocols
```

### Environment Setup

Create a `.env` file with your API keys:

```env
# Required for LLM providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Required for memory persistence
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional providers
PERPLEXITY_API_KEY=...
XAI_API_KEY=...
COHERE_API_KEY=...
```

## Quick Start

### 1. Basic Setup

```typescript
import { WAIConfig, Container } from '@wai/core';
import { AgentRegistry } from '@wai/agents';
import { ToolRegistry } from '@wai/tools';

// Initialize configuration
const config = new WAIConfig({
  providers: {
    default: 'anthropic',
    fallback: ['openai', 'google'],
  },
  agents: {
    maxConcurrent: 10,
    defaultTimeout: 30000,
  },
});

// Create container
const container = new Container();
container.register('config', config);
container.register('agents', new AgentRegistry());
container.register('tools', new ToolRegistry());

console.log('WAI SDK initialized!');
```

### 2. Using Agents

```typescript
import { AgentRegistry } from '@wai/agents';

const registry = new AgentRegistry();

// Get a full-stack developer agent
const developer = registry.get('fullstack-developer');
console.log(`Agent: ${developer.name}`);
console.log(`Capabilities: ${developer.capabilities.join(', ')}`);
console.log(`ROMA Level: ${developer.romaLevel}`);

// Find agents by capability
const webDevs = registry.findByCapability('frontend');
console.log(`Found ${webDevs.length} frontend developers`);
```

### 3. Using Tools

```typescript
import { ToolRegistry, fileOperations, webRequests } from '@wai/tools';

const registry = new ToolRegistry();

// Execute file read
const content = await registry.execute('file-read', {
  path: '/path/to/file.txt',
});

// Make web request
const response = await registry.execute('web-request', {
  method: 'GET',
  url: 'https://api.example.com/data',
});
```

### 4. Using Memory

```typescript
import { MemoryService } from '@wai/memory';

const memory = new MemoryService({
  vectorStore: 'pgvector',
  embeddingModel: 'text-embedding-3-small',
});

// Store a memory
await memory.add({
  userId: 'user123',
  content: 'User prefers dark mode and TypeScript',
  metadata: { category: 'preferences' },
});

// Search memories
const results = await memory.search({
  userId: 'user123',
  query: 'user preferences',
  limit: 5,
});

console.log('Found memories:', results);
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WAI SDK v1.0                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  @wai/core  │  │ @wai/agents │  │ @wai/tools  │          │
│  │ Orchestrate │  │ 267+ Agents │  │ 93 Tools    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ @wai/memory │  │@wai/protocol│  │@wai/workflow│          │
│  │ Vector DB   │  │ MCP/ROMA    │  │ Scheduling  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │@wai/provider│  │@wai/adapters│                           │
│  │ 23+ LLMs    │  │ Express/PG  │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Agent Tiers

| Tier | Agents | Use Cases |
|------|--------|-----------|
| **Executive** | 34 | Project management, strategic planning, team coordination |
| **Development** | 160 | Full-stack development, API design, database modeling |
| **Creative** | 17 | Content creation, UI/UX design, copywriting |
| **QA** | 7 | Testing, quality assurance, bug tracking |
| **DevOps** | 11 | Deployment, infrastructure, monitoring |
| **Domain** | 38 | Industry-specific expertise |

## ROMA Autonomy Levels

| Level | Name | Human Involvement |
|-------|------|-------------------|
| L1 | Assisted | Approval required for all actions |
| L2 | Supervised | Approval for significant actions |
| L3 | Autonomous | Autonomous with notifications |
| L4 | Fully Autonomous | Complete autonomy |

## Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| Core | 10 | File, web, code, JSON, text, math, datetime |
| Memory | 4 | Store, recall, update, delete |
| Multimodal | 23 | Image, video, audio processing |
| Data | 20 | Analysis, visualization, statistics |
| Web | 15 | Scraping, search, SEO |
| Communication | 10 | Email, messaging, notifications |
| Document | 5 | PDF, Office, markdown |
| API | 5 | REST, GraphQL, webhooks |

## LLM Providers

| Provider | Models | Strengths |
|----------|--------|-----------|
| Anthropic | Claude 3.5 | Extended thinking, tools |
| OpenAI | GPT-4o | Function calling, vision |
| Google | Gemini 2.0 | Multimodal, grounding |
| Perplexity | Sonar Pro | Real-time search |
| DeepSeek | V3 | Cost-effective coding |
| Groq | Llama 3.3 | Ultra-fast inference |

## Example: Building a Simple Agent

```typescript
import { WAIConfig, RequestBuilder } from '@wai/core';
import { AgentRegistry } from '@wai/agents';
import { ToolRegistry } from '@wai/tools';
import { MemoryService } from '@wai/memory';

async function main() {
  // Setup
  const agents = new AgentRegistry();
  const tools = new ToolRegistry();
  const memory = new MemoryService();
  
  // Get developer agent
  const developer = agents.get('fullstack-developer');
  
  // Build request
  const request = new RequestBuilder()
    .withAgent(developer.id)
    .withTask('Create a user authentication system')
    .withContext({
      framework: 'React',
      backend: 'Node.js',
      database: 'PostgreSQL',
    })
    .withRomaLevel('L3')
    .withTools(developer.tools)
    .build();
  
  // Execute (simplified - full implementation uses orchestration engine)
  console.log('Request:', request);
  
  // Store in memory for future reference
  await memory.add({
    content: 'Created user authentication system for React/Node.js/PostgreSQL stack',
    metadata: { project: 'auth-system', status: 'completed' },
  });
}

main().catch(console.error);
```

## Best Practices

### 1. Use Appropriate ROMA Levels

- **L1-L2**: For risky or irreversible actions
- **L3**: For routine development tasks
- **L4**: For well-tested, low-risk automation

### 2. Implement Fallback Chains

```typescript
const config = new WAIConfig({
  providers: {
    default: 'anthropic',
    fallback: ['openai', 'google', 'perplexity'],
  },
});
```

### 3. Use Memory for Context

```typescript
// Always check memory for relevant context
const context = await memory.search({
  query: 'user preferences for this project',
  limit: 10,
});
```

### 4. Monitor with CAM 2.0

```typescript
import { CAMMonitor } from '@wai/memory';

const cam = new CAMMonitor();
cam.trackUsage({
  agentId: 'fullstack-developer',
  tokensUsed: 2048,
  contextWindow: 8192,
});
```

## Next Steps

1. Explore [API Reference](./API_REFERENCE.md) for detailed documentation
2. Check [Examples](../examples/) for more use cases
3. Review [Architecture](../ARCHITECTURE.md) for system design
4. See [Changelog](../CHANGELOG.md) for version history

## Support

- Documentation: `wai-sdk/docs/`
- GitHub Issues: Report bugs and feature requests
- Discord: Join the WAI SDK community

---

**Happy building with WAI SDK v1.0!**
