# Data Protection Impact Assessment (DPIA)
**Regulation:** UK GDPR Article 35 / Data Protection Act 2018 / Caldicott Principles
**System:** RxFlow — NHS Electronic Prescribing & Medicines Administration (EPMA)
**Version:** 0.1 (Pre-pilot draft)
**Date:** 2026-03-28
**Data Controller:** Bassetlaw Community Mental Health Team, Nottinghamshire Healthcare NHS Foundation Trust
**Data Protection Officer:** [Trust DPO — to be named]
**Author:** Dr Joseph Ogage, Clinical Safety Officer / Co-founder

---

## 1. Purpose and Necessity

**What does the processing do?**
RxFlow processes NHS patient identifiable data (PID) including NHS numbers, names, dates of birth, addresses, medical diagnoses, prescribed medications, and medicines administration records to enable electronic prescribing and medicines management within NHS mental health settings.

**Why is it necessary?**
Electronic prescribing reduces medication errors, provides a complete digital audit trail, and replaces paper-based systems that lack clinical decision support. Processing of special category health data is necessary for the provision of direct patient care under UK GDPR Article 9(2)(h) (health and social care purposes).

**Legal basis for processing:**
- **Article 6(1)(e):** Public task — provision of NHS healthcare
- **Article 9(2)(h):** Health and social care purposes
- **Schedule 1, Part 1, DPA 2018, para 2:** Health or social care purposes

---

## 2. Data Inventory

| Data Category | Special Category? | Subjects | Source | Retention | Legal Basis |
|---------------|------------------|----------|--------|-----------|-------------|
| NHS number | No | Patients | Manual entry / PDS lookup | Duration of care + 8 years | Art 6(1)(e), 9(2)(h) |
| Name, DOB, sex, address | No | Patients | Manual entry / PDS | Duration of care + 8 years | Art 6(1)(e), 9(2)(h) |
| Diagnosis / indication | **Yes** | Patients | Clinical entry | Duration of care + 8 years | Art 9(2)(h) |
| Prescribed medications | **Yes** | Patients | Prescriber entry | Duration of care + 8 years | Art 9(2)(h) |
| Allergy records | **Yes** | Patients | Clinical entry | Duration of care + 8 years | Art 9(2)(h) |
| MAR administration records | **Yes** | Patients | Nurse entry | Duration of care + 8 years | Art 9(2)(h) |
| Clozapine blood results | **Yes** | Patients | Clinical entry | Duration of care + 8 years | Art 9(2)(h) |
| User account data | No | Staff | Admin entry | Duration of employment | Art 6(1)(b) |
| Audit logs (access + changes) | No (indirectly identifies) | Staff / Patients | System-generated | 8 years | Art 6(1)(c) (legal obligation) |

**Data minimisation:** No data is collected beyond what is clinically necessary. Voice transcripts (if used via CliniVoice-AI) are processed to generate prescription drafts and not stored beyond session completion.

---

## 3. Data Flows

```
Patient data entered by clinician
        ↓
RxFlow web app (Vercel, UK edge)
        ↓
PostgreSQL database (Supabase, EU-West region)
        ↓
Audit log written for every create/modify/access
        ↓
[Future] FHIR R4 export → RiO / SystemOne / EMIS (clinical record systems)
        ↓
[Optional] CliniVoice-AI webhook → voice prescription drafts
```

**Data residency:** All patient data stored in Supabase (PostgreSQL), region EU West (AWS eu-west-2 or us-east-1). Data does not leave the UK/EEA without explicit safeguard.

**Third-party processors:**
| Processor | Purpose | Data shared | Safeguard |
|-----------|---------|-------------|-----------|
| Supabase Inc (USA) | Database hosting | All patient data | SCCs + EU hosting region |
| Vercel Inc (USA) | Application hosting | In-transit only (no persistent storage) | SCCs + edge processing |
| CliniVoice-AI | Voice-to-prescription | NHS number, drug names, transcript | HMAC-signed webhook; no patient storage |

---

## 4. Risk Assessment

| Risk | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
| Unauthorised access to patient records | Low | High | RBAC, httpOnly session cookies, 12h expiry, audit log, HTTPS |
| Data breach via database compromise | Low | High | Supabase at-rest encryption; RLS on AuditLog; access tokens in env vars only |
| Insider threat (staff accessing records without clinical need) | Medium | High | Audit log on all actions; immutable AuditLog (RLS); access reviewed by admin |
| Data loss | Low | High | Supabase automatic daily backups; point-in-time recovery |
| Accidental disclosure via screen sharing | Medium | Medium | Users trained; no data in URLs; session-based auth |
| Third-party processor breach (Supabase/Vercel) | Low | High | DPA Article 28 processor agreement; SCCs for international transfer |
| Excessive retention | Low | Medium | Retention policy: duration of care + 8 years; annual review |
| Subject access request not fulfilled | Low | Low | Admin panel provides export; DPO escalation pathway defined |

---

## 5. Caldicott Principles Compliance

| Principle | How RxFlow complies |
|-----------|-------------------|
| 1. Justify the purpose | Each data access logged with clinical context |
| 2. Don't use personally identifiable information unless necessary | Minimal data model — no PID beyond clinical need |
| 3. Use the minimum necessary | NHS number + name only in search; full record only on patient page |
| 4. Access on strict need-to-know | RBAC by role; READ_ONLY role cannot create/modify |
| 5. Everyone must understand their responsibilities | User training required before access; clinical safety training |
| 6. Understand and comply with the law | UK GDPR, DPA 2018, NHS DSP Toolkit compliance pathway |
| 7. The duty to share can be as important as the duty to protect | FHIR R4 export to RiO/SystemOne/EMIS for care continuity |
| 8. Inform patients about how their data is used | Patient-facing privacy notice required before go-live |

---

## 6. Data Subject Rights

| Right | How exercised |
|-------|--------------|
| Right of access (SAR) | Admin can export all records for a patient; DPO coordinates response within 30 days |
| Right to rectification | Prescriber/admin can correct patient demographic errors; clinical records require clinical review |
| Right to erasure | Does not apply to health records held under statutory obligations; documented refusal basis |
| Right to restrict processing | Admin can mark patient INACTIVE; DPO decision required |
| Right to data portability | FHIR R4 export available |
| Right to object | Does not apply to processing necessary for health care provision |

---

## 7. Actions Required Before Go-Live

- [ ] **D-01** Data Processing Agreement (DPA) signed with Supabase Inc
- [ ] **D-02** Data Processing Agreement signed with Vercel Inc
- [ ] **D-03** Trust DPO review and sign-off of this DPIA
- [ ] **D-04** Caldicott Guardian review and sign-off
- [ ] **D-05** NHS DSP Toolkit submission completed
- [ ] **D-06** Patient-facing privacy notice published (linked from login page)
- [ ] **D-07** Staff data processing notice issued to all system users
- [ ] **D-08** Retention schedule formally adopted by trust
- [ ] **D-09** Breach notification procedure documented and tested
- [ ] **D-10** International transfer impact assessment (ITIA) completed for Supabase/Vercel USA entities

---

## 8. Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-03-28 | Dr J Ogage | Initial draft |

**Next review:** Before pilot go-live, then annually, or after any significant change to data processing.

**Sign-off required from:** Trust DPO, Caldicott Guardian, SIRO
