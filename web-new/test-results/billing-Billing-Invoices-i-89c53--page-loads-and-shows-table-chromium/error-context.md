# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing.spec.ts >> Billing / Invoices >> invoices list page loads and shows table
- Location: e2e/billing.spec.ts:139:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'New Invoice' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'New Invoice' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - generic [ref=e11]: Vet Clinic
      - navigation [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "Dashboard" [ref=e15] [cursor=pointer]:
              - /url: /dashboard
              - img [ref=e16]
              - generic [ref=e21]: Dashboard
          - listitem [ref=e22]:
            - link "Patients" [ref=e23] [cursor=pointer]:
              - /url: /patients
              - img [ref=e24]
              - generic [ref=e29]: Patients
          - listitem [ref=e30]:
            - link "Appointments" [ref=e31] [cursor=pointer]:
              - /url: /appointments
              - img [ref=e32]
              - generic [ref=e34]: Appointments
          - listitem [ref=e35]:
            - link "Billing" [ref=e36] [cursor=pointer]:
              - /url: /billing
              - img [ref=e37]
              - generic [ref=e39]: Billing
      - button "Collapse" [ref=e41]:
        - generic [ref=e42]:
          - img [ref=e43]
          - generic [ref=e45]: Collapse
    - banner [ref=e46]:
      - generic [ref=e48]: Thursday, April 30, 2026
      - button "Billing Clerk registrar BC" [ref=e50]:
        - generic [ref=e51]:
          - paragraph [ref=e52]: Billing Clerk
          - paragraph [ref=e53]: registrar
        - generic [ref=e55]: BC
    - main [ref=e56]:
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - heading "Invoices" [level=1] [ref=e61]
            - paragraph [ref=e62]: Manage billing and track payments.
          - link "New Invoice" [ref=e63] [cursor=pointer]:
            - /url: /billing/invoices/new
            - img
            - text: New Invoice
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]: Filters
            - generic [ref=e67]: Filter invoices by status, date, or patient.
          - generic [ref=e69]:
            - generic [ref=e70]:
              - text: Status
              - combobox [ref=e71]:
                - option "All Statuses" [selected]
                - option "Draft"
                - option "Sent"
                - option "Paid"
                - option "Partially Paid"
                - option "Overdue"
                - option "Cancelled"
            - generic [ref=e72]:
              - text: Patient
              - combobox [ref=e73]:
                - option "All Patients" [selected]
                - option "Bella"
                - option "Whiskers"
                - option "Thumper"
            - generic [ref=e74]:
              - text: From Date
              - textbox [ref=e75]
            - generic [ref=e76]:
              - text: To Date
              - textbox [ref=e77]
        - generic [ref=e78]:
          - generic [ref=e79]:
            - generic [ref=e80]: Invoices
            - generic [ref=e81]: 3 total invoices
          - table [ref=e84]:
            - rowgroup [ref=e85]:
              - 'row "Invoice # Patient Date Total Status Balance" [ref=e86]':
                - 'columnheader "Invoice #" [ref=e87]'
                - columnheader "Patient" [ref=e88]
                - columnheader "Date" [ref=e89]
                - columnheader "Total" [ref=e90]
                - columnheader "Status" [ref=e91]
                - columnheader "Balance" [ref=e92]
            - rowgroup [ref=e93]:
              - row "INV-2026-0001 Bella(Dog) Apr 15, 2026 $150.00 sent $150.00" [ref=e94] [cursor=pointer]:
                - cell "INV-2026-0001" [ref=e95]:
                  - link "INV-2026-0001" [ref=e96]:
                    - /url: /billing/invoices/inv-1
                - cell "Bella(Dog)" [ref=e97]:
                  - text: Bella
                  - generic [ref=e98]: (Dog)
                - cell "Apr 15, 2026" [ref=e99]
                - cell "$150.00" [ref=e100]
                - cell "sent" [ref=e101]:
                  - generic [ref=e102]: sent
                - cell "$150.00" [ref=e103]
              - row "INV-2026-0002 Whiskers(Cat) Apr 20, 2026 $90.00 paid $0.00" [ref=e104] [cursor=pointer]:
                - cell "INV-2026-0002" [ref=e105]:
                  - link "INV-2026-0002" [ref=e106]:
                    - /url: /billing/invoices/inv-2
                - cell "Whiskers(Cat)" [ref=e107]:
                  - text: Whiskers
                  - generic [ref=e108]: (Cat)
                - cell "Apr 20, 2026" [ref=e109]
                - cell "$90.00" [ref=e110]
                - cell "paid" [ref=e111]:
                  - generic [ref=e112]: paid
                - cell "$0.00" [ref=e113]
              - row "INV-2026-0003 Thumper(Rabbit) Mar 1, 2026 $180.00 overdue $180.00" [ref=e114] [cursor=pointer]:
                - cell "INV-2026-0003" [ref=e115]:
                  - link "INV-2026-0003" [ref=e116]:
                    - /url: /billing/invoices/inv-3
                - cell "Thumper(Rabbit)" [ref=e117]:
                  - text: Thumper
                  - generic [ref=e118]: (Rabbit)
                - cell "Mar 1, 2026" [ref=e119]
                - cell "$180.00" [ref=e120]
                - cell "overdue" [ref=e121]:
                  - generic [ref=e122]: overdue
                - cell "$180.00" [ref=e123]
  - region "Notifications alt+T"
```

# Test source

```ts
  47  |       payments: [
  48  |         { id: "pay-1", invoiceId: "inv-2", amount: 90.0, paymentMethod: "cash", status: "completed", paidAt: "2026-04-21T00:00:00.000Z", createdAt: "2026-04-21T00:00:00.000Z" },
  49  |       ],
  50  |     },
  51  |     {
  52  |       id: "inv-3",
  53  |       invoiceNumber: "INV-2026-0003",
  54  |       patientId: "pat-3",
  55  |       ownerId: "own-3",
  56  |       status: "overdue",
  57  |       issueDate: "2026-03-01T00:00:00.000Z",
  58  |       dueDate: "2026-03-15T00:00:00.000Z",
  59  |       subtotal: 200.0,
  60  |       taxAmount: 0,
  61  |       discountAmount: 20.0,
  62  |       totalAmount: 180.0,
  63  |       patient: { name: "Thumper", species: "Rabbit" },
  64  |       owner: { name: "Bob Wilson" },
  65  |       items: [],
  66  |       payments: [],
  67  |     },
  68  |   ],
  69  |   meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
  70  | }
  71  | 
  72  | const MOCK_PATIENTS = {
  73  |   data: [
  74  |     { id: "pat-1", name: "Bella", species: "Dog", owner: { id: "own-1", name: "John Smith" } },
  75  |     { id: "pat-2", name: "Whiskers", species: "Cat", owner: { id: "own-2", name: "Jane Doe" } },
  76  |     { id: "pat-3", name: "Thumper", species: "Rabbit", owner: { id: "own-3", name: "Bob Wilson" } },
  77  |   ],
  78  | }
  79  | 
  80  | const MOCK_SERVICES = {
  81  |   data: [
  82  |     { id: "svc-1", name: "Consultation", defaultPrice: 50.0, serviceType: "CONSULTATION" },
  83  |     { id: "svc-2", name: "Vaccination", defaultPrice: 35.0, serviceType: "VACCINATION" },
  84  |     { id: "svc-3", name: "Surgery", defaultPrice: 250.0, serviceType: "SURGERY" },
  85  |   ],
  86  | }
  87  | 
  88  | async function setupAuth(page: import("@playwright/test").Page) {
  89  |   await page.route("**/v1/auth/me", async (route) => {
  90  |     await route.fulfill({
  91  |       status: 200,
  92  |       contentType: "application/json",
  93  |       body: JSON.stringify(BILLING_USER),
  94  |     })
  95  |   })
  96  | 
  97  |   await page.goto("/login")
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
> 147 |     await expect(page.getByRole("button", { name: "New Invoice" })).toBeVisible()
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
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
  198 |     await expect(page).toHaveURL("/billing/invoices")
  199 |     await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
  200 |   })
  201 | })
  202 | 
```