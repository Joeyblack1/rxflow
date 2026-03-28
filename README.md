# RxFlow — NHS Electronic Prescribing & Medicines Administration

A full-stack EPMA system for NHS mental health settings. Built with Next.js 16, Prisma v7, PostgreSQL (Supabase), deployed on Vercel.

**Live:** https://rxflow-kappa.vercel.app

---

## Demo Credentials

Password for all accounts: `Password1!`

| Role | Email |
|------|-------|
| Prescriber | dr.joseph@rxflow.nhs |
| Nurse | nurse.sarah@rxflow.nhs |
| Pharmacist | pharma.james@rxflow.nhs |
| Admin | admin@rxflow.nhs |
| Read Only | readonly@rxflow.nhs |

---

## Tech Stack

- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **ORM:** Prisma v7.6.0 — uses `prisma.config.ts` (breaking change from v6)
- **Database:** PostgreSQL via `@prisma/adapter-pg` + `pg`
- **Auth:** Custom session-based (bcryptjs + `UserSession` table + httpOnly cookie)
- **Hosting:** Vercel (auto-deploy from GitHub `main`)

---

## Local Dev Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require&connection_limit=1"
AUTH_SECRET="<openssl rand -base64 32>"
NHS_API_KEY=""
CLINIVOICE_WEBHOOK_SECRET=""
```

### 3. Prisma v7 — key differences from v6

Prisma v7 no longer accepts `url` in `schema.prisma`. The datasource URL lives in `prisma.config.ts`:

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env["DATABASE_URL"]! },
});
```

Prisma v7 also requires a **driver adapter**. The `lib/db.ts` client uses:
```ts
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

### 4. Generate Prisma client
```bash
npx prisma generate
```

> **Important:** Always run `prisma generate` after any schema change. `vercel.json` runs this automatically on every Vercel build.

### 5. Push schema to database
```bash
npx prisma db push
```

> For Neon: set `DIRECT_URL` (non-pooled connection) in `prisma.config.ts` for migrations, and `DATABASE_URL` (pooled) for the runtime client.

### 6. Seed the database
```bash
npx dotenv -e .env.local -- ts-node --esm prisma/seed.ts
```

---

## Project Structure

```
app/
  (auth)/           Login, change-password
  (app)/            All protected pages
    dashboard/
    patients/[patientId]/{prescriptions,allergies,mar,clozapine}
    pharmacy/
    ward/
    controlled-drugs/
    admin/{users,audit-log,settings}
    reports/
  api/
    health/         GET — DB connectivity check
    medications/    Drug search + interactions
    patients/       Allergies, clozapine, MAR
    prescriptions/  CRUD
    voice/          CliniVoice-AI webhook (HMAC-signed)
    fhir/Patient/   FHIR R4 Patient resource

lib/
  db.ts             Prisma client (PrismaPg adapter)
  auth.ts           Session management
  audit.ts          AuditLog writer
  rate-limit.ts     In-memory sliding-window rate limiter (login: 5/15min per IP)
  types.ts          Prisma enum re-exports (Prisma v7 pattern)
  actions/          Server Actions

prisma/
  schema.prisma     18 models
  prisma.config.ts  Prisma v7 datasource (URL here, NOT in schema.prisma)
  seed.ts           Demo data

docs/
  CLINICAL_SAFETY_CASE_RECORD.md   DCB0129 — 14 hazards, risk matrix
  DPIA.md                          UK GDPR / Caldicott DPIA
```

---

## CliniVoice-AI Integration

RxFlow receives voice-driven prescription drafts from CliniVoice-AI via signed webhook:

```
POST /api/voice
x-clinivoice-signature: sha256=<HMAC-SHA256(CLINIVOICE_WEBHOOK_SECRET, body)>
Body: { patientNHSNumber, drugs[], transcript, sessionId }
```

Set `CLINIVOICE_WEBHOOK_SECRET` to the same value in both Vercel projects.

---

## NHS Compliance

| Standard | Status |
|----------|--------|
| DCB0129 Clinical Safety | Draft CSCR in `docs/` — Trust sign-off needed |
| UK GDPR / Caldicott | DPIA in `docs/` — DPO sign-off needed |
| AuditLog immutability | Supabase RLS — INSERT+SELECT only |
| dm+d drug coding | Implemented (vmpId/vtmId) |
| FHIR R4 | Patient resource at `/api/fhir/Patient` |

---

## Vercel Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session signing secret |
| `CLINIVOICE_WEBHOOK_SECRET` | HMAC shared secret with CliniVoice-AI |
| `NHS_API_KEY` | PDS / NHS API key (future) |
