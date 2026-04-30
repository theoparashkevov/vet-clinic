# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing.spec.ts >> Billing / Invoices >> billing redirect works
- Location: e2e/billing.spec.ts:196:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3001/billing/invoices"
Received: "http://localhost:3001/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3001/login"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Vet Clinic" [level=1] [ref=e6]
      - paragraph [ref=e7]: Sign in to your account
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Sign In
        - generic [ref=e11]: Enter your credentials to access the dashboard.
      - generic [ref=e13]:
        - generic [ref=e14]:
          - text: Email
          - textbox "Email" [ref=e15]:
            - /placeholder: name@vetclinic.com
        - generic [ref=e16]:
          - text: Password
          - textbox "Password" [ref=e17]:
            - /placeholder: ••••••••
        - button "Sign In" [ref=e18]
  - region "Notifications alt+T"
```

# Test source

```ts
  98  |   await page.evaluate(({ user, token }) => {
  99  |     localStorage.setItem(
  100 |       "vet-clinic-auth",
  101 |       JSON.stringify({ state: { user, token, isAuthenticated: true } })
  102 |     )
  103 |   }, { user: BILLING_USER, token: MOCK_TOKEN })
  104 |   await page.reload()
  105 | }
  106 | 
  107 | async function setupBillingApi(page: import("@playwright/test").Page) {
  108 |   await page.route("**/v1/invoices**", async (route) => {
  109 |     await route.fulfill({
  110 |       status: 200,
  111 |       contentType: "application/json",
  112 |       body: JSON.stringify(MOCK_INVOICES),
  113 |     })
  114 |   })
  115 | 
  116 |   await page.route("**/v1/patients**", async (route) => {
  117 |     await route.fulfill({
  118 |       status: 200,
  119 |       contentType: "application/json",
  120 |       body: JSON.stringify(MOCK_PATIENTS),
  121 |     })
  122 |   })
  123 | 
  124 |   await page.route("**/v1/service-catalog**", async (route) => {
  125 |     await route.fulfill({
  126 |       status: 200,
  127 |       contentType: "application/json",
  128 |       body: JSON.stringify(MOCK_SERVICES),
  129 |     })
  130 |   })
  131 | }
  132 | 
  133 | test.describe("Billing / Invoices", () => {
  134 |   test.beforeEach(async ({ page }) => {
  135 |     await setupAuth(page)
  136 |     await setupBillingApi(page)
  137 |   })
  138 | 
  139 |   test("invoices list page loads and shows table", async ({ page }) => {
  140 |     await page.goto("/billing/invoices")
  141 |     await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
  142 |     await expect(page.getByRole("cell", { name: /INV-2026-0001/ })).toBeVisible()
  143 |     await expect(page.getByRole("cell", { name: /Bella/ })).toBeVisible()
  144 |     await expect(page.getByRole("cell", { name: "sent" })).toBeVisible()
  145 |     await expect(page.getByRole("cell", { name: "paid" })).toBeVisible()
  146 |     await expect(page.getByRole("cell", { name: "overdue" })).toBeVisible()
  147 |     await expect(page.getByRole("button", { name: "New Invoice" })).toBeVisible()
  148 |     await page.screenshot({ path: "test-results/billing-invoices-list.png", fullPage: true })
  149 |   })
  150 | 
  151 |   test("invoice detail page loads", async ({ page }) => {
  152 |     await page.route("**/v1/invoices/inv-1", async (route) => {
  153 |       await route.fulfill({
  154 |         status: 200,
  155 |         contentType: "application/json",
  156 |         body: JSON.stringify({ data: MOCK_INVOICES.data[0] }),
  157 |       })
  158 |     })
  159 | 
  160 |     await page.goto("/billing/invoices/inv-1")
  161 |     await expect(page.getByRole("heading", { name: "INV-2026-0001" })).toBeVisible()
  162 |     await expect(page.getByText("Line Items")).toBeVisible()
  163 |     await expect(page.getByText("Summary")).toBeVisible()
  164 |     await expect(page.getByText("Payments")).toBeVisible()
  165 |     await expect(page.getByRole("button", { name: "Record Payment" })).toBeVisible()
  166 |     await page.screenshot({ path: "test-results/billing-invoice-detail.png", fullPage: true })
  167 |   })
  168 | 
  169 |   test("create invoice page loads", async ({ page }) => {
  170 |     await page.goto("/billing/invoices/new")
  171 |     await expect(page.getByRole("heading", { name: "New Invoice" })).toBeVisible()
  172 |     await expect(page.getByLabel("Patient")).toBeVisible()
  173 |     await expect(page.getByText("Line Items")).toBeVisible()
  174 |     await expect(page.getByRole("button", { name: "Create Invoice" })).toBeVisible()
  175 |     await page.screenshot({ path: "test-results/billing-invoice-create.png", fullPage: true })
  176 |   })
  177 | 
  178 |   test("record payment modal opens and validates", async ({ page }) => {
  179 |     await page.route("**/v1/invoices/inv-1", async (route) => {
  180 |       await route.fulfill({
  181 |         status: 200,
  182 |         contentType: "application/json",
  183 |         body: JSON.stringify({ data: MOCK_INVOICES.data[0] }),
  184 |       })
  185 |     })
  186 | 
  187 |     await page.goto("/billing/invoices/inv-1")
  188 |     await page.getByRole("button", { name: "Record Payment" }).click()
  189 |     await expect(page.getByRole("dialog", { name: "Record Payment" })).toBeVisible()
  190 |     await expect(page.getByLabel("Amount")).toBeVisible()
  191 |     await expect(page.getByLabel("Payment Method")).toBeVisible()
  192 |     await expect(page.getByLabel("Notes")).toBeVisible()
  193 |     await page.screenshot({ path: "test-results/billing-record-payment-modal.png", fullPage: true })
  194 |   })
  195 | 
  196 |   test("billing redirect works", async ({ page }) => {
  197 |     await page.goto("/billing")
> 198 |     await expect(page).toHaveURL("/billing/invoices")
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  199 |     await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
  200 |   })
  201 | })
  202 | 
```