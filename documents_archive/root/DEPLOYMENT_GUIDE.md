# WAI SDK Platform - Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)

## Local Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- npm or pnpm
- Git

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-org/wai-sdk-platform.git
cd wai-sdk-platform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start
```

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "wai-sdk" -- start

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t wai-sdk-platform:latest .
```

### Run with Docker

```bash
docker run -d \
  --name wai-sdk \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e OPENAI_API_KEY="sk-..." \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  wai-sdk-platform:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  wai-sdk:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/wai_sdk
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=wai_sdk
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Cloud Deployment

### Replit Deployment
1. Import project to Replit
2. Configure Secrets in Replit dashboard
3. Click "Deploy" button
4. Configure custom domain (optional)

### Vercel/Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

### AWS/GCP/Azure
1. Set up VM or container service
2. Configure load balancer
3. Set up managed PostgreSQL
4. Deploy application

## Environment Configuration

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Core AI Providers (minimum required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Additional Providers (optional but recommended)
GROQ_API_KEY=...
DEEPSEEK_API_KEY=...
TOGETHER_API_KEY=...

# Security
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# Optional
SENTRY_DSN=...
REDIS_URL=...
```

### Security Best Practices
- Never commit .env files
- Use secrets management (Vault, AWS Secrets Manager)
- Rotate API keys regularly
- Use strong, unique secrets

## Database Setup

### Create Database

```sql
CREATE DATABASE wai_sdk;
CREATE USER wai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wai_sdk TO wai_user;
```

### Run Migrations

```bash
npm run db:push
```

### Backup Strategy

```bash
# Daily backup
pg_dump wai_sdk > backup_$(date +%Y%m%d).sql

# Restore
psql wai_sdk < backup.sql
```

## Monitoring & Logging

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/v10` - Detailed health with metrics

### Logging
- Application logs: stdout/stderr
- Structured JSON logging in production
- Sentry integration for error tracking

### Metrics
- Request latency
- Agent execution times
- LLM provider health
- Database connection pool

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network/firewall

2. **API keys not working**
   - Verify key format
   - Check provider account status
   - Test with curl

3. **High memory usage**
   - Increase Node.js memory limit
   - Check for memory leaks
   - Optimize agent loading

## Support

For deployment support, contact: support@wizards.ai
