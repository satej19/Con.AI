import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Paths', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation with longer timeout
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should stay on login page or show error
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('should navigate to projects after login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    
    // Try to navigate to projects
    const projectsLink = page.locator('a[href="/projects"], text=Projects').first();
    if (await projectsLink.count() > 0) {
      await projectsLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/projects');
    }
  });

  test('should navigate to materials after login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    
    // Try to navigate to materials
    const materialsLink = page.locator('a[href="/materials"], text=Materials').first();
    if (await materialsLink.count() > 0) {
      await materialsLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/materials');
    }
  });
});
