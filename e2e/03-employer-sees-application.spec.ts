import { test, expect } from "@playwright/test"
import { loginAs, navigateAndWaitForAuth } from "./auth"
import { TEST_EMAILS, BASE } from "./constants"

test.describe("Employer sees applications", () => {
  test("super employer can see all applications on platform", async ({ page }) => {
    // Login as employer (application already created by 02-job-application test)
    await loginAs(page, TEST_EMAILS.employer)

    // Navigate to admin applications page
    await navigateAndWaitForAuth(page, `${BASE}/admin/applications`)

    // Verify the application created by the previous test shows up
    await expect(page.getByText("E2E Test Position").first()).toBeVisible({ timeout: 15000 })
  })
})
