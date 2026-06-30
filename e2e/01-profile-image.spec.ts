import { test, expect } from "@playwright/test"
import { loginAs } from "./auth"
import { TEST_EMAILS, BASE } from "./constants"

test.describe("Profile image upload", () => {
  test("applicant can upload a profile image", async ({ page }) => {
    await page.route("**/users/profile", async (route, request) => {
      if (request.method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        })
        return
      }
      await route.continue()
    })

    await loginAs(page, TEST_EMAILS.applicant)
    await page.goto(`${BASE}/profile`)
    await page.locator("#profile-image").waitFor({ state: "attached" })

    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    )

    await page.locator("#profile-image").setInputFiles({
      name: "test-avatar.png",
      mimeType: "image/png",
      buffer: png,
    })

    await expect(page.getByText("Photo updated")).toBeVisible({ timeout: 15000 })
    await expect(page.locator("img[src*='data:image']")).toBeVisible()
  })
})
