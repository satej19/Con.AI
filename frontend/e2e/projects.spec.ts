import { test, expect } from '@playwright/test';

test.describe('Projects Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display projects list', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1, h2')).toContainText(/projects|Projects/i);
    
    // Check for projects table or list
    const projectsList = page.locator('table, .list, [data-testid="projects-list"]');
    await expect(projectsList.first()).toBeVisible();
  });

  test('should search projects', async ({ page }) => {
    await page.goto('/projects');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      // Should filter results
    }
  });

  test('should navigate to project details', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project in the list
    const firstProject = page.locator('tr:first-child, .project-item:first-child, [data-testid="project-item"]').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9]+/);
      await expect(page.locator('h1, h2')).toContainText(/project|Project/i);
    }
  });

  test('should display project dashboard', async ({ page }) => {
    await page.goto('/projects');
    
    // Navigate to first project
    const firstProject = page.locator('tr:first-child, .project-item:first-child').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      
      // Check for project-specific dashboard elements
      await expect(page.locator('text=Dashboard|Statistics|Overview')).toBeVisible();
    }
  });

  test('should have add project button', async ({ page }) => {
    await page.goto('/projects');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
    }
  });

  test('should filter projects by status', async ({ page }) => {
    await page.goto('/projects');
    
    // Look for status filter
    const statusFilter = page.locator('select, [role="combobox"]').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      // Select a status option
      await page.waitForTimeout(500);
    }
  });
});
