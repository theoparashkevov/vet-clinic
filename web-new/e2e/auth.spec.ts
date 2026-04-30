import { test, expect } from "@playwright/test"

const MOCK_USER = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  roles: ["doctor"],
  isSuperAdmin: false,
}

const MOCK_TOKEN = "mock-jwt-token"

test.describe("Auth flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test("login page loads with form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "Vet Clinic" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
  })

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Sign In" }).click()

    await expect(page.getByText("Email is required")).toBeVisible()
    await expect(page.getByText("Password is required")).toBeVisible()
  })

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("not-an-email")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign In" }).click()

    await expect(page.locator("form").getByText("Please enter a valid email address")).toBeVisible()
  })

  test("shows validation error for short password", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@example.com")
    await page.getByLabel("Password").fill("short")
    await page.getByRole("button", { name: "Sign In" }).click()

    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible()
  })

  test("shows error for invalid credentials", async ({ page }) => {
    await page.route("**/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password" }),
      })
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@example.com")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    await expect(page.locator("form").getByText("Invalid email or password")).toBeVisible()
  })

  test("successful login stores token and redirects to dashboard", async ({ page }) => {
    await page.route("**/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: MOCK_TOKEN, user: MOCK_USER }),
      })
    })
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      })
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill("alice@example.com")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Sign In" }).click()

    await expect(page).toHaveURL("/dashboard")
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()

    const token = await page.evaluate(() => {
      const stored = localStorage.getItem("vet-clinic-auth")
      return stored ? JSON.parse(stored).state.token : null
    })
    expect(token).toBe(MOCK_TOKEN)
  })

  test("redirects authenticated user away from login page", async ({ page }) => {
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      })
    })

    await page.goto("/login")
    await page.evaluate((user) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)

    await page.reload()
    await expect(page).toHaveURL("/dashboard")
  })

  test("protected route redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL("/login")
  })

  test("logout clears auth and redirects to login", async ({ page }) => {
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      })
    })

    await page.goto("/dashboard")
    await page.evaluate((user) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "mock-token", isAuthenticated: true } })
      )
    }, MOCK_USER)

    await page.reload()
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()

    await page.getByRole("button", { name: /alice/i }).click()
    await page.getByRole("menuitem", { name: "Log out" }).click()
    await expect(page).toHaveURL("/login")

    const token = await page.evaluate(() => {
      const stored = localStorage.getItem("vet-clinic-auth")
      return stored ? JSON.parse(stored).state.token : null
    })
    expect(token).toBeNull()
  })

  test("401 response redirects to login", async ({ page }) => {
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
    })

    await page.goto("/dashboard")
    await page.evaluate((user) => {
      localStorage.setItem(
        "vet-clinic-auth",
        JSON.stringify({ state: { user, token: "expired-token", isAuthenticated: true } })
      )
    }, MOCK_USER)

    await page.reload()
    await page.waitForURL("/login", { timeout: 10000 })
    await expect(page).toHaveURL("/login")
  })
})
