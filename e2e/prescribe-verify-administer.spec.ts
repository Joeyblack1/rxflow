/**
 * RxFlow E2E — Core clinical flow
 * prescribe → pharmacist verify → nurse administer
 *
 * Prerequisites:
 *  - App running at E2E_BASE_URL (default http://localhost:3000)
 *  - Seed data loaded (npm run db:seed)
 *
 * Seed credentials (password: Password1!):
 *  prescriber:   dr.joseph@rxflow.nhs
 *  pharmacist:   pharma.james@rxflow.nhs
 *  nurse:        nurse.sarah@rxflow.nhs
 *  admin:        admin@rxflow.nhs
 *  read-only:    readonly@rxflow.nhs
 *
 * Test patient: John Smith — NHS 9434765919
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASSWORD = "Password1!";

// ── helpers ────────────────────────────────────────────────────────────────

async function login(page: Page, email: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function logout(page: Page) {
  await page.goto(`${BASE}/api/auth/logout`);
}

// ── STEP 1: Prescriber creates a prescription ─────────────────────────────

test("1. Prescriber can prescribe a medication for John Smith", async ({ page }) => {
  await login(page, "dr.joseph@rxflow.nhs");

  // Navigate to John Smith
  await page.goto(`${BASE}/patients`);
  await page.getByRole("searchbox").fill("9434765919");
  await page.getByText(/John Smith/i).click();
  await expect(page).toHaveURL(/\/patients\//);

  // Open prescribe tab
  await page.getByRole("tab", { name: /prescribe|medications/i }).click();
  await page.getByRole("button", { name: /add prescription|prescribe/i }).click();

  // Fill prescription form
  await page.getByLabel(/drug|medication/i).fill("Paracetamol");
  await page.getByLabel(/dose/i).fill("1g");
  await page.getByLabel(/route/i).selectOption("ORAL");
  await page.getByLabel(/frequency/i).selectOption("QDS");
  await page.getByLabel(/indication/i).fill("Pain relief — E2E test");
  await page.getByRole("button", { name: /prescribe|submit/i }).click();

  // Confirm success
  await expect(page.getByText(/prescribed|saved|success/i)).toBeVisible();

  await logout(page);
});

// ── STEP 2: Pharmacist verifies the prescription ──────────────────────────

test("2. Pharmacist can verify the pending prescription", async ({ page }) => {
  await login(page, "pharma.james@rxflow.nhs");

  await page.goto(`${BASE}/pharmacy`);
  await expect(page.getByText(/Paracetamol/i)).toBeVisible({ timeout: 10000 });

  await page.getByText(/Paracetamol/i).first().click();
  await page.getByRole("button", { name: /verify|approve/i }).click();
  await expect(page.getByText(/verified|approved/i)).toBeVisible();

  await logout(page);
});

// ── STEP 3: Nurse administers the medication ──────────────────────────────

test("3. Nurse can administer the verified medication", async ({ page }) => {
  await login(page, "nurse.sarah@rxflow.nhs");

  await page.goto(`${BASE}/ward`);
  await expect(page.getByText(/Paracetamol/i)).toBeVisible({ timeout: 10000 });

  await page.getByText(/Paracetamol/i).first().click();
  await page.getByRole("button", { name: /administer/i }).click();

  await page.getByLabel(/notes|comment/i).fill("Administered — E2E test, no adverse reaction");
  await page.getByRole("button", { name: /confirm|record/i }).click();

  await expect(page.getByText(/administered/i)).toBeVisible();

  await logout(page);
});

// ── STEP 4: Audit log integrity ───────────────────────────────────────────

test("4. Audit log contains all 3 events", async ({ page }) => {
  await login(page, "admin@rxflow.nhs");

  await page.goto(`${BASE}/admin/audit-log`);
  await page.getByRole("searchbox").fill("Paracetamol");

  await expect(page.getByText(/PRESCRIBE/i)).toBeVisible();
  await expect(page.getByText(/VERIFY/i)).toBeVisible();
  await expect(page.getByText(/ADMINISTER/i)).toBeVisible();

  await logout(page);
});
