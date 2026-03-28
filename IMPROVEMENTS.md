# RxFlow Improvements

## Open

| ID | Tag | Priority | Date | Description |
|----|-----|----------|------|-------------|
| 3 | [ideo] | Medium | 2026-03-27 | Consider Vercel Hobby (free) or Pro plan — 100 deploys/day free tier limit will bottleneck active dev |
| 12 | [arch] | Medium | 2026-03-28 | Switch schema ID default from cuid() to uuid() for consistency with seed data (currently mixed formats) |
| 15 | [arch] | Medium | 2026-03-28 | Add Prisma Accelerate or switch to pooler once Supabase pooler confirmed working — direct connections exhaust 60-connection free-tier limit under load |

## Closed
<!-- sprint 2026-03-28 -->
| 25 | [ux] | 2026-03-28 | SessionTimer in TopBar: shows "Auto-logout in X min" badge when ≤15 min remaining, urgent red at ≤5 |
| 10 | [test] | 2026-03-28 | Playwright E2E: prescribe-verify-administer.spec.ts (4 tests) + role-views.spec.ts (6 tests) |
| 26 | [arch] | 2026-03-28 | Upstash Redis rate limiter: lib/rate-limit.ts uses Redis when UPSTASH_* env vars present, in-memory fallback otherwise |
| 17 | [ux] | 2026-03-28 | Role-view E2E: e2e/role-views.spec.ts covers all 5 roles + unauthenticated redirect |
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
| 5 | [arch] | 2026-03-28 | README.md with Prisma v7 setup, prisma.config.ts pattern, seed instructions |
| 20 | [sec] | 2026-03-28 | Login rate limiting: 5 attempts/15min per IP (proxy.ts + lib/rate-limit.ts) |
| 21 | [ux] | 2026-03-28 | CliniVoice-AI: Send to RxFlow button on medication actions — NHS number modal + Gemini drug extraction |
| 22 | [arch] | 2026-03-28 | README.md written with full dev setup, Prisma v7 patterns, compliance table |
| 23 | [ux] | 2026-03-28 | InactivityGuard: 15min warning + 20min auto-logout, resets on activity, mounted in AppShell |
| 24 | [arch] | 2026-03-28 | docs/PRE_PILOT_CHECKLIST.md: 35 items, 4 sections, signature blocks for CSO/DPO/CG/Medical Director |

| ID | Tag | Date Closed | Description |
|----|-----|-------------|-------------|
| — | [arch] | 2026-03-27 | Prisma v7 datasource URL moved to prisma.config.ts + PrismaPg adapter pattern |
| — | [fix] | 2026-03-27 | Prisma.AuditLogWhereInput used for typed audit log query (fixed Vercel TS strict error) |
| 2 | [arch] | 2026-03-27 | vercel.json buildCommand includes `prisma generate` — Prisma client regenerates on every Vercel build |
| 4 | [fix] | 2026-03-27 | DATABASE_URL + AUTH_SECRET added to Vercel production env vars via CLI |
| 1 | [fix] | 2026-03-27 | GitHub repo linked to Vercel for auto-deploy on git push |
