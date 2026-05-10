import { describe, it } from 'node:test'
import { expect } from 'chai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFeatureFile } from '../src/parser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixture = (name) => path.join(__dirname, 'fixtures', name)

describe('parseFeatureFile', () => {
  it('TC-01: extracts HTTP Method and Path from a single Scenario', async () => {
    const scenarios = await parseFeatureFile(fixture('single-get.feature'))
    expect(scenarios).to.have.length(1)
    expect(scenarios[0].method).to.equal('GET')
    expect(scenarios[0].path).to.equal('/api/health')
  })

  it('TC-02: extracts expected Status Code from Scenario', async () => {
    const scenarios = await parseFeatureFile(fixture('with-status.feature'))
    expect(scenarios[0].expectedStatus).to.equal(200)
  })

  it('TC-03: extracts Request Body DocString as parsed JSON', async () => {
    const scenarios = await parseFeatureFile(fixture('with-request-body.feature'))
    expect(scenarios[0].requestBody).to.deep.equal({ name: 'Alice', email: 'alice@example.com' })
  })

  it('TC-04: extracts Response Body DocString for exact match', async () => {
    const scenarios = await parseFeatureFile(fixture('with-response-body.feature'))
    expect(scenarios[0].expectedBody).to.deep.equal({ id: 1, name: 'John' })
  })

  it('TC-05: extracts multiple field assertion rules', async () => {
    const scenarios = await parseFeatureFile(fixture('with-field-assertions.feature'))
    expect(scenarios[0].expectedFields).to.deep.equal([
      { field: 'name', value: 'John' },
      { field: 'email', value: 'john@example.com' }
    ])
  })

  it('TC-06: extracts all Scenarios from a multi-Scenario Feature File', async () => {
    const scenarios = await parseFeatureFile(fixture('multi-scenario.feature'))
    expect(scenarios).to.have.length(3)
    expect(scenarios[0].method).to.equal('GET')
    expect(scenarios[1].path).to.equal('/api/users/1')
    expect(scenarios[2].method).to.equal('POST')
    expect(scenarios[2].requestBody).to.deep.equal({ name: 'Bob' })
  })
})
