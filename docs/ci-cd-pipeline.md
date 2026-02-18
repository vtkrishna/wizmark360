# WizMark 360 - CI/CD Pipeline & Release Workflow

## Pipeline Overview

WizMark 360 uses a Git-based release workflow optimized for Replit's deployment platform with an optional AWS fallback path.

```
Developer Push → Build → Lint → Test → Smoke Tests → Deploy Preview → Production
```

## Pipeline Stages

### Stage 1: Build Validation

```bash
# Install dependencies
pnpm install --frozen-lockfile

# TypeScript compilation check
npx tsc --noEmit

# Build production bundle
npm run build
```

**Success criteria**: Zero TypeScript errors, Vite bundle completes without errors.

### Stage 2: Lint & Code Quality

```bash
# ESLint check (when configured)
npx eslint . --ext .ts,.tsx --max-warnings 0

# Check for console.log leaks in production code
grep -rn "console\.log" server/ --include="*.ts" | grep -v "index.minimal.ts" | grep -v "test" || true
```

### Stage 3: Database Migrations

```bash
# Push schema changes safely
npm run db:push

# Verify migration applied
npm run db:push -- --dry-run
```

**Safety rules**:
- Never change primary key column types (serial to varchar or vice versa)
- Always use `npm run db:push --force` if standard push fails
- Back up database before production migrations

### Stage 4: Smoke Tests

After deployment, run automated smoke tests against the live instance:

```bash
# Hit the smoke test endpoint (requires admin auth)
curl -s https://YOUR_DOMAIN/api/smoke-test \
  -H "Cookie: YOUR_SESSION_COOKIE" | jq .

# Or hit the health endpoint (no auth required)
curl -s https://YOUR_DOMAIN/api/health | jq .
```

**Smoke test checks**:
1. Database connectivity
2. Auth endpoints responding
3. Brands API functional
4. Health endpoint healthy
5. Monitoring KPIs loading
6. Object storage configured

### Stage 5: Deploy to Production

**Replit Deployment (Primary)**:
```bash
# Build
npm run build

# Deploy via Replit UI
# Click "Publish" → Autoscale deployment
# Run command: node dist/index.js
```

**AWS Deployment (Fallback)**:
See `docs/deployment-runbook.md` for detailed AWS instructions.

## Environment Matrix

| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| DATABASE_URL | Auto (Replit) | Auto (Replit) or manual | Yes |
| SESSION_SECRET | `dev-secret` | Strong random string | Yes (prod) |
| OPENAI_API_KEY | Optional | Recommended | At least 1 LLM key |
| ANTHROPIC_API_KEY | Optional | Recommended | At least 1 LLM key |
| GEMINI_API_KEY | Optional | Recommended | At least 1 LLM key |
| GROQ_API_KEY | Optional | Optional | No |
| COHERE_API_KEY | Optional | Optional | No |
| SARVAM_API_KEY | Optional | Optional | No (for voice AI) |
| DEFAULT_OBJECT_STORAGE_BUCKET_ID | Auto (Replit) | Auto (Replit) | No |
| PRIVATE_OBJECT_DIR | Auto (Replit) | Auto (Replit) | No |
| PUBLIC_OBJECT_SEARCH_PATHS | Auto (Replit) | Auto (Replit) | No |

## Release Tagging

```bash
# Tag a release
git tag -a v5.0.X -m "Release v5.0.X: description"

# Push tags
git push origin v5.0.X
```

## Rollback Procedure

1. **Replit**: Use the Checkpoints feature to rollback to a previous deployment
2. **Code rollback**: `git revert HEAD` or rollback to a specific tag
3. **Database rollback**: Use Replit's database rollback feature or restore from backup

## Pre-Release Checklist

- [ ] All TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations applied safely
- [ ] Health endpoint returns "healthy"
- [ ] Smoke tests pass (all 6 checks)
- [ ] At least one LLM provider configured and responding
- [ ] Object storage bucket accessible
- [ ] Session secret set (production)
- [ ] No hardcoded secrets in codebase
- [ ] `replit.md` updated with latest changes
