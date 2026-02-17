# AEGIS Deployment Guide

## Production Deployment

This guide covers deploying AEGIS to a production environment.

## Prerequisites

- Linux server or cloud VM (Ubuntu 20.04+ recommended)
- Docker & Docker Compose installed
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL instance (managed service recommended)
- Minimum 4GB RAM, 2 CPU cores

## Security Hardening

### 1. Generate Strong Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Add to .env
JWT_SECRET=<generated-secret>
```

### 2. Configure HTTPS

Use nginx as reverse proxy with SSL:

```nginx
# /etc/nginx/sites-available/aegis
server {
    listen 443 ssl http2;
    server_name aegis.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/aegis.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aegis.yourdomain.com/privkey.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name aegis.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Environment Configuration

Production `.env`:

```bash
# Database (use managed PostgreSQL in production)
DATABASE_URL=postgresql://aegis_user:STRONG_PASSWORD@db.prod.internal:5432/aegis_prod

# Vector Store
CHROMA_API_URL=http://chroma.prod.internal:8000

# Auth - ROTATE IN PRODUCTION
JWT_SECRET=<64-char-hex-secret>
ACCESS_TOKEN_EXPIRE_MINUTES=480

# AI
OPENAI_API_KEY=sk-prod-...

# CORS - production domain only
BACKEND_CORS_ORIGINS=["https://aegis.yourdomain.com"]

# Logging
LOG_LEVEL=INFO
```

### 4. Database Setup

```bash
# Use managed PostgreSQL or set up dedicated instance
createdb aegis_prod

# Run migrations
cd backend
export DATABASE_URL="postgresql://user:pass@host:5432/aegis_prod"
python manage.py migrate

# Create initial admin (don't use default seed in prod)
# Use registration endpoint or SQL
```

## Docker Production Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CHROMA_API_URL=${CHROMA_API_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=https://aegis.yourdomain.com/api
    ports:
      - "3000:3000"
    restart: unless-stopped
    depends_on:
      - backend

  chroma:
    image: ghcr.io/chroma-core/chroma:latest
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
    ports:
      - "8001:8000"
    restart: unless-stopped
    volumes:
      - chroma_data:/chroma/chroma

volumes:
  chroma_data:
```

### Production Dockerfiles

**Backend Dockerfile.prod**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root
RUN useradd -m aegis && chown -R aegis:aegis /app
USER aegis

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Frontend Dockerfile.prod**:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### Deploy

```bash
# Pull latest code
git pull origin main

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check health
curl https://aegis.yourdomain.com/api/healthz
```

## Cloud Deployment (AWS Example)

### Architecture
```
Internet → ALB → ECS Fargate (Backend) → RDS PostgreSQL
                 ↓
           CloudFront → S3 (Frontend Static)
```

### Steps

1. **Create RDS PostgreSQL instance**
2. **Deploy Backend to ECS**:
   - Build Docker image
   - Push to ECR
   - Create ECS task definition
   - Deploy to Fargate
3. **Build Frontend**:
   - `npm run build`
   - Upload to S3
   - Configure CloudFront distribution
4. **Configure secrets** in AWS Secrets Manager
5. **Set up ALB** with HTTPS listener
6. **Configure Route53** for DNS

## Monitoring & Logging

### Application Logs

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Audit logs (query database)
psql $DATABASE_URL -c "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100;"
```

### Health Checks

```bash
# Backend health
curl https://aegis.yourdomain.com/api/healthz

# Expected: {"status":"ok"}
```

### Metrics (Future)

- Prometheus exporter
- Grafana dashboards
- CloudWatch/Datadog integration

## Backup & Recovery

### Database Backups

```bash
# Daily backup
pg_dump $DATABASE_URL > aegis_backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < aegis_backup_20260217.sql
```

### Automated Backups

Use managed database backups (RDS snapshots, etc.)

## Scaling

### Horizontal Scaling

```yaml
# Scale backend replicas
docker compose -f docker-compose.prod.yml up -d --scale backend=4
```

### Load Testing

```bash
# Install wrk
sudo apt-get install wrk

# Test SAR generation endpoint
wrk -t4 -c100 -d30s --latency \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -s post.lua \
  https://aegis.yourdomain.com/api/sar/generate
```

## Security Best Practices

1. **Never commit secrets** - use environment variables
2. **Rotate JWT_SECRET** every 90 days
3. **Enable database SSL** connections
4. **Use WAF** (Web Application Firewall)
5. **Regular security updates** - patch Docker images
6. **Rate limiting** - implement on API gateway
7. **Audit log retention** - archive after 7 years
8. **Penetration testing** - annual security audits

## Troubleshooting

### High Memory Usage
- Scale backend pods
- Optimize database queries
- Add Redis caching

### Slow SAR Generation
- Check OpenAI API latency
- Increase LLM timeout
- Cache templates

### Database Connection Errors
- Check connection pool settings
- Verify firewall rules
- Monitor RDS metrics

## Rollback Procedure

```bash
# Rollback to previous version
docker compose -f docker-compose.prod.yml down
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml up -d --build
```

## Support Contacts

- Infrastructure: ops@company.com
- Security: security@company.com
- Compliance: compliance@company.com
