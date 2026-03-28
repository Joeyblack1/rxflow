/**
 * RxFlow E2E — Core clinical flow
 * prescribe → pharmacist verify → nurse administer
 *
 * Prerequisites:
 *  - App running at E2E_BASE_URL (default http://localhost:3000)
 *  - Seed data loaded (npm run db:seed): creates prescriber/nurse/pharmacist test users
 *    and a test patient "TEST Patient E2E" with NHS number 999-000-0001
 *
 * Seed credentials (created by prisma/seed.ts):
 *  prescriber:   prescriber@test.nhs.uk   / TestPass1!
 *  pharmacist:   pharmacist@test.nhs.uk   / TestPass1!
 *  nurse:        nurse@test.nhs.uk        / TestPass1!
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// Shared state across the 3 steps
let prescriptionId: string;

// ── helpers ────────────────────────────────────────────────────────────────

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function logout(page: Page) {
  // TopBar has a sign-out mechanism; fall back to direct URL
  await page.goto(`${BASE}/api/auth/logout`);
}

// ── STEP 1: Prescriber creates a prescription ─────────────────────────────

test("1. Prescriber can prescribe a medication", async ({ page }) => {
  await login(page, "prescriber@test.nhs.uk", "TestPass1!");

  // Navigate to test patient
  await page.goto(`${BASE}/patients`);
  await page.getByRole("searchbox").fill("999-000-0001");
  await page.getByText(/TEST Patient E2E/i).click();
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

  // Capture the prescription ID from URL or success message for next steps
  const url = page.url();
  const match = url.match(/prescriptions?\/([\w-]+)/);
  if (match) prescriptionId = match[1];

  await logout(page);
});

// ── STEP 2: Pharmacist verifies the prescription ──────────────────────────

test("2. Pharmacist can verify the prescription", async ({ page }) => {
  await login(page, "pharmacist@test.nhs.uk", "TestPass1!");

  // Pharmacist sees pending verifications
  await page.goto(`${BASE}/pharmacy`);
  await expect(page.getByText(/Paracetamol/i)).toBeVisible({ timeout: 10000 });

  // Click the row for Paracetamol
  await page.getByText(/Paracetamol/i).first().click();

  // Verify it
  await page.getByRole("button", { name: /verify|approve/i }).click();
  await expect(page.getByText(/verified|approved/i)).toBeVisible();

  await logout(page);
});

// ── STEP 3: Nurse administers the medication ──────────────────────────────

test("3. Nurse can administer the verified medication", async ({ page }) => {
  await login(page, "nurse@test.nhs.uk", "TestPass1!");

  // Ward view shows medications to administer
  await page.goto(`${BASE}/ward`);
  await expect(page.getByText(/Paracetamol/i)).toBeVisible({ timeout: 10000 });

  // Administer
  await page.getByText(/Paracetamol/i).first().click();
  await page.getByRole("button", { name: /administer/i }).click();

  // Confirm administration dialog / form
  await page.getByLabel(/notes|comment/i).fill("Administered by E2E test — no adverse reaction");
  await page.getByRole("button", { name: /confirm|record/i }).click();

  // Should show administered status
  await expect(page.getByText(/administered/i)).toBeVisible();

  await logout(page);
});

// ── STEP 4: Audit log integrity ───────────────────────────────────────────

test("4. Audit log contains all 3 events for the prescription", async ({ page }) => {
  // Log in as admin to check audit log
  await login(page, "admin@test.nhs.uk", "TestPass1!");

  await page.goto(`${BASE}/admin/audit-log`);
  await page.getByRole("searchbox").fill("Paracetamol");

  // Should see PRESCRIBE, VERIFY, ADMINISTER events
  await expect(page.getByText(/PRESCRIBE/i)).toBeVisible();
  await expect(page.getByText(/VERIFY/i)).toBeVisible();
  await expect(page.getByText(/ADMINISTER/i)).toBeVisible();

  await logout(page);
});
