import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Material Management/);
    await expect(page.locator('h1')).toContainText(/Welcome back|Sign in/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Enter a valid work email address')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Enter a valid work email address')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.form-alert')).toBeVisible();
    await expect(page.locator('.form-alert')).toContainText(/Unable to sign in|Invalid credentials/i);
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // First login
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Try to navigate to login again
    await page.goto('/login');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should remember me checkbox work', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    // The checkbox should be checked by default
    const isChecked = await checkbox.isChecked();
    expect(isChecked).toBe(true);
    
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});
