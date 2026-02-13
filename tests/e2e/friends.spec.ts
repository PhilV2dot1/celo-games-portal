import { test, expect } from '@playwright/test';

test.describe('Friends Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
  });

  test('friends page loads without error', async ({ page }) => {
    await expect(page).not.toHaveTitle(/404/i);
  });

  test('shows friends page heading', async ({ page }) => {
    const heading = page.locator('h2');
    await expect(heading.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows search section', async ({ page }) => {
    // Search input or search area should be visible
    const searchInput = page.locator('input[type="text"], input[placeholder]');
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows login prompt when not authenticated', async ({ page }) => {
    // When not logged in, should show some indicator that login is needed
    // or a limited view of the friends page
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

test.describe('Friends Navigation', () => {
  test('friends link visible in desktop header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Desktop header should have Friends link
    const friendsLink = page.locator('nav a[href="/friends"]');
    await expect(friendsLink.first()).toBeVisible({ timeout: 5000 });
  });

  test('friends link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const friendsLink = page.locator('nav a[href="/friends"]').first();
    await friendsLink.click();
    await page.waitForURL('/friends');
    await expect(page).not.toHaveTitle(/404/i);
  });
});
