# RxFlow Improvements

## Open

| ID | Tag | Priority | Date | Description |
|----|-----|----------|------|-------------|
| 3 | [ideo] | Medium | 2026-03-27 | Consider Vercel Hobby (free) or Pro plan — 100 deploys/day free tier limit will bottleneck active dev |
| 5 | [arch] | High | 2026-03-27 | Add `prisma generate` to Neon/seed setup docs — DIRECT_URL needed for migrations on Neon |
| 6 | [link] | High | 2026-03-27 | CliniVoice-AI webhook endpoint `/api/voice` is ready — update CliniVoice to POST to live URL with HMAC secret |
| 8 | [arch] | Medium | 2026-03-27 | Add Clinical Safety Case Record and Hazard Log (DCB0129 mandatory before any NHS trust pilot) |
| 9 | [fix] | Medium | 2026-03-27 | Add loading skeletons to allergies page client component |
| 10 | [test] | Medium | 2026-03-27 | Add Playwright E2E tests: prescribe → verify → administer full flow |
| 12 | [arch] | Medium | 2026-03-28 | Switch schema ID default from cuid() to uuid() for consistency with seed data (currently mixed formats) |
| 14 | [link] | High | 2026-03-28 | Update CliniVoice-AI webhook config: RXFLOW_WEBHOOK_URL=https://rxflow-kappa.vercel.app/api/voice |
| 15 | [arch] | Medium | 2026-03-28 | Add Prisma Accelerate or switch to pooler once Supabase pooler confirmed working — direct connections exhaust 60-connection free-tier limit under load |
| 16 | [arch] | High | 2026-03-28 | Write Clinical Safety Case Record + Hazard Log (DCB0129 legal requirement before any NHS trust pilot) |
| 17 | [ux] | Medium | 2026-03-28 | Test all 5 role views (Prescriber, Nurse, Pharmacist, Admin, Read-Only) — verify sidebar navigation and access control per role |
| 18 | [gdpr] | High | 2026-03-28 | Write Data Protection Impact Assessment (DPIA) — required under UK GDPR/Caldicott for any system processing NHS patient data |
| 19 | [sec] | High | 2026-03-28 | Rotate AUTH_SECRET to proper openssl rand -base64 32 value — current placeholder weakens session token security |

## Closed
<!-- sprint 2026-03-28 -->
| 7 | [sec] | 2026-03-28 | AuditLog RLS: INSERT+SELECT only, no UPDATE/DELETE — DCB0129 immutability |
| 11 | [sec] | 2026-03-28 | mustChangePassword field + /change-password page — new users redirected on first login |
| 13 | [fix] | 2026-03-28 | /api/health endpoint returns {status,db,ts} |
| 19 | [sec] | 2026-03-28 | AUTH_SECRET rotated to openssl rand -base64 32 |

| ID | Tag | Date Closed | Description |
|----|-----|-------------|-------------|
| — | [arch] | 2026-03-27 | Prisma v7 datasource URL moved to prisma.config.ts + PrismaPg adapter pattern |
| — | [fix] | 2026-03-27 | Prisma.AuditLogWhereInput used for typed audit log query (fixed Vercel TS strict error) |
| 2 | [arch] | 2026-03-27 | vercel.json buildCommand includes `prisma generate` — Prisma client regenerates on every Vercel build |
| 4 | [fix] | 2026-03-27 | DATABASE_URL + AUTH_SECRET added to Vercel production env vars via CLI |
| 1 | [fix] | 2026-03-27 | GitHub repo linked to Vercel for auto-deploy on git push |
