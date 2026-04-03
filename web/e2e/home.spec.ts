import { test, expect, Page } from '@playwright/test';

// Helper function to log in
async function loginAsUser(page: Page, user = { email: 'test@example.com', password: 'password123' }) {
  // Mock the login API
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

  // Mock auth/me for session validation
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

  // Navigate to login
  await page.goto('/login');
  
  // Fill in login form
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  
  // Click sign in
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for redirect to home
  await expect(page).toHaveURL('/');
}

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should display the dashboard with stats and appointments', async ({ page }) => {
    // Mock the appointments API
    await page.route('**/v1/appointments**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1',
              startsAt: new Date().toISOString(),
              endsAt: new Date().toISOString(),
              reason: 'Checkup',
              status: 'scheduled',
              patient: { id: 'p1', name: 'Fluffy', species: 'Cat' },
              owner: { id: 'o1', name: 'John Doe' },
              doctor: { id: 'd1', name: 'Dr. Smith' }
            }
          ],
          meta: {}
        })
      });
    });

    // Mock patients API
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: '1', name: 'Fluffy' },
            { id: '2', name: 'Buddy' }
          ],
          meta: {}
        })
      });
    });

    // Reload page to get fresh data
    await page.reload();
    
    // Wait for the app to load and check page title
    await expect(page.getByText('Today at a glance')).toBeVisible();
    
    // Check for stat cards
    await expect(page.getByText('Appointments Today')).toBeVisible();
    await expect(page.getByText('Total Patients')).toBeVisible();
    
    // Check for appointments section
    await expect(page.getByText("Today's Appointments")).toBeVisible();
  });

  test('should show navigation sidebar', async ({ page }) => {
    // Mock APIs to prevent loading states
    await page.route('**/v1/appointments**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) });
    });
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) });
    });

    await page.reload();
    
    // Wait for the dashboard to load
    await expect(page.getByText('Today at a glance')).toBeVisible();
    
    // Check navigation items - look for the text in the page
    await expect(page.locator('header')).toContainText('Home');
    await expect(page.locator('header')).toContainText('Patients');
    await expect(page.locator('header')).toContainText('Appointments');
  });

  test('should handle loading state', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/v1/appointments**', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: {} })
      });
    });
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: {} })
      });
    });

    await page.reload();
    
    // First we should see loading
    await expect(page.getByText('Loading...')).toBeVisible({ timeout: 1000 });
    
    // Wait for loading to complete and content to be visible
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Today at a glance')).toBeVisible();
  });

  test('should display error state when API fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/v1/appointments**', route => route.abort());
    await page.route('**/v1/patients**', route => route.abort());

    await page.reload();
    
    // Should show error alert
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});
