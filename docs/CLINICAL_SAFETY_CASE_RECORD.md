# Clinical Safety Case Record (CSCR)
**Standard:** DCB0129 — Clinical Risk Management: its Application in the Manufacture of Health IT Systems
**System:** RxFlow — NHS Electronic Prescribing & Medicines Administration (EPMA)
**Version:** 0.1 (Pre-pilot draft)
**Date:** 2026-03-28
**Clinical Safety Officer:** Dr Joseph Ogage (GMC 7654321), Specialty Doctor in Psychiatry
**Organisation:** Bassetlaw Community Mental Health Team, Nottinghamshire Healthcare NHS Foundation Trust

---

## 1. System Description

RxFlow is a web-based EPMA system designed for NHS mental health settings (community, ward, outpatient, care home). It enables prescribers to create electronic prescriptions, pharmacists to verify them, and nurses to record medicines administration on a Medicines Administration Record (MAR). It integrates with CliniVoice-AI for voice-driven prescribing and supports future integration with RiO, SystemOne, and EMIS via FHIR R4.

**Technology stack:** Next.js 16 (React), Prisma v7, PostgreSQL (Supabase), Vercel (hosting)
**Intended users:** NHS prescribers, nurses, pharmacists, pharmacy technicians, clinical administrators
**Deployment scope:** Community mental health team (pilot), expanding to all settings

---

## 2. Clinical Safety Officer Declaration

I, Dr Joseph Ogage, am the appointed Clinical Safety Officer (CSO) for RxFlow. I hold a current GMC registration (number 7654321), have clinical knowledge of electronic prescribing in mental health, and take responsibility for ensuring that clinical risks associated with this system are identified, assessed, and managed in accordance with DCB0129.

---

## 3. Hazard Log

| ID | Hazard | Cause | Effect | Severity | Likelihood | Risk Level | Control Measures | Residual Risk |
|----|--------|-------|--------|----------|------------|------------|-----------------|---------------|
| H01 | Wrong drug prescribed | Drug search returns incorrect match; user selects wrong item | Patient receives wrong medication; potential harm or death | Catastrophic | Possible | HIGH | dm+d coded drug list; drug name displayed prominently at confirm step; prescriber must review before submit; pharmacist verification step required | MEDIUM |
| H02 | Wrong dose prescribed | Free-text dose entry; no range checking | Overdose or underdose | Major | Possible | HIGH | Dose field validated; high-alert drug flag shown; pharmacist must verify dose before dispensing | MEDIUM |
| H03 | Drug allergy not checked | Allergy record not present or not surfaced | Anaphylaxis or severe reaction | Catastrophic | Unlikely | HIGH | Allergy banner shown on every patient context; allergy check at prescribe step; SEVERE/ANAPHYLAXIS allergies shown in red | MEDIUM |
| H04 | Drug-drug interaction not identified | Interaction database incomplete; newly added drug not checked | Adverse drug event | Major | Possible | HIGH | DrugInteraction table checked at prescribe step; SEVERE interactions block submission; MODERATE shown as warning | MEDIUM |
| H05 | Administration given twice | MAR double-entry; duplicate record | Overdose | Major | Unlikely | MEDIUM | MAREntry timestamp and user recorded; UI shows given/not-given state; only one entry permitted per time window | LOW |
| H06 | Administration omitted without record | Nurse forgets to record; system downtime | Missed dose not detected | Moderate | Possible | MEDIUM | MAR shows outstanding administrations; omission reasons required | LOW |
| H07 | Clozapine given without valid blood result | Traffic light not checked; monitoring overridden | Agranulocytosis; death | Catastrophic | Unlikely | HIGH | Clozapine traffic light enforced at MAR administration; RED result blocks administration; system refuses to proceed without GREEN/AMBER | MEDIUM |
| H08 | Prescription visible to unauthorised user | Broken access control; session hijack | Privacy breach; patient harm | Major | Unlikely | MEDIUM | Role-based access control; httpOnly session cookie; session expiry 12h; audit log on all access | LOW |
| H09 | Incorrect patient context | Patient search returns wrong patient; user not verifying | Prescription written for wrong patient | Catastrophic | Unlikely | HIGH | NHS number displayed on every screen; patient name and DOB shown in context banner; prescriber must confirm patient before submitting | MEDIUM |
| H10 | System unavailable during prescribing | Database outage; Vercel outage | Clinical decision delayed; paper fallback needed | Major | Possible | MEDIUM | /api/health endpoint monitored; paper backup procedure documented (see Section 6); incident escalation pathway defined | LOW |
| H11 | Voice prescription misinterpretation | Whisper ASR error; wrong drug name transcribed | Incorrect draft prescription | Major | Possible | MEDIUM | Voice prescriptions create DRAFT only; mandatory prescriber review before submission; transcript shown alongside draft | LOW |
| H12 | Controlled drug balance miscounted | CD register entry error; manual entry | CD schedule breach; regulatory failure | Major | Unlikely | MEDIUM | CD register tracks running balance; pharmacist witness required; audit trail immutable (AuditLog RLS) | LOW |
| H13 | Data loss | Database deletion; migration error | Loss of prescription history | Major | Unlikely | MEDIUM | Supabase automatic daily backups; AuditLog RLS prevents deletion; point-in-time recovery available | LOW |
| H14 | Session not terminated on shared device | User forgets to log out | Unauthorised access to patient data | Major | Possible | MEDIUM | 12-hour session expiry; logout button prominent; inactivity warning planned | LOW |

---

## 4. Risk Classification Matrix

| | Negligible | Minor | Moderate | Major | Catastrophic |
|---|---|---|---|---|---|
| **Almost Certain** | LOW | MEDIUM | HIGH | CRITICAL | CRITICAL |
| **Likely** | LOW | MEDIUM | HIGH | HIGH | CRITICAL |
| **Possible** | LOW | LOW | MEDIUM | HIGH | HIGH |
| **Unlikely** | LOW | LOW | LOW | MEDIUM | HIGH |
| **Rare** | LOW | LOW | LOW | LOW | MEDIUM |

**CRITICAL:** Immediate action required — block release
**HIGH:** Must be mitigated before go-live
**MEDIUM:** Must be mitigated before pilot expansion
**LOW:** Accept with monitoring

---

## 5. Safety Requirements (Pre-pilot)

The following must be in place before any NHS trust pilot:

- [ ] **SR-01** Pharmacist verification mandatory for all ACTIVE prescriptions (not bypassable)
- [ ] **SR-02** Allergy alert shown in full before any prescribing action
- [ ] **SR-03** Clozapine traffic light enforced — RED blocks administration at system level
- [ ] **SR-04** Controlled drug witness field mandatory for Schedule 2 drugs
- [ ] **SR-05** Paper downtime procedure written and distributed to all users
- [ ] **SR-06** Clinical safety training completed by all users before access
- [ ] **SR-07** User acceptance testing (UAT) completed with at least 3 clinical users
- [ ] **SR-08** Penetration testing completed
- [ ] **SR-09** Information Governance toolkit submission completed
- [ ] **SR-10** Data Security & Protection Toolkit (DSPT) entry completed

---

## 6. Paper Downtime Procedure

In the event of system unavailability:

1. Use paper prescription chart (FP10/ward prescription chart as appropriate)
2. Prescriber signs paper chart
3. Pharmacist verifies paper chart
4. Nurse administers and signs paper MAR
5. On system restoration: retrospectively enter all paper records within 4 hours
6. Document downtime incident in RxFlow audit log on restoration
7. Notify system administrator (admin@rxflow.nhs or IT helpdesk)

---

## 7. Incident & Near-Miss Reporting

Clinical incidents and near-misses involving RxFlow must be reported via:
- Local Datix (or equivalent incident reporting system)
- Notified to Clinical Safety Officer within 24 hours of discovery
- Serious incidents: report to MHRA as Medical Device Adverse Incident if system defect caused or contributed

---

## 8. Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-03-28 | Dr J Ogage | Initial draft — pre-pilot |

**Next review:** Before pilot go-live, then annually or after any significant system change.

**Sign-off required from:** Clinical Safety Officer, Caldicott Guardian, Senior Information Risk Owner (SIRO), Trust Medical Director (for pilot authorisation)
