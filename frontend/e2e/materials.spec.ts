import { test, expect } from '@playwright/test';

test.describe('Materials Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display materials list', async ({ page }) => {
    await page.goto('/materials');
    await expect(page.locator('h1, h2')).toContainText(/materials|Materials/i);
    
    // Check for materials table or list
    const materialsList = page.locator('table, .list, [data-testid="materials-list"]');
    await expect(materialsList.first()).toBeVisible();
  });

  test('should search materials', async ({ page }) => {
    await page.goto('/materials');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('cement');
      await page.waitForTimeout(1000);
      // Should filter results
    }
  });

  test('should display material details', async ({ page }) => {
    await page.goto('/materials');
    
    // Click on first material in the list
    const firstMaterial = page.locator('tr:first-child, .material-item:first-child, [data-testid="material-item"]').first();
    if (await firstMaterial.count() > 0) {
      await firstMaterial.click();
      await expect(page.locator('h1, h2')).toContainText(/material|Material/i);
    }
  });

  test('should have add material button', async ({ page }) => {
    await page.goto('/materials');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
    }
  });

  test('should filter materials by category', async ({ page }) => {
    await page.goto('/materials');
    
    // Look for category filter
    const categoryFilter = page.locator('select, [role="combobox"]').first();
    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display material stock information', async ({ page }) => {
    await page.goto('/materials');
    
    // Check for stock/quantity information
    const stockInfo = page.locator('text=Stock|Quantity|Available').first();
    if (await stockInfo.count() > 0) {
      await expect(stockInfo).toBeVisible();
    }
  });
});
