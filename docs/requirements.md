# WizMark 360 — Enterprise Production Requirements

## 1. Executive Summary

This document defines all requirements to deploy **WizMark 360** (Wizards360) into a production environment capable of serving **10,000+ concurrent users**. WizMark 360 is a full-stack AI Marketing Operating System with 285 autonomous agents, 24 LLM providers, 886+ models, 8 marketing verticals, 319 service modules, and 178 API routes.

Taking the platform live requires:
- **42+ API keys and credentials** across LLM providers, cloud services, business integrations, and social platforms
- **Enterprise-grade infrastructure** with multi-region compute, managed PostgreSQL, Redis caching, CDN, and load balancing
- **Security compliance** with SOC2, GDPR, and India's DPDP Act 2023
- **Monitoring and observability** stack for real-time alerting, APM, and cost tracking
- **CI/CD pipeline** for zero-downtime deployments

---

## 2. API Keys & Credentials Required

### 2.1 LLM Providers (16 Keys)

| # | Environment Variable | Provider | Description | Tier |
|---|---------------------|----------|-------------|------|
| 1 | `OPENAI_API_KEY` | OpenAI | GPT-5.2, GPT-4.1, o3, o4-mini, DALL-E 3, Whisper, TTS | Tier 1 — Premium |
| 2 | `ANTHROPIC_API_KEY` | Anthropic | Claude Opus 4.6, Sonnet 5.0, Haiku 4.5 — primary for WizMark Intelligence Suite | Tier 1 — Premium |
| 3 | `GEMINI_API_KEY` | Google | Gemini 3 Pro/Flash, 2.5 Pro/Flash — multimodal, grounding, 2M context | Tier 1 — Premium |
| 4 | `GROQ_API_KEY` | Groq | Llama 3.3-70B, Mixtral — sub-second inference for real-time responses | Tier 2 — Professional |
| 5 | `COHERE_API_KEY` | Cohere | Command R+ — specialized for RAG, embeddings, reranking | Tier 2 — Professional |
| 6 | `SARVAM_API_KEY` | Sarvam AI | Sarvam-2B, Saarika v3 (STT), Bulbul v2 (TTS) — 22 Indian languages | Tier 4 — Specialized |
| 7 | `TOGETHER_API_KEY` | Together AI | Open-source model hosting — Llama, Mixtral, CodeLlama | Tier 3 — Cost-Effective |
| 8 | `OPENROUTER_API_KEY` | OpenRouter | 400+ model aggregator — unified API for multi-provider routing | Tier 4 — Specialized |
| 9 | `ZHIPU_API_KEY` | Zhipu AI | GLM-4 — Chinese language and bilingual capabilities | Tier 4 — Specialized |
| 10 | `DEEPSEEK_API_KEY` | DeepSeek | DeepSeek V3 — cost-effective reasoning (90% savings vs GPT-4) | Tier 2 — Professional |
| 11 | `MISTRAL_API_KEY` | Mistral | Mistral Large, Codestral — European AI, strong code generation | Tier 2 — Professional |
| 12 | `PERPLEXITY_API_KEY` | Perplexity | pplx-70b — real-time web search and grounded responses | Tier 2 — Professional |
| 13 | `XAI_API_KEY` | xAI | Grok-2 — real-time information, social media analysis | Tier 4 — Specialized |
| 14 | `FIREWORKS_API_KEY` | Fireworks AI | Fast inference hosting for open-source models | Tier 3 — Cost-Effective |
| 15 | `REPLICATE_API_TOKEN` | Replicate | Image/video model hosting — Stable Diffusion, custom models | Tier 3 — Cost-Effective |
| 16 | `HUGGINGFACE_API_KEY` | HuggingFace | Open-source model inference — specialized and fine-tuned models | Tier 3 — Cost-Effective |

### 2.2 Cloud Providers (5 Keys)

| # | Environment Variable | Provider | Description |
|---|---------------------|----------|-------------|
| 17 | `AWS_ACCESS_KEY_ID` | AWS | IAM access key for S3, Bedrock, SES, CloudFront |
| 18 | `AWS_SECRET_ACCESS_KEY` | AWS | IAM secret key (pair with access key) |
| 19 | `AZURE_OPENAI_KEY` | Microsoft Azure | Azure OpenAI Service API key |
| 20 | `AZURE_OPENAI_ENDPOINT` | Microsoft Azure | Azure OpenAI deployment endpoint URL |
| 21 | `GOOGLE_VERTEX_KEY` | Google Cloud | Vertex AI service account key for enterprise Gemini |

### 2.3 Business Integrations (6 Keys)

| # | Environment Variable | Provider | Description |
|---|---------------------|----------|-------------|
| 22 | `RAZORPAY_KEY_ID` | Razorpay | Payment gateway key — UPI, cards, net banking |
| 23 | `RAZORPAY_KEY_SECRET` | Razorpay | Payment gateway secret — GST/IGST compliant invoicing |
| 24 | `META_WHATSAPP_TOKEN` | Meta | WhatsApp Business API permanent access token |
| 25 | `SALESFORCE_CLIENT_ID` | Salesforce | Connected App OAuth client ID |
| 26 | `SALESFORCE_CLIENT_SECRET` | Salesforce | Connected App OAuth client secret |
| 27 | `HUBSPOT_API_KEY` | HubSpot | Private app API key for CRM sync |

### 2.4 Social Media Platforms (10 Keys)

| # | Environment Variable | Provider | Description |
|---|---------------------|----------|-------------|
| 28 | `META_APP_ID` | Meta (Facebook/Instagram) | App ID for OAuth, Ads API, Graph API |
| 29 | `META_APP_SECRET` | Meta (Facebook/Instagram) | App secret for server-side OAuth |
| 30 | `LINKEDIN_CLIENT_ID` | LinkedIn | OAuth application client ID |
| 31 | `LINKEDIN_CLIENT_SECRET` | LinkedIn | OAuth application client secret |
| 32 | `TWITTER_API_KEY` | Twitter/X | API key for posting, analytics, social listening |
| 33 | `TWITTER_API_SECRET` | Twitter/X | API secret for OAuth 2.0 PKCE flow |
| 34 | `TIKTOK_CLIENT_KEY` | TikTok | Marketing API client key |
| 35 | `TIKTOK_CLIENT_SECRET` | TikTok | Marketing API client secret |
| 36 | `PINTEREST_APP_ID` | Pinterest | App ID for Ads API and content publishing |
| 37 | `PINTEREST_APP_SECRET` | Pinterest | App secret for server-side authentication |

### 2.5 Search APIs (2 Keys)

| # | Environment Variable | Provider | Description |
|---|---------------------|----------|-------------|
| 38 | `GOOGLE_SEARCH_API_KEY` | Google | Custom Search JSON API for web search service |
| 39 | `BING_SEARCH_API_KEY` | Microsoft | Bing Web Search API v7 for fallback search |

### 2.6 Other Services (4 Keys)

| # | Environment Variable | Provider | Description |
|---|---------------------|----------|-------------|
| 40 | `SMTP_HOST` | Email provider | SMTP server hostname (e.g., smtp.sendgrid.net) |
| 41 | `SMTP_USER` | Email provider | SMTP authentication username |
| 42 | `SMTP_PASSWORD` | Email provider | SMTP authentication password |
| 43 | `SESSION_SECRET` | Internal | Express session encryption key (min 64 characters, random) |

> **Note**: `SARVAM_API_KEY` (#6) serves both LLM text and voice (STT/TTS) capabilities — no separate voice key required.

---

## 3. Infrastructure Requirements

### 3.1 Compute — Application Servers (10K Users)

| Component | Specification | Notes |
|-----------|--------------|-------|
| **Nodes** | 4–6 application server instances | Horizontal auto-scaling |
| **CPU** | 4 vCPU per node (16–24 total) | ARM64 preferred for cost efficiency |
| **RAM** | 8 GB per node (32–48 GB total) | Agent orchestration is memory-intensive |
| **Storage** | 100 GB SSD per node | Logs, temp files, local cache |
| **OS** | Ubuntu 22.04 LTS or Amazon Linux 2023 | Node.js 20 LTS runtime |
| **Container Runtime** | Docker 24+ with Docker Compose | Or Kubernetes (EKS/GKE/AKS) |

### 3.2 Database — PostgreSQL

| Component | Specification | Notes |
|-----------|--------------|-------|
| **Engine** | PostgreSQL 16+ | With pgvector extension for embeddings |
| **Instance** | 8 vCPU, 32 GB RAM | Dedicated DB instance |
| **Storage** | 500 GB SSD (provisioned IOPS) | ~50 GB/year growth for 10K users |
| **Connections** | PgBouncer connection pooling | Max 200 connections, pool size 50 |
| **Replication** | 1 read replica (same region) | For analytics queries and reporting |
| **Backups** | Automated daily snapshots | 30-day retention, PITR enabled |
| **Extensions** | pgvector, pg_trgm, uuid-ossp | Required for vector search, fuzzy matching |

### 3.3 Caching Layer — Redis

| Component | Specification | Notes |
|-----------|--------------|-------|
| **Engine** | Redis 7+ (or Valkey) | ElastiCache / Memorystore / Azure Cache |
| **Instance** | 2 vCPU, 8 GB RAM | Session store, rate limiting, caching |
| **Eviction** | allkeys-lru | Auto-evict least recently used |
| **Persistence** | AOF enabled | Crash recovery for sessions |
| **Use Cases** | Sessions, LLM response cache, rate limits, job queues | |

### 3.4 CDN & Static Assets

| Component | Specification | Notes |
|-----------|--------------|-------|
| **CDN Provider** | CloudFront / Cloud CDN / Azure CDN | Global edge distribution |
| **Origin** | S3 / Cloud Storage / Blob Storage | Static assets, generated content |
| **Cache TTL** | 1 hour for assets, no-cache for API | Proper cache-control headers |
| **Compression** | Brotli + Gzip | Automatic content encoding |
| **SSL** | TLS 1.3, HSTS enabled | Minimum TLS 1.2 |

### 3.5 SSL/TLS Certificates

| Component | Specification |
|-----------|--------------|
| **Primary Domain** | Wildcard certificate (*.wizmark360.com) |
| **Certificate Authority** | AWS ACM / Let's Encrypt / DigiCert |
| **Protocol** | TLS 1.2 minimum, TLS 1.3 preferred |
| **HSTS** | Enabled with 1-year max-age, includeSubdomains |
| **Certificate Renewal** | Automated (ACM auto-renewal or certbot) |

### 3.6 Load Balancing

| Component | Specification | Notes |
|-----------|--------------|-------|
| **Type** | Application Load Balancer (Layer 7) | Path-based routing |
| **Health Checks** | HTTP GET `/api/health` every 30s | 3 consecutive failures = unhealthy |
| **Session Affinity** | Sticky sessions (cookie-based) | For WebSocket connections |
| **SSL Termination** | At load balancer | Offload TLS processing |
| **Rate Limiting** | 100 req/s per IP, 1000 req/s per tenant | WAF integration |

---

## 4. Security Requirements

### 4.1 SOC2 Type II

| Control Area | Requirement | Implementation |
|-------------|-------------|----------------|
| Access Control | MFA for all admin users | TOTP + backup codes |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit | AWS KMS / Cloud KMS |
| Audit Logging | All user and system actions logged | Structured JSON logs with 90-day retention |
| Incident Response | Documented IR plan with <1hr response | PagerDuty/Opsgenie integration |
| Change Management | All changes via PR with review | GitHub Actions CI/CD with approval gates |
| Vendor Management | Third-party risk assessments | Annual vendor security reviews |

### 4.2 GDPR (EU Users)

| Requirement | Implementation |
|-------------|----------------|
| Data Processing Agreement (DPA) | Signed DPAs with all sub-processors (LLM providers, cloud providers) |
| Right to Erasure | Automated account deletion pipeline with 30-day grace |
| Data Portability | JSON/CSV export of all user data via API |
| Consent Management | Granular opt-in/opt-out with version tracking |
| Data Minimization | Collect only required data, auto-delete after retention period |
| Privacy Impact Assessment | Completed for each vertical and LLM integration |
| DPO Appointment | Designated Data Protection Officer |

### 4.3 India DPDP Act 2023

| Requirement | Implementation |
|-------------|----------------|
| Notice & Consent | Clear, purpose-specific consent collection in 22 languages |
| Data Fiduciary Obligations | Registered as Significant Data Fiduciary (if applicable) |
| Cross-Border Transfer | Adequacy assessment for data leaving India |
| Data Principal Rights | Access, correction, erasure, grievance redressal |
| Data Breach Notification | 72-hour notification to Data Protection Board of India |
| Children's Data | Age verification, parental consent mechanisms |
| Retention Limits | Purpose-linked retention with automatic deletion |
| Grievance Officer | Appointed with published contact details |

### 4.4 Quantum Security Framework

WizMark 360 implements a forward-looking Quantum Security Framework to protect against both current and future cryptographic threats.

| Requirement | Implementation | Notes |
|-------------|----------------|-------|
| **Post-Quantum Cryptography** | CRYSTALS-Kyber (key encapsulation) and CRYSTALS-Dilithium (digital signatures) | NIST PQC standards compliant |
| **Quantum Key Distribution (QKD)** | QKD-ready key exchange protocols for enterprise deployments | Hybrid classical/quantum key exchange |
| **Zero-Knowledge Proofs** | zk-SNARKs for privacy-preserving authentication and data verification | User data verification without exposure |
| **Quantum Random Number Generation (QRNG)** | Hardware QRNG integration for cryptographic key generation | True randomness for key material |
| **Hybrid Encryption** | Dual classical + post-quantum encryption during transition period | Backward compatibility maintained |
| **Key Rotation** | Automated quantum-safe key rotation with configurable intervals | 90-day default rotation cycle |
| **Compliance** | Aligned with NIST SP 800-208 and ETSI QKD standards | Future-proof regulatory compliance |

---

## 5. Monitoring & Observability

### 5.1 Logging

| Component | Tool | Configuration |
|-----------|------|--------------|
| Application Logs | Structured JSON (Winston/Pino) | Severity levels: ERROR, WARN, INFO, DEBUG |
| Access Logs | ALB access logs | S3 storage with 90-day retention |
| LLM Request Logs | Custom middleware | Token counts, latency, cost, provider, model |
| Audit Logs | Database-backed | User actions, configuration changes, admin operations |
| Log Aggregation | CloudWatch Logs / Datadog / ELK Stack | Centralized search and alerting |

### 5.2 Alerting

| Alert | Condition | Severity | Notification |
|-------|-----------|----------|--------------|
| API Error Rate | >5% of requests returning 5xx | Critical | PagerDuty + Slack |
| Response Latency | P95 > 5 seconds | Warning | Slack |
| Database CPU | >80% for 5 minutes | Critical | PagerDuty + Slack |
| LLM Provider Down | Any Tier 1 provider fails health check | Critical | PagerDuty |
| Memory Usage | >85% on any node | Warning | Slack |
| Disk Usage | >90% on any volume | Critical | PagerDuty + Slack |
| SSL Expiry | <30 days | Warning | Email + Slack |
| Cost Anomaly | Daily LLM spend >150% of 7-day average | Warning | Slack + Email |

### 5.3 APM (Application Performance Monitoring)

| Component | Tool | Metrics |
|-----------|------|---------|
| Request Tracing | OpenTelemetry + Jaeger/Datadog | End-to-end request traces with LLM call spans |
| Error Tracking | Sentry | Stack traces, error grouping, release tracking |
| Uptime Monitoring | Pingdom / UptimeRobot | 99.9% SLA target, multi-region checks |
| Real User Monitoring | Datadog RUM / New Relic Browser | Page load, TTFB, FCP, LCP, CLS |
| Agent Performance | CAM 2.0 (built-in) | Agent response time, success rate, cost per task |
| LLM Cost Tracking | WizMark FinOps (built-in) | Per-provider, per-model, per-vertical cost analysis |

### 5.4 Self-Healing ML Monitoring

The Self-Healing ML Service provides automatic error detection, recovery, and system optimization for all AI/ML workloads.

| Component | Requirement | Specification |
|-----------|-------------|---------------|
| **Error Detection** | Real-time anomaly detection on all ML inference pipelines | <30s detection latency |
| **Auto-Recovery** | Automatic model fallback and restart on failure | Zero-intervention recovery for 95% of failures |
| **Performance Drift** | Continuous model performance monitoring | Alert on >5% accuracy drift from baseline |
| **Resource Optimization** | Automatic scaling of ML inference resources | GPU/CPU utilization target: 60–80% |
| **Health Dashboard** | Unified ML health view with agent-level granularity | Per-agent health scores, error rates, latency |
| **Incident Logging** | Structured logging of all ML failures and recoveries | 90-day retention with searchable audit trail |

### 5.5 Synthetic Data Generation Engine

The Synthetic Data Generation Engine produces realistic datasets for testing, training, and validation using WAI SDK orchestration.

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| **Storage** | Dedicated storage volume: 200 GB SSD minimum | Expandable to 1 TB for large-scale generation |
| **Compute** | 4 vCPU, 16 GB RAM dedicated instance | GPU-accelerated generation optional |
| **Data Types** | Structured (tabular), semi-structured (JSON), text, and image datasets | Industry-specific schemas supported |
| **Privacy** | Differential privacy guarantees on all generated data | No PII leakage from source data |
| **Throughput** | 10,000+ records/minute generation rate | Parallelized via WAI SDK orchestration |
| **Validation** | Statistical validation against source distribution | Automated quality scoring |

### 5.6 Token Cost Prediction Service

The Token Cost Prediction Service provides pre-execution cost estimates for all AI tasks across all 24 LLM providers.

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| **Prediction Latency** | <100ms per cost estimate | Must not add perceptible latency to task execution |
| **Accuracy** | ±15% cost prediction accuracy | Continuous calibration against actual costs |
| **Provider Coverage** | All 24 LLM providers with provider-specific pricing models | Updated within 24 hours of provider pricing changes |
| **Task Complexity Analysis** | Automatic classification of task complexity (simple/medium/complex) | Drives model selection and cost optimization |
| **Budget Enforcement** | Real-time budget tracking with configurable spending caps | Per-vertical, per-tenant, and per-user caps |
| **Reporting** | Historical cost analytics with trend analysis | Daily, weekly, and monthly cost reports |
| **Cache** | Redis-backed cost estimate caching | 5-minute TTL for repeated task patterns |

---

## 6. Compliance Checklist

| # | Category | Requirement | Status |
|---|----------|-------------|--------|
| 1 | Data Protection | DPDP Act 2023 compliance assessment | ⬜ Pending |
| 2 | Data Protection | GDPR compliance assessment | ⬜ Pending |
| 3 | Security | SOC2 Type II audit initiation | ⬜ Pending |
| 4 | Security | Penetration testing (annual) | ⬜ Pending |
| 5 | Security | Vulnerability scanning (continuous) | ⬜ Pending |
| 6 | Privacy | Privacy policy (multi-language) | ⬜ Pending |
| 7 | Privacy | Cookie consent management | ⬜ Pending |
| 8 | Privacy | Data Processing Agreements with sub-processors | ⬜ Pending |
| 9 | Legal | Terms of Service | ⬜ Pending |
| 10 | Legal | Acceptable Use Policy | ⬜ Pending |
| 11 | Legal | SLA documentation | ⬜ Pending |
| 12 | Financial | Razorpay PCI-DSS compliance verification | ⬜ Pending |
| 13 | Financial | GST registration and compliance | ⬜ Pending |
| 14 | AI Ethics | AI transparency disclosures | ⬜ Pending |
| 15 | AI Ethics | Content moderation policies | ⬜ Pending |
| 16 | AI Ethics | LLM output filtering and safety guardrails | ⬜ Pending |
| 17 | Accessibility | WCAG 2.1 AA compliance audit | ⬜ Pending |
| 18 | Infrastructure | ISO 27001 readiness assessment | ⬜ Pending |

---

## 7. Pre-Launch Checklist

### Step 1: Infrastructure Setup
- [ ] Provision cloud infrastructure (compute, database, cache, CDN)
- [ ] Configure DNS and SSL certificates
- [ ] Set up load balancer with health checks
- [ ] Deploy PostgreSQL with pgvector extension
- [ ] Configure Redis caching layer
- [ ] Set up S3/Cloud Storage for static assets and media

### Step 2: Credentials & Secrets
- [ ] Obtain and configure all 43 API keys/credentials (Section 2)
- [ ] Store all secrets in cloud provider's secret manager (AWS Secrets Manager / GCP Secret Manager)
- [ ] Rotate all development keys for production-specific keys
- [ ] Verify LLM provider rate limits and billing for production volume
- [ ] Set up API key rotation schedule (90-day cycle)

### Step 3: Database Migration
- [ ] Run Drizzle ORM migrations against production database
- [ ] Verify pgvector extension is installed and functional
- [ ] Create database indexes for common query patterns
- [ ] Set up connection pooling via PgBouncer
- [ ] Configure automated daily backups with PITR
- [ ] Test backup restoration procedure

### Step 4: Application Deployment
- [ ] Build production Docker images
- [ ] Run full test suite (unit, integration, e2e)
- [ ] Deploy to staging environment and validate
- [ ] Configure auto-scaling policies (CPU > 70%, memory > 75%)
- [ ] Set up blue-green or canary deployment pipeline
- [ ] Verify all 8 vertical dashboards load correctly

### Step 5: Security Hardening
- [ ] Enable WAF rules (OWASP Top 10)
- [ ] Configure rate limiting per IP and per tenant
- [ ] Enable CORS with production domain whitelist
- [ ] Set up Content Security Policy (CSP) headers
- [ ] Disable debug mode and development endpoints
- [ ] Run OWASP ZAP security scan
- [ ] Verify RBAC permissions for all 4 user roles

### Step 6: Monitoring Setup
- [ ] Deploy logging pipeline (structured JSON → aggregator)
- [ ] Configure alerting rules (Section 5.2)
- [ ] Set up APM with request tracing
- [ ] Deploy error tracking (Sentry)
- [ ] Configure uptime monitoring for all endpoints
- [ ] Set up LLM cost alerting thresholds
- [ ] Create operational runbooks for common incidents

### Step 7: Compliance & Legal
- [ ] Complete DPDP Act 2023 compliance assessment
- [ ] Publish privacy policy and terms of service
- [ ] Configure cookie consent management
- [ ] Sign DPAs with all sub-processors
- [ ] Appoint Data Protection Officer and Grievance Officer
- [ ] Document incident response procedures

### Step 8: Go-Live Validation
- [ ] Load test with 10K simulated concurrent users
- [ ] Verify LLM routing across all 24 providers
- [ ] Test all 8 vertical workflows end-to-end
- [ ] Validate payment flow (Razorpay) with test transactions
- [ ] Confirm WhatsApp Business API message delivery
- [ ] Test voice agents (Sarvam AI) in all 8 supported languages
- [ ] Verify cross-vertical orchestration with multi-vertical campaigns
- [ ] Validate WizMark Intelligence Suite tool-use capabilities
- [ ] Perform disaster recovery drill
- [ ] Sign-off from security, engineering, and product teams

---

*Document generated: February 8, 2026*
*Platform version: WizMark 360 v4.0.0*
