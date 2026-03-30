# 🚀 start.sh - Complete Startup Script

## Overview

The `start.sh` script is your one-command solution to start the entire Vet Clinic Platform. It handles everything from dependency installation to database setup to starting the servers.

---

## Usage

```bash
./start.sh [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--reset` | Reset the database (delete and re-seed) |
| `--seed-only` | Only seed the database (don't start servers) |
| `--api-only` | Start only the API server |
| `--web-only` | Start only the Web server |
| `--help` | Show help message |

### Examples

```bash
# Full startup (first time or normal use)
./start.sh

# Reset database and start fresh
./start.sh --reset

# Just seed the database (useful for testing)
./start.sh --seed-only

# Start only the API server
./start.sh --api-only

# Start only the Web server
./start.sh --web-only
```

---

## What It Does

### 1. Prerequisites Check
- ✅ Verifies Node.js 18+ is installed
- ✅ Verifies npm is installed

### 2. Dependencies
- ✅ Runs `npm install` in root
- ✅ Installs API dependencies
- ✅ Installs Web dependencies

### 3. Database Setup
- ✅ Activates SQLite schema
- ✅ Creates `.env` file with proper settings
- ✅ Generates Prisma client
- ✅ Runs database migrations (`prisma db push`)
- ✅ Seeds database with demo data

### 4. Server Startup
- ✅ Starts API server on http://localhost:3000
- ✅ Starts Web app on http://localhost:3001
- ✅ Runs both concurrently with colored output

---

## Demo Data Included

The script seeds the database with comprehensive demo data:

| Entity | Count |
|--------|-------|
| Users | 6 (3 doctors, 1 admin, 1 staff, 1 client) |
| Owners | 4 |
| Patients | 6 (dogs, cats, rabbit) |
| Patient Alerts | 7 (1 critical allergy) |
| Vaccinations | 6 |
| Weight Records | 15 |
| Appointments | 12 (today + past + future) |
| Medical Records | 6 |
| **Prescriptions** | **4 (NEW!)** |
| **Follow-up Reminders** | **5 (NEW!)** |
| Medication Templates | 60+ |
| Note Templates | 9 |

---

## First-Time Setup

```bash
# Clone or navigate to the project
cd vet-clinic

# Make script executable (if not already)
chmod +x start.sh

# Run the script
./start.sh
```

The script will:
1. Install all dependencies
2. Create the database
3. Seed with demo data
4. Start both servers

---

## Login Credentials

After starting, access the app at **http://localhost:3001**

```
Doctor Login:
  Email: maria.ivanova@vetclinic.com
  Password: demo12345

Staff Login:
  Email: staff@vetclinic.com
  Password: demo12345

Admin Login:
  Email: admin@vetclinic.com
  Password: demo12345
```

---

## Demo Features Ready

With the seeded data, you can immediately demo:

1. **Prescription Management**
   - Go to Rex → See prescription list
   - Create new prescription → See allergy warning for Amoxicillin
   - Print prescriptions

2. **Follow-up Reminders**
   - Click bell icon in header → See 5 reminders
   - Mark reminders complete
   - Send SMS notifications

3. **Appointment Workflow**
   - View calendar → See Rex "in_progress", Whiskers "checked_in"
   - Click appointment → Use stepper to progress status
   - Complete appointment → Create follow-up reminder

4. **Patient Alerts**
   - Rex shows red critical alert for penicillin allergy
   - Buddy shows weight loss trend
   - Whiskers shows overdue vaccinations

5. **SMS Notifications**
   - Works in console mode (logs to terminal)
   - Add Twilio credentials to `.env` for real SMS

---

## Troubleshooting

### Database Issues

```bash
# Reset everything and start fresh
./start.sh --reset

# Just re-seed the database
./start.sh --seed-only
```

### Port Already in Use

```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then restart
./start.sh
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules api/node_modules web/node_modules
./start.sh
```

---

## File Structure

```
vet-clinic/
├── start.sh              # ← This script
├── api/
│   ├── .env              # Created by script
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── schema.sqlite.prisma
│   │   └── seed.ts       # Demo data
│   └── ...
├── web/
│   ├── .env.local        # Created by script
│   └── ...
└── package.json
```

---

## Environment Variables

The script automatically creates `api/.env` with:

```bash
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3001,http://localhost:3000"
JWT_SECRET="dev-only-secret"
JWT_EXPIRES_IN="8h"

# SMS Configuration (optional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""
CLINIC_NAME="Vet Clinic"
CLINIC_PHONE="(555) 123-4567"
```

And `web/.env.local` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Success!

After running `./start.sh`, you'll see:

```
╔════════════════════════════════════════════════════════════╗
║           Vet Clinic Platform - Starting Up               ║
╠════════════════════════════════════════════════════════════╣
║  API Server:  http://localhost:3000                       ║
║  Web App:     http://localhost:3001                       ║
╠════════════════════════════════════════════════════════════╣
║  Login: maria.ivanova@vetclinic.com / demo12345          ║
╚════════════════════════════════════════════════════════════╝
```

**Ready to demo! 🎉**
