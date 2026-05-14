#!/bin/sh
set -e

echo "[entrypoint] Activating postgres schema..."
node scripts/use-prisma-schema.js postgres

echo "[entrypoint] Resetting database and applying schema..."
npx prisma db push --force-reset --accept-data-loss

echo "[entrypoint] Seeding demo data..."
npx ts-node --transpile-only --project tsconfig.json prisma/seed.ts

echo "[entrypoint] Starting API..."
exec npm start
