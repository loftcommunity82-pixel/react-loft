import { test, expect } from "@playwright/test"
import { loginAs, navigateAndWaitForAuth } from "./auth"
import { TEST_EMAILS, BASE } from "./constants"

test.describe("Messaging flow", () => {
  test("employer can view conversation and send a message", async ({ page }) => {
    await loginAs(page, TEST_EMAILS.employer)
    await navigateAndWaitForAuth(page, `${BASE}/messages`)

    // Wait for the conversation with the applicant to appear in the list
    const conversationButton = page.getByRole("button", { name: /e2e applicant/i })
    await expect(conversationButton).toBeVisible({ timeout: 10000 })

    // Click on the conversation
    await conversationButton.click()

    // Verify the seed message appears in the chat area (the second match is the actual chat bubble)
    const chatMessages = page.getByText("Thank you for your application. We would like to schedule an interview.")
    await expect(chatMessages.last()).toBeVisible({ timeout: 5000 })

    // Type and send a new message
    const input = page.getByPlaceholder("Type a message...")
    await input.fill("We would like to invite you for an interview next week.")

    const sendButton = page.getByRole("button", { name: /send message/i })
    await sendButton.click()

    // Verify the sent message appears in the chat
    await expect(page.getByText("We would like to invite you for an interview next week.")).toBeVisible({ timeout: 5000 })
  })

  test("applicant can see messages from employer", async ({ page }) => {
    await loginAs(page, TEST_EMAILS.applicant)
    await navigateAndWaitForAuth(page, `${BASE}/messages`)

    // Wait for the conversation with the employer to appear
    const conversationButton = page.getByRole("button", { name: /e2e employer/i })
    await expect(conversationButton).toBeVisible({ timeout: 10000 })

    // Click on the conversation
    await conversationButton.click()

    // Verify the seed message appears in the chat area
    const chatMessages = page.getByText("Thank you for your application. We would like to schedule an interview.")
    await expect(chatMessages.last()).toBeVisible({ timeout: 5000 })
  })
})
