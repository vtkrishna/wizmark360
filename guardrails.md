# Market360 Development Guardrails

## 1. WAI SDK as Single Source of Truth
- All agent orchestration MUST use WAI SDK core modules
- Never duplicate agent logic outside of the WAI SDK structure
- Reference `shared/schema.ts` for all database operations
- Use existing orchestration patterns from `orchestration/` directory
- Agent definitions come from `agents/` directory

## 2. Code Quality Standards
- NO mockups or placeholder data in production code
- NO incomplete tasks - every feature must be fully functional
- NO duplicate files - always check existing code before creating
- Full implementations only - no "TODO" comments without immediate resolution
- All API endpoints must have proper error handling

## 3. Best Coding Practices
- TypeScript strict mode for all new code
- Proper typing - no `any` types unless absolutely necessary
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- Maximum file length: 500 lines (split into modules if larger)
- Use existing utilities from `utils/` before creating new ones

## 4. End-to-End Testing
- Every feature must be tested before marking complete
- API endpoints: test with curl/fetch
- UI components: visual verification via screenshot
- Database operations: verify data integrity
- Agent tasks: confirm orchestration flow

## 5. Frontend-Backend-Agent Wiring
- All UI actions must connect to API endpoints
- API endpoints must trigger appropriate agents
- Agent results must flow back to UI
- Use proper state management (React Query/Zustand)
- WebSocket for real-time agent status updates

## 6. Architecture Compliance
- Follow microservices pattern for verticals
- Keep vertical logic separate but orchestration unified
- Use MCP for all external platform integrations
- A2A protocol for inter-agent communication
- ROMA levels for autonomy control

## 7. Code Study Before Changes
- Read existing files before making modifications
- Search codebase for similar functionality
- Check imports and dependencies
- Review related components
- Understand the data flow

## 8. Memory & Context Management
- Use mem0 for long-term memory storage
- Context windows managed by WAI SDK
- Agent memory persists in vector database
- Brand/campaign context stored in PostgreSQL
- Session state in Redis (when available)

## 9. User Experience Standards
- Simple onboarding for consumers
- Easy 3rd party platform connections
- Clear feedback on agent actions
- Progress indicators for long operations
- Error messages in plain language

## 10. Cost Optimization
- Use appropriate LLM for each task tier
- Claude for high-fidelity (coding, analysis)
- GPT-4o-mini for simple conversational tasks
- Gemini Flash for bulk processing
- Groq for low-latency requirements
- Cache LLM responses when appropriate
- Batch API calls where possible

## Development Workflow
1. Check existing code for similar functionality
2. Plan implementation aligned with guardrails
3. Implement with full functionality
4. Test end-to-end
5. Update project-tracker.md
6. Review with architect tool

## File Organization
```
client/src/
  pages/         - Page components (one per route)
  components/    - Reusable UI components
  lib/           - Utilities and helpers
  hooks/         - Custom React hooks

server/
  routes/        - API route handlers
  services/      - Business logic
  integrations/  - External service connectors

shared/
  schema.ts      - Database schema (single file)
  types.ts       - Shared TypeScript types
```

## Prohibited Actions
- DO NOT create new database migration files manually
- DO NOT modify core WAI SDK protocols without review
- DO NOT use placeholder/mock data in user-facing code
- DO NOT duplicate existing agent definitions
- DO NOT skip testing before completion
