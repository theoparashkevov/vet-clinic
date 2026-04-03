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

test.describe('Patients Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should display patients list with search', async ({ page }) => {
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, totalPages: 1 }
        })
      });
    });

    await page.goto('/patients');
    
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
    await expect(page.getByText('Search, create, and open patient records')).toBeVisible();
    await expect(page.getByLabel('Search by name or species')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New patient' }).first()).toBeVisible();
  });

  test('should search patients', async ({ page }) => {
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: '1', name: 'Fluffy', species: 'Cat', breed: 'Persian', owner: { name: 'John Doe' } }
          ],
          meta: { total: 1, totalPages: 1 }
        })
      });
    });

    await page.goto('/patients');
    
    await page.getByLabel('Search by name or species').fill('Fluffy');
    await page.getByRole('button', { name: 'Search' }).click();
    
    await expect(page.getByText('Fluffy')).toBeVisible();
    await expect(page.getByText('Cat')).toBeVisible();
  });

  test('should open create patient dialog', async ({ page }) => {
    await page.route('**/v1/owners', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'John Doe', phone: '555-0123', email: 'john@example.com' }
        ])
      });
    });

    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, totalPages: 1 }
        })
      });
    });

    await page.goto('/patients');
    await page.getByRole('button', { name: 'New patient' }).first().click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Patient' })).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Species')).toBeVisible();
    
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should create a new patient', async ({ page }) => {
    await page.route('**/v1/owners', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'John Doe', phone: '555-0123', email: 'john@example.com' }
        ])
      });
    });

    await page.route('**/v1/patients**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-patient-id',
            name: 'Buddy',
            species: 'Dog',
            breed: 'Labrador'
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            meta: { total: 0, totalPages: 1 }
          })
        });
      }
    });

    await page.goto('/patients');
    await page.getByRole('button', { name: 'New patient' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByLabel('Name', { exact: true }).fill('Buddy');
    await page.getByLabel('Species').fill('Dog');
    await page.getByLabel('Owner').click();
    await page.getByRole('option', { name: 'John Doe' }).click();
    
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate to patient detail', async ({ page }) => {
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'patient-1', name: 'Fluffy', species: 'Cat', breed: 'Persian', owner: { name: 'John Doe' } }
          ],
          meta: { total: 1, totalPages: 1 }
        })
      });
    });

    await page.goto('/patients');
    await expect(page.getByText('Fluffy')).toBeVisible();
    await page.getByRole('cell', { name: 'Fluffy' }).click();
    await expect(page).toHaveURL(/\/patients\/patient-1/);
  });

  test('should show pagination', async ({ page }) => {
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: Array(10).fill(null).map((_, i) => ({
            id: String(i),
            name: `Patient ${i}`,
            species: 'Dog',
            breed: null,
            owner: { name: 'Owner' }
          })),
          meta: { total: 25, totalPages: 3 }
        })
      });
    });

    await page.goto('/patients');
    await expect(page.locator('.MuiPagination-root')).toBeVisible();
    await expect(page.getByText('Showing 10 of 25 patients')).toBeVisible();
  });

  test('should show empty state when no patients', async ({ page }) => {
    await page.route('**/v1/patients**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, totalPages: 1 }
        })
      });
    });

    await page.goto('/patients');
    await expect(page.getByText('No patients yet')).toBeVisible();
    await expect(page.getByText('Create your first patient to get started.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create patient' })).toBeVisible();
  });
});
