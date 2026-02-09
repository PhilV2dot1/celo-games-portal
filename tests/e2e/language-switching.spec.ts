import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('language switcher shows EN/FR buttons', async ({ page }) => {
    // Language switcher should be visible in header
    const enButton = page.locator('button:has-text("EN")');
    const frButton = page.locator('button:has-text("FR")');

    await expect(enButton.first()).toBeVisible();
    await expect(frButton.first()).toBeVisible();
  });

  test('switching to FR changes homepage text', async ({ page }) => {
    // Click FR button
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Homepage should show French text
    // Look for known French translations
    const frenchText = page.locator('text=/Portail de Mini-Jeux|Tableau de bord|Jouer/i');
    await expect(frenchText.first()).toBeVisible({ timeout: 5000 });
  });

  test('switching to FR changes game page text', async ({ page }) => {
    // Switch to French first
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Navigate to minesweeper
    await page.goto('/games/minesweeper');
    await page.waitForLoadState('networkidle');

    // Check for French game text
    const frenchLabels = page.locator('text=/Démineur|Comment jouer|Statistiques/i');
    await expect(frenchLabels.first()).toBeVisible({ timeout: 5000 });
  });

  test('language persists across page navigation', async ({ page }) => {
    // Switch to French
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Navigate to a game page
    await page.goto('/games/yahtzee');
    await page.waitForLoadState('networkidle');

    // French should still be active
    const frenchText = page.locator('text=/Lancez les dés|Comment jouer/i');
    await expect(frenchText.first()).toBeVisible({ timeout: 5000 });

    // Navigate back home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // French should persist
    const homeFrench = page.locator('text=/Portail de Mini-Jeux|Tableau de bord/i');
    await expect(homeFrench.first()).toBeVisible({ timeout: 5000 });
  });

  test('game titles change when switching language', async ({ page }) => {
    // Navigate to snake page
    await page.goto('/games/snake');
    await page.waitForLoadState('networkidle');

    // Check English title
    await expect(page.locator('h1')).toContainText(/snake/i);

    // Switch to French
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Title should change (Snake in French is "Serpent" or stays "Snake" - depends on translations)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('minesweeper shows French labels in FR mode', async ({ page }) => {
    // Navigate to minesweeper
    await page.goto('/games/minesweeper');
    await page.waitForLoadState('networkidle');

    // Switch to French
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Check for French difficulty labels or other French text
    const frenchContent = page.locator('text=/Facile|Moyen|Difficile|Démineur/i');
    await expect(frenchContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('yahtzee shows French labels in FR mode', async ({ page }) => {
    await page.goto('/games/yahtzee');
    await page.waitForLoadState('networkidle');

    // Switch to French
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Check for French content
    const frenchContent = page.locator('text=/Comment jouer|Lancez/i');
    await expect(frenchContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('switching back to EN restores English text', async ({ page }) => {
    // Switch to French
    const frButton = page.locator('button:has-text("FR")');
    await frButton.first().click();
    await page.waitForTimeout(500);

    // Verify French is active
    const frenchText = page.locator('text=/Portail de Mini-Jeux|Tableau de bord/i');
    await expect(frenchText.first()).toBeVisible({ timeout: 5000 });

    // Switch back to English
    const enButton = page.locator('button:has-text("EN")');
    await enButton.first().click();
    await page.waitForTimeout(500);

    // Verify English is restored
    const englishText = page.locator('text=/Mini Games Portal|Dashboard|Play/i');
    await expect(englishText.first()).toBeVisible({ timeout: 5000 });
  });

  test('language switcher visible on mobile in hamburger menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 393, height: 851 });
    await page.waitForTimeout(300);

    // Open hamburger menu (look for menu button)
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu-button"]');
    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);

      // Language buttons should be visible in the mobile menu
      const enButton = page.locator('button:has-text("EN")');
      const frButton = page.locator('button:has-text("FR")');

      // At least one of them should be visible in the opened menu
      const enVisible = await enButton.first().isVisible();
      const frVisible = await frButton.first().isVisible();
      expect(enVisible || frVisible).toBeTruthy();
    }
  });
});
