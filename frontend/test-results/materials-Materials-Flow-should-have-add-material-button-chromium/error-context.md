# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: materials.spec.ts >> Materials Flow >> should have add material button
- Location: e2e\materials.spec.ts:45:3

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
  3  | test.describe('Materials Flow', () => {
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
  13 |   test('should display materials list', async ({ page }) => {
  14 |     await page.goto('/materials');
  15 |     await expect(page.locator('h1, h2')).toContainText(/materials|Materials/i);
  16 |     
  17 |     // Check for materials table or list
  18 |     const materialsList = page.locator('table, .list, [data-testid="materials-list"]');
  19 |     await expect(materialsList.first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should search materials', async ({ page }) => {
  23 |     await page.goto('/materials');
  24 |     
  25 |     // Look for search input
  26 |     const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
  27 |     if (await searchInput.count() > 0) {
  28 |       await searchInput.fill('cement');
  29 |       await page.waitForTimeout(1000);
  30 |       // Should filter results
  31 |     }
  32 |   });
  33 | 
  34 |   test('should display material details', async ({ page }) => {
  35 |     await page.goto('/materials');
  36 |     
  37 |     // Click on first material in the list
  38 |     const firstMaterial = page.locator('tr:first-child, .material-item:first-child, [data-testid="material-item"]').first();
  39 |     if (await firstMaterial.count() > 0) {
  40 |       await firstMaterial.click();
  41 |       await expect(page.locator('h1, h2')).toContainText(/material|Material/i);
  42 |     }
  43 |   });
  44 | 
  45 |   test('should have add material button', async ({ page }) => {
  46 |     await page.goto('/materials');
  47 |     
  48 |     const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
  49 |     if (await addButton.count() > 0) {
  50 |       await expect(addButton).toBeVisible();
  51 |     }
  52 |   });
  53 | 
  54 |   test('should filter materials by category', async ({ page }) => {
  55 |     await page.goto('/materials');
  56 |     
  57 |     // Look for category filter
  58 |     const categoryFilter = page.locator('select, [role="combobox"]').first();
  59 |     if (await categoryFilter.count() > 0) {
  60 |       await categoryFilter.click();
  61 |       await page.waitForTimeout(500);
  62 |     }
  63 |   });
  64 | 
  65 |   test('should display material stock information', async ({ page }) => {
  66 |     await page.goto('/materials');
  67 |     
  68 |     // Check for stock/quantity information
  69 |     const stockInfo = page.locator('text=Stock|Quantity|Available').first();
  70 |     if (await stockInfo.count() > 0) {
  71 |       await expect(stockInfo).toBeVisible();
  72 |     }
  73 |   });
  74 | });
  75 | 
```