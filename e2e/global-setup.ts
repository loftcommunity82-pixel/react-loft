import { request } from "@playwright/test"
import { API_URL } from "./constants"

async function globalSetup() {
  const r = await request.newContext()
  const resp = await r.post(`${API_URL}/api/test/setup`)
  const body = await resp.json()
  if (!body.success) {
    throw new Error(`Test setup failed: ${JSON.stringify(body)}`)
  }
  console.log("Test setup complete:", body.data)
}

export default globalSetup
