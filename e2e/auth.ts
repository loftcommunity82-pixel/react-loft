import { Page } from "@playwright/test"
import { BASE, TEST_PASSWORD } from "./constants"

export async function loginAs(page: Page, email: string) {
  await page.goto(`${BASE}/login`)
  await page.waitForURL("**/login")

  await page.getByPlaceholder("name@example.com").fill(email)
  await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await page.waitForURL((url) => !url.pathname.includes("/login"))
}

export async function navigateAndWaitForAuth(page: Page, url: string) {
  // Navigate first, then wait for auth profile fetch to complete
  await page.goto(url)
  await page.waitForResponse(
    (resp) => resp.url().includes("/users/profile") && resp.status() === 200,
    { timeout: 20000 }
  )
  // Give React time to update state after auth response
  await page.waitForTimeout(1000)
}
