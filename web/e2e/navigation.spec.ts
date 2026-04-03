import { test, expect, Page } from '@playwright/test';

async function loginAsUser(page: Page, user = { email: 'test@example.com', password: 'password123' }) {
  await page.route('**/v1/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'mock-token',
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: user.email,
          role: 'staff'
        }
      })
    });
  });

  await page.route('**/v1/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: user.email,
        role: 'staff'
      })
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

async function mockCommonApis(page: Page) {
  await page.route('**/v1/appointments**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) });
  });
  await page.route('**/v1/patients**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) });
  });
  await page.route('**/v1/users**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) });
  });
}

test.describe('Navigation', () => {
  test('should navigate to Patients page', async ({ page }) => {
    await loginAsUser(page);
    await mockCommonApis(page);
    
    await page.goto('/');
    await expect(page.getByText('Today at a glance')).toBeVisible();
    
    await page.getByRole('button', { name: /Patients/i }).click();
    await expect(page).toHaveURL('/patients');
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
  });

  test('should navigate to Appointments page', async ({ page }) => {
    await loginAsUser(page);
    await mockCommonApis(page);
    
    await page.goto('/');
    await expect(page.getByText('Today at a glance')).toBeVisible();
    
    await page.getByRole('button', { name: /Appointments/i }).click();
    await expect(page).toHaveURL('/appointments');
    await expect(page.getByRole('heading', { name: 'Appointments' })).toBeVisible();
  });

  test('should navigate to Home', async ({ page }) => {
    await loginAsUser(page);
    await mockCommonApis(page);
    
    await page.goto('/patients');
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
    
    await page.getByRole('button', { name: /Home/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Today at a glance')).toBeVisible();
  });

  test('should navigate to Users page', async ({ page }) => {
    await loginAsUser(page);
    await mockCommonApis(page);
    
    await page.goto('/');
    await expect(page.getByText('Today at a glance')).toBeVisible();
    
    await page.getByRole('button', { name: /Users/i }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });
});
