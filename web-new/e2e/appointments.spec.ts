import { test, expect } from "@playwright/test"

const MOCK_USER = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  roles: ["doctor"],
  isSuperAdmin: false,
}

const MOCK_APPOINTMENTS = {
  data: [
    {
      id: "appt-1",
      startsAt: "2024-06-15T09:00:00.000Z",
      endsAt: "2024-06-15T09:30:00.000Z",
      status: "scheduled",
      reason: "Annual checkup",
      room: "Room 1",
      notes: null,
      patient: { id: "p1", name: "Rex", species: "Dog" },
      owner: { id: "o1", name: "John Doe" },
      doctor: { id: "user-1", name: "Dr. Alice" },
    },
    {
      id: "appt-2",
      startsAt: "2024-06-15T10:00:00.000Z",
      endsAt: "2024-06-15T10:30:00.000Z",
      status: "confirmed",
      reason: "Vaccination",
      room: null,
      notes: null,
      patient: { id: "p2", name: "Mittens", species: "Cat" },
      owner: { id: "o2", name: "Jane Smith" },
      doctor: { id: "user-2", name: "Dr. Bob" },
    },
    {
      id: "appt-3",
      startsAt: "2024-06-16T14:00:00.000Z",
      endsAt: "2024-06-16T14:30:00.000Z",
      status: "completed",
      reason: "Follow-up",
      room: "Room 2",
      notes: "Patient recovering well",
      patient: { id: "p3", name: "Buddy", species: "Dog" },
      owner: { id: "o3", name: "Sam Wilson" },
      doctor: { id: "user-1", name: "Dr. Alice" },
    },
  ],
  meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
}

const MOCK_DOCTORS = [
  { id: "user-1", name: "Dr. Alice", email: "alice@example.com" },
  { id: "user-2", name: "Dr. Bob", email: "bob@example.com" },
]

async function setupAuth(page: any) {
  await page.route("**/v1/auth/me", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    })
  })
}

async function setupAppointmentsApi(page: any) {
  await page.route("**/v1/appointments**", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_APPOINTMENTS),
    })
  })
  await page.route("**/v1/doctors", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_DOCTORS }),
    })
  })
}

test.describe("Appointments", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await setupAppointmentsApi(page)
  })

  test("list page loads with appointments table", async ({ page }) => {
    await page.evaluate((user: any) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)
    await page.goto("/appointments")
    await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible()
    await expect(page.getByText("Rex")).toBeVisible()
    await expect(page.getByText("Mittens")).toBeVisible()
    await expect(page.getByText("Buddy")).toBeVisible()
    await page.screenshot({ path: "e2e/screenshots/appointments-list.png", fullPage: true })
  })

  test("calendar page loads with weekly view", async ({ page }) => {
    await page.evaluate((user: any) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)
    await page.goto("/appointments/calendar")
    await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible()
    await expect(page.getByText("Calendar")).toBeVisible()
    await page.screenshot({ path: "e2e/screenshots/appointments-calendar.png", fullPage: true })
  })

  test("new appointment booking flow loads", async ({ page }) => {
    await page.route("**/v1/doctors", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_DOCTORS }),
      })
    })
    await page.evaluate((user: any) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)
    await page.goto("/appointments/new")
    await expect(page.getByRole("heading", { name: "Book Appointment" })).toBeVisible()
    await expect(page.getByText("Select a Doctor")).toBeVisible()
    await page.screenshot({ path: "e2e/screenshots/appointments-new.png", fullPage: true })
  })

  test("appointment detail page loads", async ({ page }) => {
    await page.route("**/v1/appointments/appt-1", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_APPOINTMENTS.data[0] }),
      })
    })
    await page.evaluate((user: any) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)
    await page.goto("/appointments/appt-1")
    await expect(page.getByRole("heading", { name: "Appointment Details" })).toBeVisible()
    await expect(page.getByText("Rex")).toBeVisible()
    await page.screenshot({ path: "e2e/screenshots/appointments-detail.png", fullPage: true })
  })
})
