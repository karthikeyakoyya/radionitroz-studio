// Cross-browser smoke test. Run with: npx playwright test
// Assumes the PHP app is served at BASE_URL (default http://localhost:8000).
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

test.describe('Member dashboard', () => {
  test('shows the sign-in form when logged out', async ({ page }) => {
    await page.goto(`${BASE_URL}/public/index.html`);
    await expect(page.locator('#login-heading')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });

  test('rejects an invalid login with a visible error', async ({ page }) => {
    await page.goto(`${BASE_URL}/public/index.html`);
    await page.fill('#email', 'nobody@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('#login-error')).toBeVisible();
  });
});

test.describe('Admin queue', () => {
  test('shows the admin sign-in form', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/index.html`);
    await expect(page.locator('#login-heading')).toBeVisible();
  });
});

test.describe('Legacy AngularJS view', () => {
  test('shows the sign-in form when logged out', async ({ page }) => {
    await page.goto(`${BASE_URL}/legacy/angularjs/index.html`);
    await expect(page.locator('#login-heading')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });
});

test.describe('Legacy KnockoutJS view', () => {
  test('shows the sign-in form when logged out', async ({ page }) => {
    await page.goto(`${BASE_URL}/legacy/knockout/index.html`);
    await expect(page.locator('#login-heading')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });
});
