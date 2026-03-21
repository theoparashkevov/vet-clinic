# Vet Clinic — Web (Next.js + MUI)

POC web with:
- Health indicator (GET /health)
- Date picker + “Show slots” fetching /appointments/slots?date=YYYY-MM-DD

Run locally
1) API up (in repo root):
   - docker compose up -d db
   - cd api && npm install && npm run build && node dist/main.js
2) Web:
   - cd web
   - cp .env.local.example .env.local
   - npm install
   - npm run dev
   - Open the printed local URL

Config
- NEXT_PUBLIC_API_URL (default http://localhost:3000)

Tech
- Next.js 14 (App Router), TypeScript, MUI
- Basic a11y (ARIA labels, live regions)

