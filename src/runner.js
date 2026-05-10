import axios from 'axios'
import { buildEndpoint } from './endpoint.js'
import { assertStatusCode, assertBodyExact, assertBodyField } from './assertions.js'

export async function runScenario(scenario, baseUrl) {
  const endpoint = buildEndpoint(baseUrl, scenario.path)
  const messages = []

  try {
    const response = await axios({
      method: scenario.method,
      url: endpoint,
      data: scenario.requestBody ?? undefined,
      timeout: 30_000,
      validateStatus: () => true,
      responseType: 'text'
    })

    const statusResult = assertStatusCode(response.status, scenario.expectedStatus)
    if (!statusResult.pass) messages.push(statusResult.message)

    if (scenario.expectedBody !== null || scenario.expectedFields.length > 0) {
      let body
      try {
        body = JSON.parse(response.data)
      } catch {
        messages.push(`Response body is not valid JSON: ${String(response.data).slice(0, 100)}`)
        return { pass: false, messages }
      }

      if (scenario.expectedBody !== null) {
        const bodyResult = assertBodyExact(body, scenario.expectedBody)
        if (!bodyResult.pass) messages.push(bodyResult.message)
      }

      for (const { field, value } of scenario.expectedFields) {
        const fieldResult = assertBodyField(body, field, value)
        if (!fieldResult.pass) messages.push(fieldResult.message)
      }
    }
  } catch (err) {
    messages.push(`Connection failed: ${err.message}`)
    return { pass: false, messages }
  }

  return { pass: messages.length === 0, messages }
}

export async function runAll(scenarios, baseUrl) {
  let passed = 0
  let failed = 0
  const results = []

  for (const scenario of scenarios) {
    const result = await runScenario(scenario, baseUrl)
    results.push({ scenario, ...result })
    if (result.pass) passed++
    else failed++
  }

  return { passed, failed, results }
}
