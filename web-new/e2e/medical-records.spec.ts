import { test, expect } from "@playwright/test"

const MOCK_USER = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  roles: ["doctor"],
  isSuperAdmin: false,
}

const MOCK_TOKEN = "mock-jwt-token"

const MOCK_PATIENTS = [
  { id: "p1", name: "Rex", species: "Dog", owner: { name: "John Doe" } },
  { id: "p2", name: "Mittens", species: "Cat", owner: { name: "Jane Smith" } },
]

const MOCK_MEDICAL_RECORDS = [
  {
    id: "mr1",
    patientId: "p1",
    patient: { id: "p1", name: "Rex", species: "Dog" },
    visitDate: "2025-01-15T10:00:00Z",
    summary: "Annual checkup. Patient is in good health.",
    diagnoses: "Healthy",
    treatments: "None required",
    prescriptions: "Heartworm prevention",
    bodyConditionScore: 5,
    createdBy: { id: "user-1", name: "Dr. Alice" },
    vitalSigns: {
      temperature: 38.5,
      heartRate: 120,
      respiratoryRate: 20,
      weight: 25.0,
    },
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "mr2",
    patientId: "p2",
    patient: { id: "p2", name: "Mittens", species: "Cat" },
    visitDate: "2025-02-10T14:00:00Z",
    summary: "Follow-up for ear infection. Showing improvement.",
    diagnoses: "Otitis externa",
    treatments: "Ear cleaning and medication",
    createdBy: { id: "user-1", name: "Dr. Alice" },
    createdAt: "2025-02-10T14:00:00Z",
  },
]

const MOCK_LAB_RESULTS = [
  {
    id: "lr1",
    patientId: "p1",
    patient: { id: "p1", name: "Rex", species: "Dog" },
    panelId: "lp1",
    panel: { id: "lp1", name: "Complete Blood Count", category: "Hematology" },
    testDate: "2025-01-15T10:00:00Z",
    status: "normal",
    abnormalCount: 0,
    criticalCount: 0,
    values: [
      {
        id: "v1",
        testId: "t1",
        value: 45.2,
        displayValue: "45.20",
        status: "normal",
        refRangeMin: 37,
        refRangeMax: 55,
        test: { id: "t1", name: "Hematocrit", abbreviation: "HCT", unit: "%" },
      },
      {
        id: "v2",
        testId: "t2",
        value: 6.8,
        displayValue: "6.80",
        status: "normal",
        refRangeMin: 5.5,
        refRangeMax: 8.5,
        test: { id: "t2", name: "Hemoglobin", abbreviation: "HGB", unit: "g/dL" },
      },
    ],
    notes: "All values within normal limits.",
  },
  {
    id: "lr2",
    patientId: "p2",
    patient: { id: "p2", name: "Mittens", species: "Cat" },
    panelId: "lp2",
    panel: { id: "lp2", name: "Blood Chemistry", category: "Chemistry" },
    testDate: "2025-02-10T14:00:00Z",
    status: "abnormal",
    abnormalCount: 1,
    criticalCount: 0,
    values: [
      {
        id: "v3",
        testId: "t3",
        value: 2.1,
        displayValue: "2.10",
        status: "low",
        refRangeMin: 2.5,
        refRangeMax: 4.5,
        test: { id: "t3", name: "Creatinine", abbreviation: "CREA", unit: "mg/dL" },
      },
      {
        id: "v4",
        testId: "t4",
        value: 28,
        displayValue: "28.00",
        status: "normal",
        refRangeMin: 15,
        refRangeMax: 40,
        test: { id: "t4", name: "Blood Urea Nitrogen", abbreviation: "BUN", unit: "mg/dL" },
      },
    ],
  },
]

const MOCK_PRESCRIPTIONS = [
  {
    id: "rx1",
    patientId: "p1",
    patient: { name: "Rex", species: "Dog" },
    medication: "Carprofen",
    dosage: "75 mg",
    frequency: "Once daily",
    duration: "14 days",
    instructions: "Give with food",
    prescribedAt: "2025-01-15T10:00:00Z",
    expiresAt: "2025-02-15T10:00:00Z",
    refillsTotal: 1,
    refillsRemaining: 1,
    isControlled: false,
    veterinarian: "Dr. Alice",
    notes: "For post-operative pain management",
  },
  {
    id: "rx2",
    patientId: "p2",
    patient: { name: "Mittens", species: "Cat" },
    medication: "Amoxicillin",
    dosage: "50 mg",
    frequency: "Twice daily",
    duration: "10 days",
    prescribedAt: "2025-02-10T14:00:00Z",
    expiresAt: "2025-03-10T14:00:00Z",
    refillsTotal: 0,
    refillsRemaining: 0,
    isControlled: false,
    veterinarian: "Dr. Alice",
  },
]

const MOCK_MEDICATION_TEMPLATES = [
  {
    id: "mt1",
    name: "Carprofen",
    category: "NSAID",
    dosage: "75 mg",
    frequency: "Once daily",
    duration: "14 days",
    instructions: "Give with food",
    isCommon: true,
  },
  {
    id: "mt2",
    name: "Amoxicillin",
    category: "Antibiotic",
    dosage: "50 mg",
    frequency: "Twice daily",
    duration: "10 days",
    isCommon: true,
  },
]

async function setupAuthAndMocks(page: any) {
  await page.route("**/v1/auth/me", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    })
  })

  await page.route("**/v1/patients?limit=100", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_PATIENTS, meta: { total: 2, page: 1, limit: 100, totalPages: 1 } }),
    })
  })

  await page.route("**/v1/medical-records?limit=100", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_MEDICAL_RECORDS, meta: { total: 2, page: 1, limit: 100, totalPages: 1 } }),
    })
  })

  await page.route("**/v1/medical-records/mr1", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_MEDICAL_RECORDS[0] }),
    })
  })

  await page.route("**/v1/lab-results?limit=100", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_LAB_RESULTS, meta: { total: 2, page: 1, limit: 100, totalPages: 1 } }),
    })
  })

  await page.route("**/v1/lab-results/lr1", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_LAB_RESULTS[0] }),
    })
  })

  await page.route("**/v1/lab-results/lr2", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_LAB_RESULTS[1] }),
    })
  })

  await page.route("**/v1/prescriptions?limit=100", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_PRESCRIPTIONS, meta: { total: 2, page: 1, limit: 100, totalPages: 1 } }),
    })
  })

  await page.route("**/v1/prescriptions/rx1", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_PRESCRIPTIONS[0] }),
    })
  })

  await page.route("**/v1/medications", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_MEDICATION_TEMPLATES),
    })
  })

  await page.goto("/login")
  await page.evaluate((user: any) => {
    localStorage.setItem(
      "vet-clinic-auth",
      JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
    )
  }, MOCK_USER)
}

test.describe("Medical Records Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page)
  })

  test("list view renders", async ({ page }) => {
    await page.goto("/medical-records")
    await expect(page.getByRole("heading", { name: "Medical Records" })).toBeVisible()
    await expect(page.getByText("Annual checkup. Patient is in good health.")).toBeVisible()
    await expect(page.getByText("Follow-up for ear infection.")).toBeVisible()
    await page.screenshot({ path: "test-results/medical-records-list.png", fullPage: true })
  })

  test("detail view renders", async ({ page }) => {
    await page.goto("/medical-records")
    await page.getByText("Annual checkup. Patient is in good health.").click()
    await expect(page.getByRole("heading", { name: "Medical Record" })).toBeVisible()
    await expect(page.getByText("Visit Summary")).toBeVisible()
    await expect(page.getByText("Vital Signs")).toBeVisible()
    await page.screenshot({ path: "test-results/medical-records-detail.png", fullPage: true })
  })

  test("create form renders", async ({ page }) => {
    await page.goto("/medical-records")
    await page.getByRole("button", { name: "New Record" }).click()
    await expect(page.getByRole("heading", { name: "New Medical Record" })).toBeVisible()
    await expect(page.getByLabel("Patient")).toBeVisible()
    await expect(page.getByLabel("Visit Date")).toBeVisible()
    await page.screenshot({ path: "test-results/medical-records-create.png", fullPage: true })
  })
})

test.describe("Lab Results Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page)
  })

  test("list view renders", async ({ page }) => {
    await page.goto("/lab-results")
    await expect(page.getByRole("heading", { name: "Lab Results" })).toBeVisible()
    await expect(page.getByText("Complete Blood Count")).toBeVisible()
    await expect(page.getByText("Blood Chemistry")).toBeVisible()
    await page.screenshot({ path: "test-results/lab-results-list.png", fullPage: true })
  })

  test("detail view renders with color-coded values", async ({ page }) => {
    await page.goto("/lab-results")
    await page.getByText("Blood Chemistry").click()
    await expect(page.getByRole("heading", { name: "Blood Chemistry" })).toBeVisible()
    await expect(page.getByText("Test Values")).toBeVisible()
    await expect(page.getByText("Creatinine")).toBeVisible()
    await page.screenshot({ path: "test-results/lab-results-detail.png", fullPage: true })
  })
})

test.describe("Prescriptions Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page)
  })

  test("list view renders", async ({ page }) => {
    await page.goto("/prescriptions")
    await expect(page.getByRole("heading", { name: "Prescriptions" })).toBeVisible()
    await expect(page.getByText("Carprofen")).toBeVisible()
    await expect(page.getByText("Amoxicillin")).toBeVisible()
    await page.screenshot({ path: "test-results/prescriptions-list.png", fullPage: true })
  })

  test("detail view renders", async ({ page }) => {
    await page.goto("/prescriptions")
    await page.getByText("Carprofen").first().click()
    await expect(page.getByRole("heading", { name: "Carprofen" })).toBeVisible()
    await expect(page.getByText("Dr. Alice")).toBeVisible()
    await page.screenshot({ path: "test-results/prescriptions-detail.png", fullPage: true })
  })

  test("create form renders", async ({ page }) => {
    await page.goto("/prescriptions")
    await page.getByRole("button", { name: "New Prescription" }).click()
    await expect(page.getByRole("heading", { name: "New Prescription" })).toBeVisible()
    await expect(page.getByLabel("Patient")).toBeVisible()
    await page.screenshot({ path: "test-results/prescriptions-create.png", fullPage: true })
  })
})
