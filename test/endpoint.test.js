import { describe, it } from 'node:test'
import { expect } from 'chai'
import { buildEndpoint } from '../src/endpoint.js'

describe('buildEndpoint', () => {
  it('TC-07: handles trailing slash on Base URL and leading slash on Path', () => {
    expect(buildEndpoint('http://localhost:3000/', '/api/health')).to.equal('http://localhost:3000/api/health')
  })

  it('TC-08: handles Base URL without trailing slash and Path with leading slash', () => {
    expect(buildEndpoint('http://localhost:3000', '/api/health')).to.equal('http://localhost:3000/api/health')
  })
})
