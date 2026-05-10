import { describe, it } from 'node:test'
import { expect } from 'chai'
import { assertStatusCode, assertBodyExact, assertBodyField } from '../src/assertions.js'

describe('assertStatusCode', () => {
  it('TC-09: returns pass when actual Status Code matches expected', () => {
    const result = assertStatusCode(200, 200)
    expect(result.pass).to.be.true
  })

  it('TC-10: returns fail with diff message when Status Code does not match', () => {
    const result = assertStatusCode(404, 200)
    expect(result.pass).to.be.false
    expect(result.message).to.include('expected 200')
    expect(result.message).to.include('got 404')
  })
})

describe('assertBodyExact', () => {
  it('TC-11: passes in Partial mode when response contains defined fields (extra fields allowed)', () => {
    const actual = { id: 1, name: 'John', extra: 'ignored' }
    const expected = { id: 1, name: 'John' }
    const result = assertBodyExact(actual, expected)
    expect(result.pass).to.be.true
  })

  it('TC-12: fails when a defined field value does not match', () => {
    const actual = { id: 1, name: 'Jane' }
    const expected = { id: 1, name: 'John' }
    const result = assertBodyExact(actual, expected)
    expect(result.pass).to.be.false
    expect(result.message).to.be.a('string')
  })
})

describe('assertBodyField', () => {
  it('TC-13: passes when specified field value matches', () => {
    const result = assertBodyField({ name: 'John', age: 30 }, 'name', 'John')
    expect(result.pass).to.be.true
  })

  it('TC-14: returns fail with diff message when field value does not match', () => {
    const result = assertBodyField({ name: 'Jane' }, 'name', 'John')
    expect(result.pass).to.be.false
    expect(result.message).to.include('"name"')
    expect(result.message).to.include('John')
    expect(result.message).to.include('Jane')
  })
})
