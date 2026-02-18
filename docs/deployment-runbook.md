# WizMark 360 - Production Deployment Runbook

## Deployment Options

### Option 1: Replit Autoscale (Recommended)

Replit's autoscale deployment is the primary deployment target. It handles scaling, SSL, and infrastructure automatically.

#### Prerequisites
- All environment secrets configured in Replit Secrets tab
- Database provisioned (Replit PostgreSQL)
- Object Storage bucket created
- Build passes: `npm run build`

#### Deployment Steps

1. **Verify Build**
   ```bash
   npm run build
   ```

2. **Verify Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Deploy via Replit UI**
   - Click "Publish" button in Replit
   - Deployment type: **Autoscale**
   - Build command: `npm run build`
   - Run command: `node dist/index.js`
   - Port: 5000

4. **Post-Deploy Verification**
   ```bash
   curl https://YOUR_PUBLISHED_URL/api/health
   ```

#### Scaling Configuration
- Autoscale handles scaling automatically based on request volume
- Minimum instances: 1 (always-on for autoscale)
- Database connections pooled via Neon PostgreSQL

#### Custom Domain
- Configure in Replit's deployment settings
- SSL certificate provisioned automatically

---

### Option 2: AWS Deployment (Fallback)

For organizations requiring AWS hosting, WizMark 360 can be deployed on AWS using Docker containers.

#### Architecture

```
Route 53 (DNS)
    → CloudFront (CDN + SSL)
        → ALB (Application Load Balancer)
            → ECS Fargate (Node.js containers)
                → RDS PostgreSQL (database)
                → S3 (object storage)
```

#### Prerequisites
- AWS account with appropriate IAM permissions
- Docker installed locally
- AWS CLI configured
- RDS PostgreSQL instance provisioned
- S3 bucket for object storage

#### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

#### ECS Task Definition (Key Settings)
- Memory: 1024 MB (minimum), 2048 MB (recommended)
- CPU: 512 (0.5 vCPU minimum), 1024 (1 vCPU recommended)
- Health check: `GET /api/health` (path), 30s interval, 5 retries
- Port: 5000

#### Environment Variables for AWS
All environment variables from the Environment Matrix (see ci-cd-pipeline.md) plus:
- `DATABASE_URL`: RDS PostgreSQL connection string
- `SESSION_SECRET`: Strong random string (use AWS Secrets Manager)
- `NODE_ENV`: `production`
- `PORT`: `5000`

#### Security Groups
- ALB: Inbound 80/443 from 0.0.0.0/0
- ECS Tasks: Inbound 5000 from ALB security group only
- RDS: Inbound 5432 from ECS task security group only

#### Monitoring
- CloudWatch Logs for container output
- CloudWatch Alarms for:
  - CPU > 80% for 5 minutes
  - Memory > 85% for 5 minutes
  - 5xx error rate > 1% for 5 minutes
  - Health check failures > 3 consecutive

---

## Monitoring & Observability

### Health Check Endpoints
| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/health` | None | Basic health with DB, LLM, storage checks |
| `GET /api/smoke-test` | Admin | Comprehensive 6-point smoke test |

### Key Metrics to Monitor
1. **Server**: Response time, error rate, request count
2. **Database**: Connection pool usage, query latency
3. **LLM**: Token usage, API latency, error rate
4. **Object Storage**: Upload success rate, storage usage

### Log Levels
- `[ERROR]` - Application errors requiring attention
- `[WARNING]` - Non-critical issues
- `[INFO]` - Standard operations
- Structured JSON logging in production

---

## Rollback Procedures

### Replit Rollback
1. Use Replit's Checkpoints feature to restore previous deployment state
2. Checkpoints include code, database, and configuration

### AWS Rollback
1. ECS: Roll back to previous task definition revision
2. Database: Restore from RDS automated backup (up to 35 days retention)
3. Code: Revert to previous Git tag and redeploy

### Emergency Procedures
1. **Database corruption**: Restore from latest Replit checkpoint or RDS backup
2. **LLM provider outage**: System auto-falls back to alternative providers via Smart Router
3. **Storage outage**: File uploads temporarily disabled; existing content cached
4. **Complete outage**: Switch DNS to maintenance page, investigate root cause

---

## Production Hardening Checklist

- [x] Session secret unique per environment
- [x] Rate limiting enabled (200/min general, 30/min AI, 10/min voice)
- [x] CORS configured for production domains
- [x] Helmet security headers enabled
- [x] Auth middleware on all API routes (except health/auth)
- [x] Admin-only access for LLM settings and smoke tests
- [x] Database connection pooling
- [x] Environment validation on startup
- [x] Comprehensive health check endpoint
- [x] Audit logging middleware
- [ ] Automated database backups (Replit handles via Neon)
- [ ] Error alerting integration (Sentry/PagerDuty)
- [ ] CDN for static assets (Replit handles automatically)
