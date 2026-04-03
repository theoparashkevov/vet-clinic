import { test as base, expect, Page } from '@playwright/test';

// Define the fixture types
interface AuthenticatedFixtures {
  authenticatedPage: Page;
}

// Extend the base test with authenticated page fixture
export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Set up auth mock before page.goto
    await page.route('**/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'staff'
        })
      });
    });
    
    // Clear localStorage to ensure clean state
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await use(page);
  },
});

export { expect };
