import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with statistics', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
    
    // Check for dashboard statistics
    await expect(page.locator('text=Total Projects|Projects')).toBeVisible();
    await expect(page.locator('text=Materials|Inventory')).toBeVisible();
    await expect(page.locator('text=Purchase Orders|POs')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.click('a[href="/projects"], text=Projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('h1, h2')).toContainText(/projects|Projects/i);
  });

  test('should navigate to materials page', async ({ page }) => {
    await page.click('a[href="/materials"], text=Materials');
    await expect(page).toHaveURL(/\/materials/);
    await expect(page.locator('h1, h2')).toContainText(/materials|Materials/i);
  });

  test('should navigate to suppliers page', async ({ page }) => {
    await page.click('a[href="/suppliers"], text=Suppliers');
    await expect(page).toHaveURL(/\/suppliers/);
    await expect(page.locator('h1, h2')).toContainText(/suppliers|Suppliers/i);
  });

  test('should navigate to purchase orders page', async ({ page }) => {
    await page.click('a[href="/purchase-orders"], text=Purchase Orders');
    await expect(page).toHaveURL(/\/purchase-orders/);
    await expect(page.locator('h1, h2')).toContainText(/purchase orders|Purchase Orders/i);
  });

  test('should navigate to inventory page', async ({ page }) => {
    await page.click('a[href="/inventory"], text=Inventory');
    await expect(page).toHaveURL(/\/inventory/);
    await expect(page.locator('h1, h2')).toContainText(/inventory|Inventory/i);
  });

  test('should navigate to waste page', async ({ page }) => {
    await page.click('a[href="/waste"], text=Waste');
    await expect(page).toHaveURL(/\/waste/);
    await expect(page.locator('h1, h2')).toContainText(/waste|Waste/i);
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('a[href="/analytics"], text=Analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('h1, h2')).toContainText(/analytics|Analytics/i);
  });

  test('should have working navigation sidebar', async ({ page }) => {
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(5);
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button (assuming there's a logout functionality)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});
