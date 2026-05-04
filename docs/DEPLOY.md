# Vet Clinic Deployment Guide

Deploy your vet clinic application to any server using Docker Compose.

## Quick Start

```bash
# 1. Clone and enter the repository
cd vet-clinic

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your production values
nano .env

# 4. Start the application
docker compose up -d
```

## Demo Mode Configuration

Enable demo mode to automatically seed data and limit operations:

```bash
# In your .env file:
DEMO_MODE=true
DEMO_MAX_OPERATIONS_PER_HOUR=100
DEMO_RATE_LIMIT_WINDOW_MS=60000
DEMO_RATE_LIMIT_MAX_REQUESTS=30
DEMO_DATA_SEED_ON_STARTUP=true
```

### Demo Mode Features

- **Auto-seeding**: Database is populated with demo data on startup
- **Rate limiting**: 30 requests per minute per user
- **Operation quotas**: 100 write operations per hour per user
- **Demo indicator**: UI shows "Demo Mode" badge

### Demo Mode Limitations

When `DEMO_MODE=true`:
- Users cannot perform more than 100 write operations per hour
- API requests are limited to 30 per minute
- All data is reset on container restart (unless volumes are persisted)

## Production Deployment

### 1. Server Requirements

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

### 2. Domain Setup

For `vetclinic.yourdomain.xyz`:

```bash
# Point DNS A record to your server IP
# vetclinic.yourdomain.xyz -> YOUR_SERVER_IP
```

### 3. SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d vetclinic.yourdomain.xyz

# Copy certificates
cp /etc/letsencrypt/live/vetclinic.yourdomain.xyz/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/vetclinic.yourdomain.xyz/privkey.pem ./nginx/ssl/
```

### 4. Environment Variables

Required production variables:

```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://vetclinic.yourdomain.xyz
VITE_API_URL=https://vetclinic.yourdomain.xyz/api
DEMO_MODE=false
```

### 5. Deploy

```bash
# Pull latest images
docker compose pull

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Check health
curl http://localhost:3000/health
curl http://localhost/health
```

## Demo Deployment Example

Perfect for showcasing to clients:

```bash
# Set up demo environment
cp .env.example .env.demo

# Edit .env.demo with demo settings
# DEMO_MODE=true
# DEMO_MAX_OPERATIONS_PER_HOUR=50

# Deploy demo
docker compose --env-file .env.demo up -d

# Access at: http://your-server-ip
# Demo credentials: admin@vetclinic.com / demo12345
```

## Maintenance

### Update Application

```bash
# Pull updates
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### Backup Database

```bash
# Create backup
docker exec vet-clinic-db pg_dump -U vet vet > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20240101.sql | docker exec -i vet-clinic-db psql -U vet vet
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web-modern
```

### Reset Demo Data

```bash
# Stop services
docker compose down

# Remove database volume (WARNING: deletes all data)
docker volume rm vet-clinic_postgres_data

# Restart (will re-seed if DEMO_MODE=true)
docker compose up -d
```

## Troubleshooting

### Services not starting

```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory
free -m
```

### Database connection issues

```bash
# Check if database is healthy
docker compose ps

# Connect to database
docker exec -it vet-clinic-db psql -U vet vet
```

### Port conflicts

```bash
# Change ports in docker-compose.yml
# Or stop services using ports 80, 443, 3000, 5432
sudo lsof -i :80
sudo lsof -i :3000
```
