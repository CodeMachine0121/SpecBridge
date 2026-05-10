import { generateMessages } from '@cucumber/gherkin'
import { IdGenerator, SourceMediaType } from '@cucumber/messages'
import { readFile } from 'node:fs/promises'

export async function parseFeatureFile(filePath) {
  const source = await readFile(filePath, 'utf8')
  const envelopes = generateMessages(source, filePath, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
    includeSource: false,
    includeGherkinDocument: false,
    includePickles: true,
    newId: IdGenerator.incrementing()
  })

  const errors = envelopes.filter(e => e.parseError)
  if (errors.length > 0) throw new Error(errors[0].parseError.message.text)

  return envelopes.filter(e => e.pickle).map(pickleToScenario)
}

function pickleToScenario(envelope) {
  const pickle = envelope.pickle
  const scenario = {
    name: pickle.name,
    method: null,
    path: null,
    requestBody: null,
    expectedStatus: null,
    expectedBody: null,
    expectedFields: []
  }

  for (const step of pickle.steps) {
    const text = step.text
    const docContent = step.argument?.docString?.content ?? null

    const actionMatch = text.match(/^I send a "([A-Z]+)" request to "([^"]+)"$/)
    if (actionMatch) {
      scenario.method = actionMatch[1]
      scenario.path = actionMatch[2]
      continue
    }

    if (/^the request body is:?$/.test(text) && docContent) {
      scenario.requestBody = JSON.parse(docContent)
      continue
    }

    const statusMatch = text.match(/^the response status should be (\d+)$/)
    if (statusMatch) {
      scenario.expectedStatus = parseInt(statusMatch[1], 10)
      continue
    }

    if (/^the response body should be:?$/.test(text) && docContent) {
      scenario.expectedBody = JSON.parse(docContent)
      continue
    }

    const fieldMatch = text.match(/^the response body should contain field "([^"]+)" with value "([^"]+)"$/)
    if (fieldMatch) {
      scenario.expectedFields.push({ field: fieldMatch[1], value: fieldMatch[2] })
    }
  }

  return scenario
}
