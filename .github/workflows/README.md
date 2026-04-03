# Vet Clinic Platform - CI/CD Pipeline

## Overview

This document describes the CI/CD pipeline for the vet clinic platform.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
1. **Changes Detection** - Detects which packages have changed to optimize CI runs
2. **Install** - Installs dependencies and caches `node_modules`
3. **API Checks** - Type checking and build for API
4. **Web Checks** - Type checking and build for Web
5. **Test** - Runs unit tests for all packages
6. **Docker Build** - Builds Docker images for verification

**Artifacts:**
- API build (dist/, package.json, prisma/)
- Web build (.next/, package.json, public/)
- Retention: 7 days

### 2. E2E Workflow (`.github/workflows/e2e.yml`)

**Triggers:**
- Pull requests to `main` branch
- Only when web, api, or workflow files change

**Jobs:**
1. Sets up PostgreSQL service container
2. Installs Playwright browsers
3. Sets up test database with migrations and seed data
4. Builds and starts API and Web servers
5. Runs Playwright E2E tests

**Artifacts:**
- Playwright HTML report
- Test results (screenshots, videos on failure)
- Retention: 30 days (report), 7 days (test results)

## Local Development

```bash
# Install dependencies
npm ci

# Run all checks
npm run lint
npm -w api run build
npm -w web run build

# Run E2E tests locally
npm run playwright:install
npm run test:e2e
```

## Production Deployment

### Using Docker Compose

1. Copy and configure environment variables:
   ```bash
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   # Edit both files with production values
   ```

2. Start services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Run database migrations:
   ```bash
   docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
   ```

4. Health check:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001
   ```

### Required Environment Variables

See `api/.env.example` and `web/.env.example` for all required variables.

**Critical variables for production:**
- `POSTGRES_PASSWORD` - Strong database password
- `JWT_SECRET` - Secure random string for JWT signing
- `CORS_ORIGIN` - Allowed origins for CORS

## Troubleshooting

### CI Failures

1. **Type check failures**: Run `npx tsc --noEmit` locally in the failing package
2. **Build failures**: Check for missing dependencies or TypeScript errors
3. **Test failures**: Run tests locally with `npm -w <package> test`

### E2E Failures

1. **Playwright browser issues**: Run `npx playwright install --with-deps`
2. **Server startup issues**: Check port availability (3000, 3001)
3. **Database issues**: Ensure PostgreSQL is running and accessible

### Docker Issues

1. **Build failures**: Check Dockerfile syntax and dependencies
2. **Health check failures**: Ensure services have enough time to start
3. **Network issues**: Check `vet-clinic-network` connectivity
