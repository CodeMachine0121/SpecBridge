import { describe, it } from 'node:test'
import { expect } from 'chai'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const fixtures = (name) => path.join(__dirname, 'fixtures', name)

function run(args) {
  try {
    const stdout = execSync(`node ${root}/index.js ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return { code: 0, output: stdout }
  } catch (err) {
    return { code: err.status, output: (err.stdout ?? '') + (err.stderr ?? '') }
  }
}

describe('verify command — edge cases', () => {
  it('TC-20: exits with code 1 and error message when Feature File does not exist', () => {
    const { code, output } = run(`verify -f /nonexistent/path.feature -u http://localhost:3000`)
    expect(code).to.equal(1)
    expect(output).to.include('not found')
  })

  it('TC-21: exits with code 0 and warning when Feature File has no Scenarios', () => {
    const { code, output } = run(`verify -f ${fixtures('empty.feature')} -u http://localhost:3000`)
    expect(code).to.equal(0)
    expect(output).to.include('No scenarios found')
  })

  it('TC-22: skips Scenario with missing When step and prints yellow warning', () => {
    const { code, output } = run(`verify -f ${fixtures('missing-when.feature')} -u http://localhost:3000`)
    expect(code).to.equal(0)
    expect(output).to.include('skipped')
  })
})
