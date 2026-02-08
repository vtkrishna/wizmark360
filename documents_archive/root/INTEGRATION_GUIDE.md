# WAI SDK v1.0 - Integration Guide

**Complete guide to integrating WAI SDK Orchestration into your project**

---

## 📦 What's Included in This Package

This standalone WAI SDK package contains everything you need to add enterprise AI orchestration to your project:

### Core Services ✅
- `real-llm-service.ts` - 23+ LLM provider integration (2,014 lines)
- `wizards-orchestration-service.ts` - Main orchestration engine (700+ lines)
- `agui-wai-integration-service.ts` - Real-time streaming protocol (776 lines)
- `shared-agui-service.ts` - Singleton AG-UI instance
- `wai-orchestration-core-v9.ts` - Core orchestration logic (4,767 lines)

### Configuration Files ✅
- `package.json` - All required dependencies
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variable template

### Utilities ✅
- `wai-request-builder.ts` - Fluent request builder
- `clock-provider.ts` - Deterministic time provider

### Documentation ✅
- `README.md` - Complete usage documentation
- `INTEGRATION_GUIDE.md` - This integration guide (you are here)
- `API_REFERENCE.md` - Detailed API documentation
- `examples/` - Working code examples

---

## 🚀 Quick Integration Steps

### Step 1: Copy Package to Your Project

```bash
# Option 1: Download and extract
# Download wai-sdk-orchestration.zip and extract to your project

# Option 2: Copy from existing location
cp -r /path/to/wai-sdk-orchestration ./libs/wai-sdk

# Option 3: Use as npm workspace
cd your-project
mkdir -p packages
cp -r /path/to/wai-sdk-orchestration ./packages/wai-sdk
```

### Step 2: Install Dependencies

```bash
cd wai-sdk-orchestration
npm install
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit with your API keys
nano .env
```

Required environment variables:
```bash
# At least ONE provider required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Additional providers (optional)
XAI_API_KEY=...
PERPLEXITY_API_KEY=...
# ... (see .env.example for full list)
```

### Step 4: Import and Use

```typescript
// In your project
import { WAIOrchestration } from './libs/wai-sdk';

const wai = new WAIOrchestration({
  providers: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  },
});

const result = await wai.execute({
  task: 'Your orchestration task',
  type: 'analysis',
  agents: ['business_strategist'],
});
```

---

## 🏗️ Integration Architectures

### Architecture 1: Standalone Service

Use WAI SDK as a standalone microservice:

```typescript
// wai-service/index.ts
import express from 'express';
import { WAIOrchestration, createWAIRouter } from './wai-sdk';

const app = express();
const wai = new WAIOrchestration({...});

app.use('/api/wai', createWAIRouter(wai));

app.listen(3001, () => {
  console.log('WAI SDK Service running on port 3001');
});
```

Then call from your main app:
```typescript
// main-app/src/services/ai.ts
async function analyzeData(data: any) {
  const response = await fetch('http://localhost:3001/api/wai/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task: 'Analyze data',
      inputs: data,
    }),
  });
  
  return response.json();
}
```

### Architecture 2: Embedded Library

Embed WAI SDK directly in your application:

```typescript
// src/lib/ai/index.ts
import { WAIOrchestration } from '@/wai-sdk';

// Singleton instance
export const waiSDK = new WAIOrchestration({
  providers: {
    openai: process.env.OPENAI_API_KEY,
  },
});

// Convenience functions
export async function analyzeWithAI(task: string, data: any) {
  return waiSDK.execute({
    task,
    type: 'analysis',
    inputs: data,
  });
}

export async function generateWithAI(task: string, specs: any) {
  return waiSDK.execute({
    task,
    type: 'creative',
    inputs: specs,
  });
}
```

Use in your routes/controllers:
```typescript
import { analyzeWithAI } from '@/lib/ai';

app.post('/api/analyze', async (req, res) => {
  const result = await analyzeWithAI('Market analysis', req.body);
  res.json(result);
});
```

### Architecture 3: Multi-Tenant Setup

Support multiple clients/tenants:

```typescript
import { WAIOrchestration } from '@/wai-sdk';

class WAITenantManager {
  private instances: Map<string, WAIOrchestration> = new Map();
  
  getOrCreate(tenantId: string, apiKeys: any): WAIOrchestration {
    if (!this.instances.has(tenantId)) {
      this.instances.set(tenantId, new WAIOrchestration({
        providers: apiKeys,
        config: {
          // Tenant-specific config
        },
      }));
    }
    return this.instances.get(tenantId)!;
  }
}

export const waiTenantManager = new WAITenantManager();

// Usage
const wai = waiTenantManager.getOrCreate(req.user.tenantId, req.user.apiKeys);
const result = await wai.execute({...});
```

---

## 🎯 Common Integration Patterns

### Pattern 1: Background Job Processing

```typescript
import { WAIOrchestration } from '@/wai-sdk';
import { JobQueue } from '@/lib/queue';

const wai = new WAIOrchestration({...});
const queue = new JobQueue();

// Add job to queue
queue.add('ai-analysis', {
  task: 'Analyze user feedback',
  data: feedbackData,
});

// Process jobs with WAI SDK
queue.process('ai-analysis', async (job) => {
  const result = await wai.execute({
    task: job.data.task,
    type: 'analysis',
    inputs: job.data.data,
  });
  
  return result;
});
```

### Pattern 2: Streaming Responses

```typescript
import { WAIOrchestration, AGUIService } from '@/wai-sdk';

const wai = new WAIOrchestration({...});
const agui = new AGUIService();

app.post('/api/chat', async (req, res) => {
  // Create streaming session
  const session = agui.createSession(req.user.id);
  
  // Execute with streaming
  const result = await wai.executeWithStreaming({
    task: req.body.message,
    aguiSessionId: session.id,
  });
  
  res.json({
    sessionId: session.id,
    streamUrl: `/api/stream/${session.id}`,
  });
});

// SSE endpoint
app.get('/api/stream/:sessionId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  agui.on(`event:${req.params.sessionId}`, (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
});
```

### Pattern 3: Multi-Agent Workflows

```typescript
import { WAIOrchestration } from '@/wai-sdk';

const wai = new WAIOrchestration({...});

async function buildMVP(requirements: any) {
  // Step 1: Planning
  const plan = await wai.execute({
    task: 'Create MVP plan',
    agents: ['product_architect', 'business_strategist'],
    inputs: requirements,
  });
  
  // Step 2: Design
  const design = await wai.execute({
    task: 'Design UI/UX',
    agents: ['ui_ux_designer', 'frontend_specialist'],
    inputs: { plan: plan.outputs },
  });
  
  // Step 3: Development
  const code = await wai.execute({
    task: 'Generate code',
    agents: ['senior_developer', 'backend_specialist'],
    inputs: { design: design.outputs },
  });
  
  return { plan, design, code };
}
```

### Pattern 4: Cost-Aware Orchestration

```typescript
import { WAIOrchestration } from '@/wai-sdk';

const wai = new WAIOrchestration({...});

async function executeWithBudget(task: string, budget: number) {
  let costBudget: 'minimal' | 'balanced' | 'premium';
  
  if (budget < 0.01) costBudget = 'minimal';
  else if (budget < 0.10) costBudget = 'balanced';
  else costBudget = 'premium';
  
  const result = await wai.execute({
    task,
    requirements: {
      costBudget,
      qualityLevel: costBudget === 'minimal' ? 'standard' : 'professional',
    },
  });
  
  console.log(`Task completed. Cost: $${result.cost}`);
  return result;
}
```

---

## 🔧 Advanced Configuration

### Custom Agent Bundles

```typescript
const wai = new WAIOrchestration({
  providers: {...},
  agentBundles: {
    // Custom bundle for your use case
    'ecommerce_analysis': {
      core: ['market_researcher', 'data_analyst'],
      geminiflow: ['customer_segmenter', 'pricing_strategist'],
      specialized: ['ecommerce_specialist'],
    },
  },
});

// Use custom bundle
const result = await wai.execute({
  task: 'Analyze ecommerce metrics',
  studioType: 'ecommerce_analysis',
});
```

### Provider Priority

```typescript
const wai = new WAIOrchestration({
  providers: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  },
  providerPriority: [
    'anthropic', // Try Anthropic first
    'openai',    // Fallback to OpenAI
  ],
  fallbackLevels: 5,
});
```

### Context Management

```typescript
const result = await wai.execute({
  task: 'Analyze with context',
  context: {
    projectId: 'proj_123',
    sessionId: 'sess_456',
    previousInteractions: [...],
    domainKnowledge: {...},
    userPreferences: {...},
  },
});
```

---

## 🔒 Security Best Practices

### API Key Rotation

```typescript
class SecureWAI {
  private wai: WAIOrchestration;
  
  constructor() {
    this.wai = new WAIOrchestration({...});
    this.scheduleKeyRotation();
  }
  
  private scheduleKeyRotation() {
    setInterval(() => {
      // Fetch new keys from secure vault
      const newKeys = this.fetchKeysFromVault();
      
      // Reinitialize with new keys
      this.wai = new WAIOrchestration({
        providers: newKeys,
      });
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }
  
  async execute(request: any) {
    return this.wai.execute(request);
  }
}
```

### Request Validation

```typescript
import { z } from 'zod';

const OrchestrationRequestSchema = z.object({
  task: z.string().min(10).max(5000),
  type: z.enum(['analysis', 'creative', 'development']),
  inputs: z.record(z.any()),
});

app.post('/api/wai/execute', async (req, res) => {
  try {
    const validated = OrchestrationRequestSchema.parse(req.body);
    const result = await wai.execute(validated);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});
```

### Rate Limiting per User

```typescript
import rateLimit from 'express-rate-limit';

const createUserLimiter = (userId: string) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: async (req) => {
      const user = await db.users.findOne({ id: userId });
      return user.tier === 'premium' ? 1000 : 100;
    },
    keyGenerator: () => userId,
  });
};
```

---

## 🧪 Testing Integration

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { WAIOrchestration } from '@/wai-sdk';

describe('WAI Integration', () => {
  it('should execute orchestration', async () => {
    const wai = new WAIOrchestration({
      providers: {
        openai: 'test-key',
      },
      mockMode: true, // Use mock responses for testing
    });
    
    const result = await wai.execute({
      task: 'Test task',
      type: 'analysis',
    });
    
    expect(result.status).toBe('success');
  });
});
```

### Integration Tests

```typescript
import { createTestWAI } from '@/wai-sdk/testing';

describe('WAI Integration Tests', () => {
  const testWAI = createTestWAI({
    deterministicMode: true,
    clockSeed: 'test-seed-123',
  });
  
  it('should produce deterministic results', async () => {
    const result1 = await testWAI.execute({...});
    const result2 = await testWAI.execute({...});
    
    expect(result1).toEqual(result2);
  });
});
```

---

## 📊 Monitoring & Observability

### Health Checks

```typescript
app.get('/health/wai', async (req, res) => {
  const health = await wai.getSystemHealth();
  
  res.json({
    status: health.status,
    providers: health.providers.map(p => ({
      name: p.name,
      status: p.status,
      responseTime: p.responseTime,
    })),
    agents: health.agentCount,
  });
});
```

### Metrics Collection

```typescript
import { metrics } from '@/lib/monitoring';

async function executeWithMetrics(request: any) {
  const startTime = Date.now();
  
  try {
    const result = await wai.execute(request);
    
    metrics.record('wai.execution.success', {
      duration: Date.now() - startTime,
      cost: result.cost,
      provider: result.providersUsed[0],
    });
    
    return result;
  } catch (error) {
    metrics.record('wai.execution.failure', {
      duration: Date.now() - startTime,
      error: error.message,
    });
    throw error;
  }
}
```

### Logging

```typescript
import { logger } from '@/lib/logger';

wai.on('request.started', (event) => {
  logger.info('WAI orchestration started', {
    requestId: event.id,
    task: event.task,
    agents: event.agents,
  });
});

wai.on('request.completed', (event) => {
  logger.info('WAI orchestration completed', {
    requestId: event.id,
    duration: event.duration,
    cost: event.cost,
  });
});
```

---

## 🚨 Troubleshooting

### Issue: Provider Authentication Fails

**Solution:**
```typescript
// Test provider connectivity
const health = await wai.getSystemHealth();
console.log(health.providers);

// Manually test provider
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const test = await openaiClient.chat.completions.create({...});
```

### Issue: Streaming Not Working

**Solution:**
```typescript
// Ensure AG-UI service is singleton
import { sharedAGUIService } from '@/wai-sdk';

// Use shared instance
const wai = new WAIOrchestration({
  aguiService: sharedAGUIService, // Use shared instance
});
```

### Issue: High Costs

**Solution:**
```typescript
// Enable cost optimization
const result = await wai.execute({
  requirements: {
    costBudget: 'minimal',
    responseTime: 'economical',
  },
});

// Monitor costs
console.log(`Cost: $${result.cost}`);
```

---

## 📦 Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys securely stored (vault/secrets manager)
- [ ] Rate limiting implemented
- [ ] Health checks configured
- [ ] Monitoring & logging set up
- [ ] Error handling implemented
- [ ] Cost tracking enabled
- [ ] Security review completed
- [ ] Load testing performed
- [ ] Documentation updated

---

## 🎓 Next Steps

1. **Explore Examples** - Check `/examples` directory for working code
2. **Read API Reference** - See `API_REFERENCE.md` for detailed docs
3. **Join Community** - Discord: https://discord.gg/wai-sdk
4. **Get Support** - Email: support@wizards.ai

---

## 📝 Checklist for Your Integration

### Phase 1: Setup (Day 1)
- [ ] Copy WAI SDK to your project
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Test basic execution

### Phase 2: Integration (Day 2-3)
- [ ] Choose integration architecture
- [ ] Implement in your codebase
- [ ] Add error handling
- [ ] Add logging/monitoring

### Phase 3: Testing (Day 4-5)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Cost analysis

### Phase 4: Production (Day 6-7)
- [ ] Security review
- [ ] Deploy to staging
- [ ] Load testing
- [ ] Deploy to production

---

**Ready to build with WAI SDK? Start with the examples!** 🚀
