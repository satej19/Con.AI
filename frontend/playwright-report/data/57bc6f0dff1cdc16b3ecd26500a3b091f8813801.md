# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects.spec.ts >> Projects Flow >> should display projects list
- Location: e2e\projects.spec.ts:13:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region [ref=e5]:
    - paragraph [ref=e12]: CONSTRUCTION OPERATIONS
    - heading "Welcome back." [level=1] [ref=e16]
    - paragraph [ref=e17]: Sign in to keep your materials, projects, and site decisions moving.
    - alert [ref=e18]:
      - generic [ref=e21]: Internal server error
    - generic [ref=e22]:
      - generic [ref=e23]: Work email
      - textbox "Work email" [ref=e28]:
        - /placeholder: name@company.com
        - text: admin@example.com
      - generic [ref=e29]: Password
      - textbox "Password" [ref=e35]:
        - /placeholder: Enter your password
        - text: admin123
      - generic [ref=e36]:
        - generic [ref=e37]:
          - checkbox "Remember me" [checked] [ref=e38]
          - generic [ref=e39]: Remember me
        - link "Forgot password?" [ref=e40] [cursor=pointer]:
          - /url: mailto:administrator@company.com?subject=Con.AI%20password%20reset
      - button "Sign in to workspace" [ref=e41] [cursor=pointer]
    - paragraph [ref=e44]: Access is managed by your organization administrator.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Projects Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login before each test
  6  |     await page.goto('/login');
  7  |     await page.fill('input[type="email"]', 'admin@example.com');
  8  |     await page.fill('input[type="password"]', 'admin123');
  9  |     await page.click('button[type="submit"]');
> 10 |     await page.waitForURL(/\/dashboard/, { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  11 |   });
  12 | 
  13 |   test('should display projects list', async ({ page }) => {
  14 |     await page.goto('/projects');
  15 |     await expect(page.locator('h1, h2')).toContainText(/projects|Projects/i);
  16 |     
  17 |     // Check for projects table or list
  18 |     const projectsList = page.locator('table, .list, [data-testid="projects-list"]');
  19 |     await expect(projectsList.first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should search projects', async ({ page }) => {
  23 |     await page.goto('/projects');
  24 |     
  25 |     // Look for search input
  26 |     const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
  27 |     if (await searchInput.count() > 0) {
  28 |       await searchInput.fill('Test');
  29 |       await page.waitForTimeout(1000);
  30 |       // Should filter results
  31 |     }
  32 |   });
  33 | 
  34 |   test('should navigate to project details', async ({ page }) => {
  35 |     await page.goto('/projects');
  36 |     
  37 |     // Click on first project in the list
  38 |     const firstProject = page.locator('tr:first-child, .project-item:first-child, [data-testid="project-item"]').first();
  39 |     if (await firstProject.count() > 0) {
  40 |       await firstProject.click();
  41 |       await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9]+/);
  42 |       await expect(page.locator('h1, h2')).toContainText(/project|Project/i);
  43 |     }
  44 |   });
  45 | 
  46 |   test('should display project dashboard', async ({ page }) => {
  47 |     await page.goto('/projects');
  48 |     
  49 |     // Navigate to first project
  50 |     const firstProject = page.locator('tr:first-child, .project-item:first-child').first();
  51 |     if (await firstProject.count() > 0) {
  52 |       await firstProject.click();
  53 |       
  54 |       // Check for project-specific dashboard elements
  55 |       await expect(page.locator('text=Dashboard|Statistics|Overview')).toBeVisible();
  56 |     }
  57 |   });
  58 | 
  59 |   test('should have add project button', async ({ page }) => {
  60 |     await page.goto('/projects');
  61 |     
  62 |     const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
  63 |     if (await addButton.count() > 0) {
  64 |       await expect(addButton).toBeVisible();
  65 |     }
  66 |   });
  67 | 
  68 |   test('should filter projects by status', async ({ page }) => {
  69 |     await page.goto('/projects');
  70 |     
  71 |     // Look for status filter
  72 |     const statusFilter = page.locator('select, [role="combobox"]').first();
  73 |     if (await statusFilter.count() > 0) {
  74 |       await statusFilter.click();
  75 |       // Select a status option
  76 |       await page.waitForTimeout(500);
  77 |     }
  78 |   });
  79 | });
  80 | 
```