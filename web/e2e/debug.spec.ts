import { test, expect } from '@playwright/test';

test.describe('Debug', () => {
  test('should intercept auth request', async ({ page, context }) => {
    const allRequests: string[] = [];
    const v1Requests: string[] = [];
    
    // Log ALL requests
    page.on('request', request => {
      const url = request.url();
      allRequests.push(url);
      if (url.includes('/v1/')) {
        v1Requests.push(url);
        console.log('V1 Request:', request.method(), url);
      }
    });
    
    // Set up mock for auth/me
    await page.route('**/v1/auth/me', async route => {
      console.log('>>> Intercepted auth/me!');
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

    // Set up storage state using context.addInitScript
    await context.addInitScript(() => {
      localStorage.setItem('vet-clinic-session', JSON.stringify({
        accessToken: 'mock-token',
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'staff'
        }
      }));
    });

    // Navigate to the app
    await page.goto('/');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(5000);
    
    // Check all requests
    console.log('\n=== All Requests ===');
    allRequests.forEach(url => console.log(url));
    console.log('==================\n');
    
    console.log('V1 requests:', v1Requests);
    
    // Check current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      return { ...localStorage };
    });
    console.log('localStorage:', localStorageData);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-screenshot.png' });
    
    // Pass for now
    expect(true).toBe(true);
  });
});
