import { Page } from '@playwright/test';

/**
 * Helper to setup authenticated session
 */
export async function loginAsUser(page: Page, email: string = 'test@example.com') {
  // Mock login API
  await page.route('**/v1/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-token',
        user: { id: '1', email, name: 'Test User' }
      })
    });
  });

  // Set auth cookie
  await page.context().addCookies([
    {
      name: 'auth-token',
      value: 'mock-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
}

/**
 * Helper to mock common API responses
 */
export async function mockAuthenticatedAPIs(page: Page) {
  // Mock appointments
  await page.route('**/v1/appointments**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 3600000).toISOString(),
            reason: 'Annual checkup',
            status: 'scheduled',
            patient: { id: '1', name: 'Fluffy', species: 'Cat' },
            owner: { id: '1', name: 'John Doe' },
            doctor: { id: '1', name: 'Dr. Smith' }
          }
        ],
        meta: {}
      })
    });
  });

  // Mock patients
  await page.route('**/v1/patients**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            name: 'Fluffy',
            species: 'Cat',
            breed: 'Persian',
            owner: { id: '1', name: 'John Doe' }
          },
          {
            id: '2',
            name: 'Buddy',
            species: 'Dog',
            breed: 'Labrador',
            owner: { id: '2', name: 'Jane Smith' }
          }
        ],
        meta: { total: 2, totalPages: 1 }
      })
    });
  });

  // Mock owners
  await page.route('**/v1/owners', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'John Doe', phone: '555-0123', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', phone: '555-0456', email: 'jane@example.com' }
      ])
    });
  });
}

/**
 * Wait for MUI component to be ready
 */
export async function waitForMUIComponent(page: Page) {
  // Wait for MUI styles to be applied
  await page.waitForTimeout(100);
}

/**
 * Fill MUI text field with label
 */
export async function fillMUIField(page: Page, label: string, value: string) {
  const input = page.getByLabel(label);
  await input.fill(value);
}

/**
 * Select MUI dropdown option
 */
export async function selectMUIDropdownOption(page: Page, label: string, optionText: string) {
  // Click the dropdown to open it
  await page.getByLabel(label).click();
  // Select the option
  await page.getByRole('option', { name: optionText }).click();
}
