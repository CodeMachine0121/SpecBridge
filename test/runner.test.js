import { describe, it, beforeEach, afterEach } from 'node:test'
import { expect } from 'chai'
import nock from 'nock'
import { runScenario, runAll } from '../src/runner.js'

const BASE = 'http://localhost:3000'

beforeEach(() => nock.cleanAll())
afterEach(() => nock.cleanAll())

describe('runScenario', () => {
  it('TC-15: returns pass when all assertions succeed', async () => {
    nock(BASE).get('/api/health').reply(200, { status: 'ok' })
    const scenario = {
      name: 'Health check',
      method: 'GET',
      path: '/api/health',
      requestBody: null,
      expectedStatus: 200,
      expectedBody: null,
      expectedFields: [{ field: 'status', value: 'ok' }]
    }
    const result = await runScenario(scenario, BASE)
    expect(result.pass).to.be.true
  })

  it('TC-16: returns fail when Status Code does not match', async () => {
    nock(BASE).get('/api/users/99').reply(404)
    const scenario = {
      name: 'Get user',
      method: 'GET',
      path: '/api/users/99',
      requestBody: null,
      expectedStatus: 200,
      expectedBody: null,
      expectedFields: []
    }
    const result = await runScenario(scenario, BASE)
    expect(result.pass).to.be.false
    expect(result.messages.some(m => m.includes('404'))).to.be.true
  })

  it('TC-17: runAll continues after a failed Scenario and reports all results', async () => {
    nock(BASE).get('/api/fail').reply(500)
    nock(BASE).get('/api/ok').reply(200)
    const scenarios = [
      { name: 'Fail', method: 'GET', path: '/api/fail', requestBody: null, expectedStatus: 200, expectedBody: null, expectedFields: [] },
      { name: 'Pass', method: 'GET', path: '/api/ok', requestBody: null, expectedStatus: 200, expectedBody: null, expectedFields: [] }
    ]
    const summary = await runAll(scenarios, BASE)
    expect(summary.passed).to.equal(1)
    expect(summary.failed).to.equal(1)
  })

  it('TC-18: returns fail with readable message on connection error', async () => {
    nock(BASE).get('/api/health').replyWithError('ECONNREFUSED')
    const scenario = {
      name: 'Health check',
      method: 'GET',
      path: '/api/health',
      requestBody: null,
      expectedStatus: 200,
      expectedBody: null,
      expectedFields: []
    }
    const result = await runScenario(scenario, BASE)
    expect(result.pass).to.be.false
    expect(result.messages[0]).to.include('Connection failed')
  })

  it('TC-19: returns fail when Response Body is not valid JSON', async () => {
    nock(BASE).get('/api/data').reply(200, 'not-json', { 'Content-Type': 'text/plain' })
    const scenario = {
      name: 'Data check',
      method: 'GET',
      path: '/api/data',
      requestBody: null,
      expectedStatus: 200,
      expectedBody: { key: 'value' },
      expectedFields: []
    }
    const result = await runScenario(scenario, BASE)
    expect(result.pass).to.be.false
    expect(result.messages[0]).to.include('not valid JSON')
  })
})
