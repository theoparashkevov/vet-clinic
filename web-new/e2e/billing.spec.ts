import { test, expect } from "@playwright/test"

const BILLING_USER = {
  id: "user-billing",
  name: "Billing Clerk",
  email: "billing@vetclinic.com",
  roles: ["registrar"],
  isSuperAdmin: false,
}

const MOCK_TOKEN = "mock-jwt-token"

const MOCK_INVOICES = {
  data: [
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-0001",
      patientId: "pat-1",
      ownerId: "own-1",
      status: "sent",
      issueDate: "2026-04-15T00:00:00.000Z",
      dueDate: "2026-04-29T00:00:00.000Z",
      subtotal: 150.0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 150.0,
      patient: { name: "Bella", species: "Dog" },
      owner: { name: "John Smith" },
      items: [],
      payments: [],
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-0002",
      patientId: "pat-2",
      ownerId: "own-2",
      status: "paid",
      issueDate: "2026-04-20T00:00:00.000Z",
      dueDate: "2026-05-04T00:00:00.000Z",
      subtotal: 85.0,
      taxAmount: 5.0,
      discountAmount: 0,
      totalAmount: 90.0,
      patient: { name: "Whiskers", species: "Cat" },
      owner: { name: "Jane Doe" },
      items: [],
      payments: [
        { id: "pay-1", invoiceId: "inv-2", amount: 90.0, paymentMethod: "cash", status: "completed", paidAt: "2026-04-21T00:00:00.000Z", createdAt: "2026-04-21T00:00:00.000Z" },
      ],
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-2026-0003",
      patientId: "pat-3",
      ownerId: "own-3",
      status: "overdue",
      issueDate: "2026-03-01T00:00:00.000Z",
      dueDate: "2026-03-15T00:00:00.000Z",
      subtotal: 200.0,
      taxAmount: 0,
      discountAmount: 20.0,
      totalAmount: 180.0,
      patient: { name: "Thumper", species: "Rabbit" },
      owner: { name: "Bob Wilson" },
      items: [],
      payments: [],
    },
  ],
  meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
}

const MOCK_PATIENTS = {
  data: [
    { id: "pat-1", name: "Bella", species: "Dog", owner: { id: "own-1", name: "John Smith" } },
    { id: "pat-2", name: "Whiskers", species: "Cat", owner: { id: "own-2", name: "Jane Doe" } },
    { id: "pat-3", name: "Thumper", species: "Rabbit", owner: { id: "own-3", name: "Bob Wilson" } },
  ],
}

const MOCK_SERVICES = {
  data: [
    { id: "svc-1", name: "Consultation", defaultPrice: 50.0, serviceType: "CONSULTATION" },
    { id: "svc-2", name: "Vaccination", defaultPrice: 35.0, serviceType: "VACCINATION" },
    { id: "svc-3", name: "Surgery", defaultPrice: 250.0, serviceType: "SURGERY" },
  ],
}

async function setupAuth(page: import("@playwright/test").Page) {
  await page.route("**/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(BILLING_USER),
    })
  })

  await page.goto("/login")
  await page.evaluate(({ user, token }) => {
    localStorage.setItem(
      "vet-clinic-auth",
      JSON.stringify({ state: { user, token, isAuthenticated: true } })
    )
  }, { user: BILLING_USER, token: MOCK_TOKEN })
  await page.reload()
}

async function setupBillingApi(page: import("@playwright/test").Page) {
  await page.route("**/v1/invoices**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_INVOICES),
    })
  })

  await page.route("**/v1/patients**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PATIENTS),
    })
  })

  await page.route("**/v1/service-catalog**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SERVICES),
    })
  })
}

test.describe("Billing / Invoices", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupBillingApi(page)
  })

  test("invoices list page loads and shows table", async ({ page }) => {
    await page.goto("/billing/invoices")
    await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
    await expect(page.getByRole("cell", { name: /INV-2026-0001/ })).toBeVisible()
    await expect(page.getByRole("cell", { name: /Bella/ })).toBeVisible()
    await expect(page.getByRole("cell", { name: "sent" })).toBeVisible()
    await expect(page.getByRole("cell", { name: "paid" })).toBeVisible()
    await expect(page.getByRole("cell", { name: "overdue" })).toBeVisible()
    await expect(page.getByRole("button", { name: "New Invoice" })).toBeVisible()
    await page.screenshot({ path: "test-results/billing-invoices-list.png", fullPage: true })
  })

  test("invoice detail page loads", async ({ page }) => {
    await page.route("**/v1/invoices/inv-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_INVOICES.data[0] }),
      })
    })

    await page.goto("/billing/invoices/inv-1")
    await expect(page.getByRole("heading", { name: "INV-2026-0001" })).toBeVisible()
    await expect(page.getByText("Line Items")).toBeVisible()
    await expect(page.getByText("Summary")).toBeVisible()
    await expect(page.getByText("Payments")).toBeVisible()
    await expect(page.getByRole("button", { name: "Record Payment" })).toBeVisible()
    await page.screenshot({ path: "test-results/billing-invoice-detail.png", fullPage: true })
  })

  test("create invoice page loads", async ({ page }) => {
    await page.goto("/billing/invoices/new")
    await expect(page.getByRole("heading", { name: "New Invoice" })).toBeVisible()
    await expect(page.getByLabel("Patient")).toBeVisible()
    await expect(page.getByText("Line Items")).toBeVisible()
    await expect(page.getByRole("button", { name: "Create Invoice" })).toBeVisible()
    await page.screenshot({ path: "test-results/billing-invoice-create.png", fullPage: true })
  })

  test("record payment modal opens and validates", async ({ page }) => {
    await page.route("**/v1/invoices/inv-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_INVOICES.data[0] }),
      })
    })

    await page.goto("/billing/invoices/inv-1")
    await page.getByRole("button", { name: "Record Payment" }).click()
    await expect(page.getByRole("dialog", { name: "Record Payment" })).toBeVisible()
    await expect(page.getByLabel("Amount")).toBeVisible()
    await expect(page.getByLabel("Payment Method")).toBeVisible()
    await expect(page.getByLabel("Notes")).toBeVisible()
    await page.screenshot({ path: "test-results/billing-record-payment-modal.png", fullPage: true })
  })

  test("billing redirect works", async ({ page }) => {
    await page.goto("/billing")
    await expect(page).toHaveURL("/billing/invoices")
    await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()
  })
})
