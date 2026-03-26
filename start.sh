#!/usr/bin/env bash
set -e

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${BLUE}[vet-clinic]${NC} $*"; }
success() { echo -e "${GREEN}[vet-clinic]${NC} $*"; }
warn()    { echo -e "${YELLOW}[vet-clinic]${NC} $*"; }

# ── options ───────────────────────────────────────────────────────────────────
RESET=0
for arg in "$@"; do
  case $arg in
    --reset) RESET=1 ;;
  esac
done

info "Installing dependencies..."
npm install --silent

# ── API .env ──────────────────────────────────────────────────────────────────
if [ ! -f api/.env ]; then
  cp api/.env.example api/.env
  info "Created api/.env from .env.example (SQLite demo mode)"
fi

# ── Prisma client ─────────────────────────────────────────────────────────────
info "Generating Prisma client..."
npm run api:prisma:generate --silent

# ── DB push + seed ────────────────────────────────────────────────────────────
DB_FILE="api/prisma/dev.db"
if [ ! -f "$DB_FILE" ] || [ "$RESET" -eq 1 ]; then
  if [ "$RESET" -eq 1 ]; then
    warn "Resetting database..."
  else
    info "Database not found — creating..."
  fi
  npm run api:prisma:push --silent
  info "Seeding demo data..."
  npm run api:prisma:seed --silent
  success "Database ready with demo data."
else
  info "Database already exists. Run with --reset to wipe and re-seed."
fi

# ── Start ──────────────────────────────────────────────────────────────────────
success "Starting API (http://localhost:3000) and Web (http://localhost:3001)..."
echo ""
npm run dev
