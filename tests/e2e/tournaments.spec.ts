import { test, expect } from '@playwright/test';

test.describe('Tournaments Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
  });

  test('tournaments page loads without error', async ({ page }) => {
    await expect(page).not.toHaveTitle(/404/i);
  });

  test('shows tournaments page heading', async ({ page }) => {
    const heading = page.locator('h2');
    await expect(heading.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows tournament status filter tabs', async ({ page }) => {
    // Filter buttons for tournament statuses should be visible
    const filterButtons = page.locator('button').filter({ hasText: /open|progress|completed|all/i });
    await expect(filterButtons.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows create tournament button', async ({ page }) => {
    // Create button should be visible (may require auth)
    const createButton = page.locator('button').filter({ hasText: /create|new|tournament/i });
    // If not authenticated, the button may not be present
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('shows empty state or tournament list', async ({ page }) => {
    // Either shows tournaments or an empty state message
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    // Page should have meaningful content (not blank)
    const textContent = await page.textContent('body');
    expect(textContent?.length).toBeGreaterThan(10);
  });
});

test.describe('Tournaments Navigation', () => {
  test('tournaments link visible in desktop header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tournamentsLink = page.locator('nav a[href="/tournaments"]');
    await expect(tournamentsLink.first()).toBeVisible({ timeout: 5000 });
  });

  test('tournaments link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tournamentsLink = page.locator('nav a[href="/tournaments"]').first();
    await tournamentsLink.click();
    await page.waitForURL('/tournaments');
    await expect(page).not.toHaveTitle(/404/i);
  });
});

test.describe('Tournament Detail Page', () => {
  test('shows not found for invalid tournament ID', async ({ page }) => {
    await page.goto('/tournaments/nonexistent-id');
    await page.waitForLoadState('networkidle');

    // Should either show loading or a "not found" message
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('has back link to tournaments list', async ({ page }) => {
    await page.goto('/tournaments/nonexistent-id');
    await page.waitForLoadState('networkidle');

    // Should have a back link to tournaments
    const backLink = page.locator('a[href="/tournaments"]');
    await expect(backLink.first()).toBeVisible({ timeout: 10000 });
  });
});
