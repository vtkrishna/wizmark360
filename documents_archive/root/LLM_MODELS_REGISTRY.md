# WAI SDK LLM Model Registry

## Overview

The WAI SDK includes an automated LLM Model Registry that tracks and updates model metadata from 23+ LLM providers. This system ensures your application always has access to the latest models with accurate pricing and capability information.

## Features

- **Automatic Monthly Updates**: Cron job syncs models on the 1st of every month
- **506+ Models Tracked**: From 10+ providers including aggregators
- **Metadata Tracking**: Context windows, pricing, capabilities, deprecation status
- **Search & Filter**: Query by provider, capability, context window, cost
- **Zero-Downtime Updates**: Graceful upsert with conflict resolution

## Current Model Statistics

| Provider | Models | Last Updated |
|----------|--------|--------------|
| OpenRouter (Aggregator) | 343 | Auto-synced |
| OpenAI | 102 | Auto-synced |
| Cohere | 20 | Auto-synced |
| Groq | 20 | Auto-synced |
| Anthropic | 10 | Auto-synced |
| Google | 9 | Auto-synced |
| DeepSeek | 2 | Auto-synced |

**Total: 506+ models**

## API Endpoints

### Get Model Statistics
```bash
GET /api/llm-models/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "openai": 102,
    "anthropic": 10,
    "google": 9,
    "openrouter": 343,
    "cohere": 20,
    "groq": 20,
    "deepseek": 2
  },
  "updateStatus": {
    "isRunning": false,
    "lastUpdate": "2025-11-25T14:33:45.979Z",
    "nextScheduledUpdate": "0 0 1 * *"
  }
}
```

### Search Models
```bash
GET /api/llm-models/search?q=gpt-4&provider=openai&minContext=128000
```

Response:
```json
{
  "success": true,
  "count": 5,
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "openai",
      "contextWindow": 128000,
      "maxOutput": 16384,
      "inputCostPer1M": 2.50,
      "outputCostPer1M": 10.00,
      "capabilities": ["text-generation", "chat", "vision", "multimodal"]
    }
  ]
}
```

### Get Registry (All Models)
```bash
GET /api/llm-models/registry
GET /api/llm-models/registry?provider=anthropic
GET /api/llm-models/registry?deprecated=false
```

### Get Service Status
```bash
GET /api/llm-models/status
```

### Trigger Manual Update (Admin Only)
```bash
POST /api/llm-models/update
Authorization: Bearer <admin_token>
```

### Initial Setup Sync
```bash
POST /api/llm-models/initial-sync
```

## Database Schema

```sql
CREATE TABLE llm_model_registry (
  id SERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  context_window INTEGER NOT NULL,
  max_output_tokens INTEGER NOT NULL,
  input_cost_per_1m NUMERIC(10, 4) NOT NULL,
  output_cost_per_1m NUMERIC(10, 4) NOT NULL,
  capabilities JSONB DEFAULT '[]',
  release_date TEXT,
  deprecated BOOLEAN DEFAULT FALSE,
  version TEXT,
  last_updated TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint for model+provider
CREATE UNIQUE INDEX ON llm_model_registry(model_id, provider);
```

## Provider Configuration

The service automatically fetches from these provider APIs:

| Provider | Endpoint | Auth |
|----------|----------|------|
| OpenAI | `api.openai.com/v1/models` | Bearer Token |
| Anthropic | `api.anthropic.com/v1/models` | x-api-key |
| Google | `generativelanguage.googleapis.com/v1/models` | Query Param |
| Groq | `api.groq.com/openai/v1/models` | Bearer Token |
| Together AI | `api.together.xyz/v1/models` | Bearer Token |
| OpenRouter | `openrouter.ai/api/v1/models` | None (public) |
| Perplexity | `api.perplexity.ai/models` | Bearer Token |
| Cohere | `api.cohere.ai/v1/models` | Bearer Token |
| Replicate | `api.replicate.com/v1/models` | Bearer Token |
| DeepSeek | `api.deepseek.com/v1/models` | Bearer Token |

## Environment Variables

```bash
# Required for sync
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
GROQ_API_KEY=gsk_...
TOGETHER_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
COHERE_API_KEY=...
REPLICATE_API_KEY=r8_...
DEEPSEEK_API_KEY=sk-...
XAI_API_KEY=xai-...
```

## Usage in Code

```typescript
import { llmModelUpdater } from './services/llm-model-updater-service';

// Get all models
const models = await llmModelUpdater.getAllModels();

// Filter by provider
const openaiModels = await llmModelUpdater.getAllModels({ provider: 'openai' });

// Get statistics
const stats = await llmModelUpdater.getModelStats();

// Check update status
const status = llmModelUpdater.getStatus();

// Trigger manual update
const result = await llmModelUpdater.updateNow();
```

## Automatic Capability Detection

The service infers capabilities from model names:

| Pattern | Inferred Capabilities |
|---------|----------------------|
| `vision`, `multimodal` | `vision`, `multimodal` |
| `code`, `codex` | `code-generation` |
| `embed` | `embedding` |
| `chat`, `gpt`, `claude` | `text-generation`, `chat` |
| `reasoning`, `o1`, `o3` | `advanced-reasoning` |

## Best Practices

1. **Initial Setup**: Run `/api/llm-models/initial-sync` after deployment
2. **Cost Optimization**: Use `inputCostPer1M` for model selection
3. **Capability Matching**: Filter by capabilities for task-specific selection
4. **Deprecation Check**: Filter `deprecated=false` for production use
5. **Context Awareness**: Check `contextWindow` for long-context tasks

## Error Handling

The service gracefully handles:
- Missing API keys (skips provider)
- Rate limits (logs warning, continues)
- Network timeouts (10s timeout per provider)
- Invalid responses (skips malformed entries)

## Version History

- **v1.0.0** (Nov 2025): Initial release with 10 providers
- Auto-updates scheduled monthly on 1st at midnight UTC
