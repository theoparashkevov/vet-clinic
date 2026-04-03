import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // Mock auth/me to return 401 (not authenticated)
    await page.route('**/v1/auth/me', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' })
      });
    });

    // Mock appointments to return 401 too
    await page.route('**/v1/appointments**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' })
      });
    });

    await page.goto('/');
    
    // Should redirect to login (allow for query params)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login successfully', async ({ page }) => {
    // Mock auth/me - will be called after login
    await page.route('**/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: '1', name: 'Test User', email: 'test@example.com', role: 'staff' })
      });
    });

    // Mock login API
    await page.route('**/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          accessToken: 'mock-token', 
          user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'staff' } 
        })
      });
    });

    // Mock appointments API for post-login
    await page.route('**/v1/appointments**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: {} })
      });
    });

    await page.goto('/login');
    
    // Fill login form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Mock auth/me to return 401
    await page.route('**/v1/auth/me', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' })
      });
    });

    // Mock login API with error
    await page.route('**/v1/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    });

    await page.goto('/login');
    
    // Fill login form
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error - look for the error message text
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
