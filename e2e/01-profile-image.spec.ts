import { test, expect } from "@playwright/test"
import { loginAs } from "./auth"
import { TEST_EMAILS, BASE } from "./constants"

test.describe("Profile image upload", () => {
  test("applicant can upload a profile image via Uploadcare", async ({ page }) => {
    await page.route("**upload.uploadcare.com**", async (route) => {
      const url = route.request().url()
      if (url.includes("/base/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ file: "mock-uuid-12345" }),
        })
        return
      }
      if (url.includes("/info/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            file_id: "mock-uuid-12345",
            original_filename: "test-avatar.png",
            size: 123,
            is_stored: true,
            is_ready: true,
            mime_type: "image/png",
            image_info: { width: 1, height: 1 },
          }),
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
    await expect(page.locator("img[src*='ucarecdn.com']")).toBeVisible()
  })
})
