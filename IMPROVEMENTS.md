# RxFlow Improvements

## Open

| ID | Tag | Priority | Date | Description |
|----|-----|----------|------|-------------|
| 3 | [ideo] | Medium | 2026-03-27 | Consider Vercel Hobby (free) or Pro plan — 100 deploys/day free tier limit will bottleneck active dev |
| 5 | [arch] | High | 2026-03-27 | Add `prisma generate` to Neon/seed setup docs — DIRECT_URL needed for migrations on Neon |
| 6 | [link] | High | 2026-03-27 | CliniVoice-AI webhook endpoint `/api/voice` is ready — update CliniVoice to POST to live URL with HMAC secret |
| 7 | [sec] | High | 2026-03-27 | Add Neon row-level security on AuditLog table to make it immutable — required for DTAC/DCB0129 NHS compliance |
| 8 | [arch] | Medium | 2026-03-27 | Add Clinical Safety Case Record and Hazard Log (DCB0129 mandatory before any NHS trust pilot) |
| 9 | [fix] | Medium | 2026-03-27 | Add loading skeletons to allergies page client component |
| 10 | [test] | Medium | 2026-03-27 | Add Playwright E2E tests: prescribe → verify → administer full flow |

## Closed

| ID | Tag | Date Closed | Description |
|----|-----|-------------|-------------|
| — | [arch] | 2026-03-27 | Prisma v7 datasource URL moved to prisma.config.ts + PrismaPg adapter pattern |
| — | [fix] | 2026-03-27 | Prisma.AuditLogWhereInput used for typed audit log query (fixed Vercel TS strict error) |
| 2 | [arch] | 2026-03-27 | vercel.json buildCommand includes `prisma generate` — Prisma client regenerates on every Vercel build |
| 4 | [fix] | 2026-03-27 | DATABASE_URL + AUTH_SECRET added to Vercel production env vars via CLI |
| 1 | [fix] | 2026-03-27 | GitHub repo linked to Vercel for auto-deploy on git push |
