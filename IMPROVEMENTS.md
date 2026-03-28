# RxFlow Improvements

## Open

| ID | Tag | Priority | Date | Description |
|----|-----|----------|------|-------------|
| 3 | [ideo] | Medium | 2026-03-27 | Consider Vercel Hobby (free) or Pro plan — 100 deploys/day free tier limit will bottleneck active dev |
| 5 | [arch] | High | 2026-03-27 | Add `prisma generate` to Neon/seed setup docs — DIRECT_URL needed for migrations on Neon |
| 10 | [test] | Medium | 2026-03-27 | Add Playwright E2E tests: prescribe → verify → administer full flow |
| 12 | [arch] | Medium | 2026-03-28 | Switch schema ID default from cuid() to uuid() for consistency with seed data (currently mixed formats) |
| 15 | [arch] | Medium | 2026-03-28 | Add Prisma Accelerate or switch to pooler once Supabase pooler confirmed working — direct connections exhaust 60-connection free-tier limit under load |
| 17 | [ux] | Medium | 2026-03-28 | Test all 5 role views (Prescriber, Nurse, Pharmacist, Admin, Read-Only) — verify sidebar navigation and access control per role |
| 20 | [sec] | High | 2026-03-28 | Login rate limiting — max 5 attempts / 15 min per IP to prevent brute force |
| 21 | [ux] | High | 2026-03-28 | CliniVoice-AI: "Send to RxFlow" button after prescription action detected — NHS number input + one-click handoff |
| 22 | [arch] | Medium | 2026-03-28 | Write README.md with prisma.config.ts pattern, seed instructions, and dev setup |

## Closed
<!-- sprint 2026-03-28 -->
| 7 | [sec] | 2026-03-28 | AuditLog RLS: INSERT+SELECT only, no UPDATE/DELETE — DCB0129 immutability |
| 8 | [arch] | 2026-03-28 | Clinical Safety Case Record (docs/CLINICAL_SAFETY_CASE_RECORD.md) — 14 hazards, risk matrix, DCB0129 |
| 16 | [arch] | 2026-03-28 | Same as #8 — CSCR + Hazard Log written |
| 18 | [gdpr] | 2026-03-28 | DPIA (docs/DPIA.md) — UK GDPR/Caldicott, data inventory, 8 principles, 10 pre-go-live actions |
| 9 | [fix] | 2026-03-28 | Loading skeletons added to allergies page |
| 11 | [sec] | 2026-03-28 | mustChangePassword field + /change-password page — new users redirected on first login |
| 13 | [fix] | 2026-03-28 | /api/health endpoint returns {status,db,ts} |
| 19 | [sec] | 2026-03-28 | AUTH_SECRET rotated to openssl rand -base64 32 |
| 6 | [link] | 2026-03-28 | CliniVoice-AI /api/rxflow-prescribe: Gemini drug extraction → HMAC-signed POST to /api/voice |
| 14 | [link] | 2026-03-28 | RXFLOW_WEBHOOK_URL + RXFLOW_WEBHOOK_SECRET set in CliniVoice-AI .env.local + Vercel |

| ID | Tag | Date Closed | Description |
|----|-----|-------------|-------------|
| — | [arch] | 2026-03-27 | Prisma v7 datasource URL moved to prisma.config.ts + PrismaPg adapter pattern |
| — | [fix] | 2026-03-27 | Prisma.AuditLogWhereInput used for typed audit log query (fixed Vercel TS strict error) |
| 2 | [arch] | 2026-03-27 | vercel.json buildCommand includes `prisma generate` — Prisma client regenerates on every Vercel build |
| 4 | [fix] | 2026-03-27 | DATABASE_URL + AUTH_SECRET added to Vercel production env vars via CLI |
| 1 | [fix] | 2026-03-27 | GitHub repo linked to Vercel for auto-deploy on git push |
