import { test, expect } from "@playwright/test"
import { loginAs, navigateAndWaitForAuth } from "./auth"
import { TEST_EMAILS, BASE } from "./constants"

test.describe("Job application flow", () => {
  test("applicant can find a job and submit an application with cover letter", async ({ page }) => {
    await loginAs(page, TEST_EMAILS.applicant)
    await navigateAndWaitForAuth(page, `${BASE}/jobs/e2e-test-job`)

    await expect(page.getByText("E2E Test Position")).toBeVisible()

    await page.getByRole("button", { name: /apply now/i }).click()
    await page.getByText("Apply for This Position").click()

    const coverTextarea = page.getByPlaceholder(/tell us why you are excited/i)
    await coverTextarea.fill(
      "I am very excited about this E2E test position."
    )

    const applyResp = page.waitForResponse(
      (resp) => resp.url().includes("/jobs/e2e-test-job/apply"),
      { timeout: 15000 }
    )
    await page.getByRole("button", { name: /submit application/i }).click()
    const resp = await applyResp
    expect(resp.ok()).toBeTruthy()

    await expect(page.getByText("Application submitted")).toBeVisible({ timeout: 5000 })
  })
})
