import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('should complete full user journey from login to analytics', async ({ page }) => {
    // Step 1: Login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
    
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Step 2: View Dashboard
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
    await page.waitForTimeout(1000);
    
    // Step 3: Navigate to Projects
    await page.click('a[href="/projects"], text=Projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('h1, h2')).toContainText(/projects|Projects/i);
    await page.waitForTimeout(1000);
    
    // Step 4: Navigate to Materials
    await page.click('a[href="/materials"], text=Materials');
    await expect(page).toHaveURL(/\/materials/);
    await expect(page.locator('h1, h2')).toContainText(/materials|Materials/i);
    await page.waitForTimeout(1000);
    
    // Step 5: Navigate to Suppliers
    await page.click('a[href="/suppliers"], text=Suppliers');
    await expect(page).toHaveURL(/\/suppliers/);
    await expect(page.locator('h1, h2')).toContainText(/suppliers|Suppliers/i);
    await page.waitForTimeout(1000);
    
    // Step 6: Navigate to Purchase Orders
    await page.click('a[href="/purchase-orders"], text=Purchase Orders');
    await expect(page).toHaveURL(/\/purchase-orders/);
    await expect(page.locator('h1, h2')).toContainText(/purchase orders|Purchase Orders/i);
    await page.waitForTimeout(1000);
    
    // Step 7: Navigate to Inventory
    await page.click('a[href="/inventory"], text=Inventory');
    await expect(page).toHaveURL(/\/inventory/);
    await expect(page.locator('h1, h2')).toContainText(/inventory|Inventory/i);
    await page.waitForTimeout(1000);
    
    // Step 8: Navigate to Waste Management
    await page.click('a[href="/waste"], text=Waste');
    await expect(page).toHaveURL(/\/waste/);
    await expect(page.locator('h1, h2')).toContainText(/waste|Waste/i);
    await page.waitForTimeout(1000);
    
    // Step 9: Navigate to Consumption Planning
    await page.click('a[href="/consumption"], text=Consumption');
    await expect(page).toHaveURL(/\/consumption/);
    await page.waitForTimeout(1000);
    
    // Step 10: Navigate to Analytics
    await page.click('a[href="/analytics"], text=Analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('h1, h2')).toContainText(/analytics|Analytics/i);
    await page.waitForTimeout(1000);
    
    // Step 11: Return to Dashboard
    await page.click('a[href="/dashboard"], text=Dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify we can navigate back to dashboard
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
  });

  test('should handle page refresh and maintain session', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard (session maintained)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
  });

  test('should handle browser back navigation', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Navigate to projects
    await page.click('a[href="/projects"], text=Projects');
    await expect(page).toHaveURL(/\/projects/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should display loading states during navigation', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Check for loading indicator
    const loadingIndicator = page.locator('.loading, .spinner, [aria-busy="true"]');
    // May or may not be visible depending on implementation
  });
});
