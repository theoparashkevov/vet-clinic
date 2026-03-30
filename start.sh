#!/usr/bin/env bash
set -e

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${BLUE}[vet-clinic]${NC} $*"; }
success() { echo -e "${GREEN}[vet-clinic]${NC} $*"; }
warn()    { echo -e "${YELLOW}[vet-clinic]${NC} $*"; }
error()   { echo -e "${RED}[vet-clinic]${NC} $*"; }

# ── options ───────────────────────────────────────────────────────────────────
RESET=0
SEED_ONLY=0
API_ONLY=0
WEB_ONLY=0

show_help() {
  echo "Vet Clinic Platform - Startup Script"
  echo ""
  echo "Usage: ./start.sh [options]"
  echo ""
  echo "Options:"
  echo "  --reset       Reset the database (delete and re-seed)"
  echo "  --seed-only   Only seed the database (don't start servers)"
  echo "  --api-only    Start only the API server"
  echo "  --web-only    Start only the Web server"
  echo "  --help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./start.sh              # Full startup"
  echo "  ./start.sh --reset      # Reset database and start fresh"
  echo "  ./start.sh --seed-only  # Just seed the database"
}

for arg in "$@"; do
  case $arg in
    --reset) RESET=1 ;;
    --seed-only) SEED_ONLY=1 ;;
    --api-only) API_ONLY=1 ;;
    --web-only) WEB_ONLY=1 ;;
    --help) show_help; exit 0 ;;
  esac
done

# ── check prerequisites ──────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js version 18+ required (found $(node --version))"
  exit 1
fi
success "Node.js $(node --version)"

# ── install dependencies ─────────────────────────────────────────────────────
info "Installing dependencies..."
npm install --silent

# ── activate SQLite demo schema ─────────────────────────────────────────────
info "Activating SQLite demo schema..."
npm run api:prisma:use:sqlite --silent

# ── API .env (always ensure SQLite URL for demo) ──────────────────────────────
if [ ! -f api/.env ] || ! grep -q '^DATABASE_URL="file:' api/.env 2>/dev/null; then
  cat > api/.env <<'EOF'
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3001,http://localhost:3000"
JWT_SECRET="dev-only-secret"
JWT_EXPIRES_IN="8h"

# SMS Configuration (optional - leave empty for console mode)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""
CLINIC_NAME="Vet Clinic"
CLINIC_PHONE="(555) 123-4567"
EOF
  info "Set api/.env → SQLite demo mode (file:./dev.db)"
fi

# ── Web .env.local ────────────────────────────────────────────────────────────
if [ ! -f web/.env.local ]; then
  cat > web/.env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
  info "Set web/.env.local"
fi

# ── Prisma client ─────────────────────────────────────────────────────────────
info "Generating Prisma client..."
npm run api:prisma:generate --silent

# ── database setup ────────────────────────────────────────────────────────────
DB_FILE="api/prisma/dev.db"

if [ ! -f "$DB_FILE" ] || [ "$RESET" -eq 1 ]; then
  if [ "$RESET" -eq 1 ]; then
    warn "Resetting database..."
    rm -f "$DB_FILE"
    rm -rf api/prisma/migrations
  else
    info "Database not found — creating..."
  fi
  
  info "Running migrations..."
  npm run api:prisma:push --silent
  
  info "Seeding demo data..."
  cd api
  npx ts-node prisma/seed.ts
  cd ..
  
  success "Database ready with demo data."
else
  info "Database already exists. Run with --reset to wipe and re-seed."
fi

# ── seed only mode ────────────────────────────────────────────────────────────
if [ "$SEED_ONLY" -eq 1 ]; then
  success "Database seeded successfully!"
  exit 0
fi

# ── start servers ─────────────────────────────────────────────────────────────
echo ""
success "╔════════════════════════════════════════════════════════════╗"
success "║           Vet Clinic Platform - Starting Up               ║"
success "╠════════════════════════════════════════════════════════════╣"
success "║  API Server:  http://localhost:3000                       ║"
success "║  Web App:     http://localhost:3001                       ║"
success "╠════════════════════════════════════════════════════════════╣"
success "║  Login: maria.ivanova@vetclinic.com / demo12345          ║"
success "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$API_ONLY" -eq 1 ]; then
  info "Starting API server only..."
  cd api && npm run start:dev
elif [ "$WEB_ONLY" -eq 1 ]; then
  info "Starting Web server only..."
  cd web && npm run dev
else
  info "Starting both API and Web servers..."
  info "Press Ctrl+C to stop"
  echo ""
  npm run dev
fi
