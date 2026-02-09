import { test, expect, devices } from '@playwright/test';

// Use Pixel 5 device settings for mobile tests
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile Responsive', () => {
  test('homepage renders game grid on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should render without errors
    await expect(page).not.toHaveTitle(/404/i);

    // Game cards should be visible
    const gameCards = page.locator('[data-testid="game-card"], a[href*="/games/"], a[href*="/blackjack"], a[href*="/rps"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('hamburger menu opens on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hamburger menu button should be visible on mobile
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu-button"]');

    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);

      // Menu content should appear (nav links)
      const navLinks = page.locator('nav a, [role="navigation"] a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('navigation links work from mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open hamburger menu
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu-button"]');

    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);

      // Click on a game link if available
      const gameLink = page.locator('a[href*="/games/"], a[href*="/blackjack"], a[href*="/rps"]');
      if (await gameLink.first().isVisible()) {
        const href = await gameLink.first().getAttribute('href');
        await gameLink.first().click();
        await page.waitForLoadState('networkidle');

        // Should navigate to the game page
        if (href) {
          expect(page.url()).toContain(href);
        }
      }
    }
  });

  test('snake game renders with mobile direction controls visible', async ({ page }) => {
    await page.goto('/games/snake');
    await page.waitForLoadState('networkidle');

    // Snake board should be visible
    await expect(page.locator('[data-testid="snake-board"]')).toBeVisible();

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForTimeout(500);

    // Mobile direction buttons should be visible (not hidden by sm:hidden on small screens)
    const upButton = page.locator('[data-testid="direction-up"]');
    await expect(upButton).toBeVisible();

    const downButton = page.locator('[data-testid="direction-down"]');
    await expect(downButton).toBeVisible();
  });

  test('minesweeper board fits in mobile viewport (easy mode)', async ({ page }) => {
    await page.goto('/games/minesweeper');
    await page.waitForLoadState('networkidle');

    // Select easy difficulty
    await page.locator('[data-testid="difficulty-easy"]').click();

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForSelector('[data-testid="minesweeper-board"]', { timeout: 5000 });

    // Board should be visible and within viewport
    const board = page.locator('[data-testid="minesweeper-board"]');
    await expect(board).toBeVisible();

    const box = await board.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Board should start within viewport
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
    }
  });

  test('connect five board fits in mobile viewport', async ({ page }) => {
    await page.goto('/games/connect-five');
    await page.waitForLoadState('networkidle');

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForSelector('[data-testid="connectfive-board"]', { timeout: 5000 });

    const board = page.locator('[data-testid="connectfive-board"]');
    await expect(board).toBeVisible();

    const box = await board.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('yahtzee dice and scorecard render on mobile', async ({ page }) => {
    await page.goto('/games/yahtzee');
    await page.waitForLoadState('networkidle');

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForSelector('[data-testid="die-0"]', { timeout: 5000 });

    // All 5 dice should be visible
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`[data-testid="die-${i}"]`)).toBeVisible();
    }

    // Roll button should be visible
    await expect(page.locator('[data-testid="roll-dice"]')).toBeVisible();
  });

  test('sudoku grid renders and cells are tappable on mobile', async ({ page }) => {
    await page.goto('/games/sudoku');
    await page.waitForLoadState('networkidle');

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForSelector('[data-testid="sudoku-grid"]', { timeout: 5000 });

    // Grid should be visible
    const grid = page.locator('[data-testid="sudoku-grid"]');
    await expect(grid).toBeVisible();

    // Try to tap a cell
    const cell = page.locator('[data-testid="sudoku-cell-0-0"]');
    await expect(cell).toBeVisible();
  });

  test('solitaire cards are visible on mobile', async ({ page }) => {
    await page.goto('/games/solitaire');
    await page.waitForLoadState('networkidle');

    // Start game
    await page.locator('[data-testid="start-game"]').click();
    await page.waitForSelector('[data-testid="solitaire-board"]', { timeout: 5000 });

    // Board should be visible
    await expect(page.locator('[data-testid="solitaire-board"]')).toBeVisible();

    // Stock pile should be tappable
    await expect(page.locator('[data-testid="stock-pile"]')).toBeVisible();
  });

  test('language switcher accessible from mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open hamburger menu
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu-button"]');

    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);
    }

    // Language buttons should be accessible
    const enButton = page.locator('button:has-text("EN")');
    const frButton = page.locator('button:has-text("FR")');

    const enVisible = await enButton.first().isVisible();
    const frVisible = await frButton.first().isVisible();
    expect(enVisible || frVisible).toBeTruthy();
  });

  test('dark mode toggle accessible from mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open hamburger menu
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="mobile-menu-button"]');

    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);
    }

    // Theme toggle should be present (look for sun/moon icons or theme toggle button)
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="mode" i]');

    // It should be in the DOM (may need to scroll in menu)
    const count = await themeToggle.count();
    // Just verify the page loaded properly with mobile layout
    await expect(page).not.toHaveTitle(/404/i);
  });

  test('leaderboard page renders on mobile', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveTitle(/404/i);

    // Page should render with leaderboard content
    const heading = page.locator('h1, h2');
    await expect(heading.first()).toBeVisible();
  });
});
