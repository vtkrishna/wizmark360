# WAI SDK - Quick Start Guide

Get started with WAI SDK in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys for at least one LLM provider (OpenAI, Anthropic, or Google)

## Step 1: Installation

```bash
npm install @wizards-ai/wai-sdk
```

Or with yarn:

```bash
yarn add @wizards-ai/wai-sdk
```

## Step 2: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Required: At least one provider
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_google_key_here

# Optional
PERPLEXITY_API_KEY=your_perplexity_key
XAI_API_KEY=your_xai_key
```

## Step 3: Create Your First Orchestration

Create `index.ts`:

```typescript
import { OrchestrationFacade } from '@wizards-ai/wai-sdk';

async function main() {
  // Initialize the facade
  const facade = new OrchestrationFacade({
    studioId: 'my-first-app',
    enableMonitoring: true,
    enableRetries: true,
  });

  // Execute a workflow
  const result = await facade.executeWorkflow('content-generation', {
    prompt: 'Explain what WAI SDK is in one paragraph',
    maxTokens: 150,
  }, {
    type: 'creative',
    priority: 'normal',
    costOptimization: true,
  });

  console.log('Result:', result.result);
  console.log('Cost: $' + (result.metadata?.cost || 0).toFixed(4));
  console.log('Model:', result.metadata?.model);
}

main().catch(console.error);
```

## Step 4: Run Your Application

```bash
npx tsx index.ts
```

Expected output:

```
Result: WAI SDK is an enterprise-grade AI orchestration platform...
Cost: $0.0012
Model: gpt-4o-mini
```

## Step 5: Explore Advanced Features

### Use Specific Providers

```typescript
const result = await facade.executeWorkflow('code-generation', {
  prompt: 'Create a TypeScript function to validate email addresses',
}, {
  type: 'development',
  preferredProviders: ['anthropic'], // Use Claude
});
```

### Add Custom Plugins

```typescript
import { UnifiedRoutingRegistry } from '@wizards-ai/wai-sdk';

const registry = new UnifiedRoutingRegistry();

registry.registerPlugin('my-plugin', {
  id: 'custom-logger',
  name: 'Custom Logger',
  description: 'Logs all requests',
  onPreOrchestration: async (request, context) => {
    console.log('Processing request:', context.requestId);
    return request;
  },
}, {
  priority: 100,
  enabled: true,
});
```

### Multi-Agent Workflows

```typescript
const result = await facade.executeWorkflow('product-validation', {
  productIdea: 'AI-powered recipe generator',
  targetMarket: 'home cooks',
}, {
  type: 'hybrid',
  priority: 'high',
  // SDK automatically coordinates multiple agents
});
```

## Next Steps

1. **Read the Documentation**: [Full API Reference](./README.md)
2. **Explore Examples**: Check the `examples/` directory
3. **Try Different Providers**: Test OpenAI, Anthropic, Google
4. **Build Custom Plugins**: Extend orchestration capabilities
5. **Monitor Performance**: Use CAM 2.0 monitoring features

## Common Issues

### Missing API Keys

**Error**: `Missing required API key`

**Solution**: Ensure at least one provider API key is set in `.env`

### TypeScript Errors

**Error**: `Cannot find module '@wizards-ai/wai-sdk'`

**Solution**: Install types and ensure TypeScript config is correct:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

### Import Errors

**Error**: `Named export 'OrchestrationFacade' not found`

**Solution**: Use named imports:

```typescript
import { OrchestrationFacade } from '@wizards-ai/wai-sdk';
```

## Getting Help

- **Documentation**: [README.md](./README.md)
- **Examples**: `examples/` directory
- **Issues**: [GitHub Issues](https://github.com/wizards-ai/wai-sdk/issues)
- **Discord**: [Join our community](https://discord.gg/wizards-ai)

## What's Next?

Ready to build production-scale AI applications? Explore:

- **Agent Coordination** - Multi-agent workflows
- **Cost Optimization** - Smart provider selection
- **Real-time Streaming** - AG-UI protocol integration
- **Custom Workflows** - Build domain-specific orchestration

Happy building with WAI SDK! 🚀
