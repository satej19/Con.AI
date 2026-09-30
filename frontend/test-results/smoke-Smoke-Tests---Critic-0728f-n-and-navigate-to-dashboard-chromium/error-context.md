# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Tests - Critical Paths >> should login and navigate to dashboard
- Location: e2e\smoke.spec.ts:4:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
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
  3  | test.describe('Smoke Tests - Critical Paths', () => {
  4  |   test('should login and navigate to dashboard', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[type="email"]', 'admin@example.com');
  7  |     await page.fill('input[type="password"]', 'admin123');
  8  |     await page.click('button[type="submit"]');
  9  |     
  10 |     // Wait for navigation with longer timeout
> 11 |     await page.waitForURL(/\/dashboard/, { timeout: 30000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  12 |     await expect(page.locator('h1, h2')).toContainText(/dashboard|Dashboard/i);
  13 |   });
  14 | 
  15 |   test('should display login form', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  18 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  19 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should show error for invalid credentials', async ({ page }) => {
  23 |     await page.goto('/login');
  24 |     await page.fill('input[type="email"]', 'admin@example.com');
  25 |     await page.fill('input[type="password"]', 'wrongpassword');
  26 |     await page.click('button[type="submit"]');
  27 |     
  28 |     // Should stay on login page or show error
  29 |     await page.waitForTimeout(2000);
  30 |     const currentUrl = page.url();
  31 |     expect(currentUrl).toContain('/login');
  32 |   });
  33 | 
  34 |   test('should navigate to projects after login', async ({ page }) => {
  35 |     await page.goto('/login');
  36 |     await page.fill('input[type="email"]', 'admin@example.com');
  37 |     await page.fill('input[type="password"]', 'admin123');
  38 |     await page.click('button[type="submit"]');
  39 |     
  40 |     await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  41 |     
  42 |     // Try to navigate to projects
  43 |     const projectsLink = page.locator('a[href="/projects"], text=Projects').first();
  44 |     if (await projectsLink.count() > 0) {
  45 |       await projectsLink.click();
  46 |       await page.waitForTimeout(2000);
  47 |       expect(page.url()).toContain('/projects');
  48 |     }
  49 |   });
  50 | 
  51 |   test('should navigate to materials after login', async ({ page }) => {
  52 |     await page.goto('/login');
  53 |     await page.fill('input[type="email"]', 'admin@example.com');
  54 |     await page.fill('input[type="password"]', 'admin123');
  55 |     await page.click('button[type="submit"]');
  56 |     
  57 |     await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  58 |     
  59 |     // Try to navigate to materials
  60 |     const materialsLink = page.locator('a[href="/materials"], text=Materials').first();
  61 |     if (await materialsLink.count() > 0) {
  62 |       await materialsLink.click();
  63 |       await page.waitForTimeout(2000);
  64 |       expect(page.url()).toContain('/materials');
  65 |     }
  66 |   });
  67 | });
  68 | 
```