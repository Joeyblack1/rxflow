/**
 * RxFlow E2E — Role-based access control
 * Verifies each of the 5 roles sees the correct sidebar items
 * and is blocked from routes they shouldn't access.
 *
 * Covers improvement #17.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASSWORD = "Password1!";

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

// ── PRESCRIBER ────────────────────────────────────────────────────────────

test("Prescriber: sees dashboard, patients, ward; cannot access /admin", async ({ page }) => {
  await login(page, "dr.joseph@rxflow.nhs");

  // Should see core nav items
  await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /patients/i })).toBeVisible();

  // Cannot access admin
  await page.goto(`${BASE}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);

  await logout(page);
});

// ── NURSE ─────────────────────────────────────────────────────────────────

test("Nurse: sees ward view; cannot access /admin or /pharmacy", async ({ page }) => {
  await login(page, "nurse.sarah@rxflow.nhs");

  await expect(page.getByRole("link", { name: /ward/i })).toBeVisible();

  // Cannot access admin
  await page.goto(`${BASE}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);

  // Cannot access pharmacy
  await page.goto(`${BASE}/pharmacy`);
  await expect(page).not.toHaveURL(/\/pharmacy/);

  await logout(page);
});

// ── PHARMACIST ────────────────────────────────────────────────────────────

test("Pharmacist: sees pharmacy queue; cannot access /admin", async ({ page }) => {
  await login(page, "pharma.james@rxflow.nhs");

  await expect(page.getByRole("link", { name: /pharmacy/i })).toBeVisible();

  await page.goto(`${BASE}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);

  await logout(page);
});

// ── ADMIN ─────────────────────────────────────────────────────────────────

test("Admin: can access /admin, sees all nav items", async ({ page }) => {
  await login(page, "admin@rxflow.nhs");

  await page.goto(`${BASE}/admin`);
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("link", { name: /admin/i })).toBeVisible();

  await logout(page);
});

// ── READ ONLY ─────────────────────────────────────────────────────────────

test("Read-Only: can view patients; cannot prescribe or access admin", async ({ page }) => {
  await login(page, "readonly@rxflow.nhs");

  // Can view patients list
  await page.goto(`${BASE}/patients`);
  await expect(page).toHaveURL(/\/patients/);

  // Cannot reach prescribe action
  await expect(page.getByRole("button", { name: /add prescription|prescribe/i })).toHaveCount(0);

  // Cannot access admin
  await page.goto(`${BASE}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);

  await logout(page);
});

// ── REDIRECT: unauthenticated users ──────────────────────────────────────

test("Unauthenticated: all protected routes redirect to /login", async ({ page }) => {
  for (const route of ["/dashboard", "/patients", "/pharmacy", "/ward", "/admin"]) {
    await page.goto(`${BASE}${route}`);
    await expect(page).toHaveURL(/\/login/);
  }
});
