const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

export function reportScenario(scenarioName, endpoint, result) {
  if (result.pass) {
    console.log(`${GREEN}✅  Scenario: ${scenarioName}${RESET}`)
    console.log(`    ${endpoint}`)
  } else {
    console.log(`${RED}❌  Scenario: ${scenarioName}${RESET}`)
    console.log(`    ${endpoint}`)
    for (const msg of result.messages) {
      console.log(`${RED}    ${msg}${RESET}`)
    }
  }
}

export function reportSkipped(scenarioName) {
  console.log(`${YELLOW}⚠️   Scenario skipped: ${scenarioName} — missing required steps (When + Then status)${RESET}`)
}

export function reportSummary(passed, failed) {
  console.log('────────────────────────────────')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('────────────────────────────────')
}
