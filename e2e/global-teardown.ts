import { request } from "@playwright/test"
import { API_URL } from "./constants"

async function globalTeardown() {
  const r = await request.newContext()
  const resp = await r.post(`${API_URL}/api/test/teardown`)
  const body = await resp.json()
  if (!body.success) {
    console.warn("Test teardown warning:", body)
  } else {
    console.log("Test teardown complete")
  }
}

export default globalTeardown
