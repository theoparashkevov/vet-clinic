# E2E Testing with Playwright

This directory contains end-to-end tests using [Playwright](https://playwright.dev/) for the vet clinic webapp.

## Setup

### 1. Install dependencies

```bash
cd web
npm install
```

### 2. Install Playwright browsers

```bash
npm run playwright:install
```

This downloads the browser binaries needed to run tests (Chromium, Firefox, WebKit).

## Running Tests

### Basic commands

```bash
# Run all tests headlessly (default)
npm run test:e2e

# Run tests with visible browser window
npm run test:e2e:headed

# Run tests in interactive UI mode (great for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/patients.spec.ts

# Run tests with debug mode
npm run test:e2e:debug

# Run specific test by name
npx playwright test -g "should search patients"
```

### Configuration

The `playwright.config.ts` includes:
- **5 browser projects**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Auto-wait**: Tests wait for the Next.js dev server to start
- **Artifacts**: Screenshots and videos captured on failure
- **Parallel execution**: Tests run in parallel for speed

## Test Structure

```
e2e/
├── home.spec.ts          # Dashboard tests
├── patients.spec.ts      # Patients page tests
├── navigation.spec.ts    # Navigation tests
├── auth.spec.ts          # Authentication tests
└── utils.ts              # Helper functions
```

## Key Testing Patterns

### Mocking API Responses

Most tests mock the backend API to avoid requiring a running server:

```typescript
await page.route('**/v1/patients**', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [], meta: {} })
  });
});
```

### Using MUI Testing Best Practices

Playwright works great with MUI's accessible components:

```typescript
// By label (MUI adds labels automatically)
await page.getByLabel('Search by name or species').fill('Fluffy');

// By role
await page.getByRole('button', { name: 'New patient' }).click();

// By text
await expect(page.getByText('No patients yet')).toBeVisible();
```

### Mobile Testing

Tests automatically run on mobile viewports too. Check `playwright.config.ts` for the `Mobile Chrome` and `Mobile Safari` projects.

## Writing New Tests

### 1. Use the codegen tool

```bash
npm run playwright:codegen
```

This opens your app in a browser and generates test code as you interact with it.

### 2. Follow the pattern

```typescript
import { test, expect } from '@playwright/test';
import { mockAuthenticatedAPIs } from './utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks
    await mockAuthenticatedAPIs(page);
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Click me' }).click();
    
    // Assert
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

## Debugging Failed Tests

### View trace

```bash
# Traces are captured on first retry
npx playwright show-trace test-results/trace.zip
```

### Screenshots & videos

Failed tests automatically capture:
- Screenshots in `test-results/`
- Videos in `test-results/`
- Trace files for step-by-step debugging

### Using the UI mode

```bash
npm run test:e2e:ui
```

The UI mode provides:
- Time travel debugging
- Network request inspection
- DOM snapshots
- Console logs

## CI/CD Integration

The tests are configured to run in CI:
- Retries enabled (2 retries)
- Single worker (for stability)
- HTML reporter generates reports

Add to your CI pipeline:

```yaml
- name: Run Playwright tests
  run: npm run test:e2e
- name: Upload test results
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Tips

1. **Mock APIs early** - Don't rely on a running backend; use `page.route()` to mock responses
2. **Prefer accessibility selectors** - Use `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors
3. **Wait for MUI animations** - MUI has small delays for animations; use `await expect().toBeVisible()` which auto-waits
4. **Run headed for debugging** - Use `--headed` to see the browser while tests run
5. **Use codegen for exploration** - `npm run playwright:codegen` is great for discovering selectors

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all tests |
| `npx playwright test --ui` | Open interactive UI |
| `npx playwright test --headed` | Show browser window |
| `npx playwright test --debug` | Step through tests |
| `npx playwright codegen http://localhost:3000` | Generate tests from browser |
| `npx playwright show-report` | View HTML report |
