# RxFlow Pre-Pilot Sign-Off Checklist
**For:** Trust Medical Director / Clinical Safety Officer / DPO / Caldicott Guardian
**System:** RxFlow EPMA
**Version:** 0.1 — 2026-03-28

This checklist consolidates all mandatory requirements from the Clinical Safety Case Record (DCB0129) and DPIA (UK GDPR/Caldicott) that must be completed and signed off before any NHS trust pilot.

---

## Section A — Clinical Safety (DCB0129) Sign-Off

| Ref | Requirement | Owner | Done | Date |
|-----|-------------|-------|------|------|
| SR-01 | Pharmacist verification mandatory for all ACTIVE prescriptions (not bypassable) | Clinical Safety Officer | ☐ | |
| SR-02 | Allergy alert shown in full before any prescribing action | Clinical Safety Officer | ☐ | |
| SR-03 | Clozapine traffic light enforced — RED blocks administration at system level | Clinical Safety Officer | ☐ | |
| SR-04 | Controlled drug witness field mandatory for Schedule 2 drugs | Clinical Safety Officer | ☐ | |
| SR-05 | Paper downtime procedure written, printed, and distributed to all ward/clinic areas | Ward Manager / IT Lead | ☐ | |
| SR-06 | Clinical safety training completed by all users before access granted | Training Lead | ☐ | |
| SR-07 | User acceptance testing (UAT) completed with ≥3 clinical users across prescriber/nurse/pharmacist roles | Clinical Safety Officer | ☐ | |
| SR-08 | Penetration testing completed by an accredited third party | SIRO / IT Security | ☐ | |
| SR-09 | Information Governance toolkit submission completed | IG Lead | ☐ | |
| SR-10 | Data Security & Protection Toolkit (DSPT) entry completed and marked at Standards Met | IG Lead | ☐ | |

**Clinical Safety Officer sign-off:**
Name: _________________________ GMC No: _____________ Date: _____________ Signature: _____________

---

## Section B — Data Protection / GDPR Sign-Off

| Ref | Requirement | Owner | Done | Date |
|-----|-------------|-------|------|------|
| D-01 | Data Processing Agreement (DPA Article 28) signed with Supabase Inc | DPO | ☐ | |
| D-02 | Data Processing Agreement signed with Vercel Inc | DPO | ☐ | |
| D-03 | This DPIA reviewed and signed off by Trust DPO | DPO | ☐ | |
| D-04 | Caldicott Guardian review and sign-off of DPIA | Caldicott Guardian | ☐ | |
| D-05 | NHS DSP Toolkit submission completed | IG Lead | ☐ | |
| D-06 | Patient-facing privacy notice published and linked from login page | DPO / Web Lead | ☐ | |
| D-07 | Staff data processing notice issued to all system users before access | HR / Training Lead | ☐ | |
| D-08 | Retention schedule formally adopted by trust board | DPO / Trust Board | ☐ | |
| D-09 | Breach notification procedure documented, tested, and communicated to staff | DPO | ☐ | |
| D-10 | International Transfer Impact Assessment (ITIA) completed for Supabase/Vercel (USA entities) | DPO | ☐ | |

**Trust DPO sign-off:**
Name: _________________________ Date: _____________ Signature: _____________

**Caldicott Guardian sign-off:**
Name: _________________________ Date: _____________ Signature: _____________

---

## Section C — Technical Readiness

| Ref | Requirement | Owner | Done | Date |
|-----|-------------|-------|------|------|
| T-01 | All seed/demo user passwords changed from default (Password1!) | System Admin | ☐ | |
| T-02 | AUTH_SECRET confirmed as cryptographically random 32-byte value | IT Lead | ☐ | |
| T-03 | DATABASE_URL uses connection pooler (not direct connection) for production load | IT Lead | ☐ | |
| T-04 | /api/health endpoint confirmed returning {db: true} | IT Lead | ☐ | |
| T-05 | AuditLog RLS confirmed active — no DELETE/UPDATE possible | IT Lead | ☐ | |
| T-06 | Inactivity auto-logout confirmed (15 min warning, 20 min logout) | IT Lead | ☐ | |
| T-07 | Login rate limiting confirmed active (5 attempts/15 min) | IT Lead | ☐ | |
| T-08 | Vercel deployment confirmed in EU region | IT Lead | ☐ | |
| T-09 | Uptime monitoring configured (UptimeRobot or equivalent) | IT Lead | ☐ | |
| T-10 | Error logging configured (Sentry or equivalent) | IT Lead | ☐ | |

---

## Section D — Trust Governance

| Ref | Requirement | Owner | Done | Date |
|-----|-------------|-------|------|------|
| G-01 | Trust Medical Director sign-off on clinical safety case record | Medical Director | ☐ | |
| G-02 | Pilot scope agreed — named wards/clinics, named users, defined duration | Clinical Lead | ☐ | |
| G-03 | Incident reporting pathway communicated to all pilot users (Datix + CSO notification) | Clinical Safety Officer | ☐ | |
| G-04 | MHRA medical device registration assessed (software as a medical device classification) | SIRO / Legal | ☐ | |
| G-05 | Exit plan documented — what happens if pilot is paused/stopped | Clinical Lead / IT Lead | ☐ | |

**Trust Medical Director sign-off (pilot authorisation):**
Name: _________________________ Date: _____________ Signature: _____________

---

## Overall Status

| Section | Items | Complete | Sign-off |
|---------|-------|----------|---------|
| A — Clinical Safety (DCB0129) | 10 | 0/10 | ☐ |
| B — Data Protection / GDPR | 10 | 0/10 | ☐ |
| C — Technical Readiness | 10 | 0/10 | ☐ |
| D — Trust Governance | 5 | 0/5 | ☐ |
| **Total** | **35** | **0/35** | |

**Pilot go-live authorised:** ☐ YES / ☐ NO

**Authorised by (Medical Director):** _________________________ **Date:** _____________

---

*Document prepared by: Dr Joseph Ogage, Clinical Safety Officer / Co-founder, RxFlow*
*Based on: DCB0129, UK GDPR Art. 35, Data Protection Act 2018, Caldicott Principles (8th edition)*
