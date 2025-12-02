# WAI SDK Orchestration Platform v1.0

## Overview

WAI SDK (Wizards AI Intelligence) is an enterprise-grade AI orchestration platform designed for autonomous multi-agent coordination, supporting 23+ LLM providers and 752+ models with multimodal capabilities.

## Key Features

- **267+ Autonomous Agents** across 6 tiers (Executive, Development, Creative, QA, DevOps, Domain)
- **23+ LLM Providers** with automatic failover and cost optimization
- **530+ MCP Production Tools** across 26 categories
- **7 Protocols** (A2A, BMAD 2.0, Parlant, ROMA L1-L4, AG-UI, MCP)
- **KIMI K2 Integration** for 90% cost savings
- **Quantum Security Framework** with post-quantum cryptography

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables Required

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
TOGETHER_API_KEY=...
DEEPSEEK_API_KEY=...
SARVAM_API_KEY=...
SESSION_SECRET=...
JWT_SECRET=...
```

## Architecture

```
wai-sdk-platform/
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page routes
│       ├── hooks/        # Custom hooks
│       └── lib/          # Utilities
├── server/               # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── agents/           # AI agents
│   ├── orchestration/    # Core orchestration
│   └── middleware/       # Express middleware
├── shared/               # Shared types/schemas
└── docs/                 # Documentation
```

## API Endpoints

### Core APIs
- `GET /api/health` - Health check with agent counts
- `GET /api/agents` - List all 267 agents
- `GET /api/providers` - LLM provider status
- `GET /api/mcp/tools` - 530+ MCP tools

### Orchestration APIs
- `POST /api/orchestrate` - Execute agent tasks
- `POST /api/agents/:id/execute` - Run specific agent
- `GET /api/orchestration/status` - Orchestration metrics

## Agent Tiers

| Tier | Count | Description |
|------|-------|-------------|
| Executive | 34 | Strategic planning, decision-making |
| Development | 160 | Coding, architecture, debugging |
| Creative | 17 | Content, design, copywriting |
| QA | 7 | Testing, quality assurance |
| DevOps | 11 | CI/CD, infrastructure |
| Domain | 38 | Industry-specific specialists |

## LLM Providers

- OpenAI (GPT-4, GPT-4o, o1)
- Anthropic (Claude 3.5 Sonnet, Opus)
- Google (Gemini 2.0, Flash)
- Groq (Llama 3.1 70B)
- DeepSeek (DeepSeek-V3)
- Together AI (Mixtral, Llama)
- KIMI K2 (1T parameters)
- OpenRouter (200+ models)
- And 15+ more...

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t wai-sdk-platform .
docker run -p 5000:5000 wai-sdk-platform
```

## License

MIT License - See LICENSE file

## Support

For support, contact: support@wizards.ai
