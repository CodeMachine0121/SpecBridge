#!/usr/bin/env node
import { program } from 'commander'
import { existsSync } from 'node:fs'
import { parseFeatureFile } from './src/parser.js'
import { buildEndpoint } from './src/endpoint.js'
import { runScenario } from './src/runner.js'
import { reportScenario, reportSkipped, reportSummary } from './src/reporter.js'

program
  .name('specbridge')
  .description('Contract testing CLI — verify HTTP APIs against Gherkin feature files')
  .version('0.1.0')

program
  .command('verify')
  .description('Verify a contract defined in a Gherkin feature file')
  .requiredOption('-f, --file <path>', 'Path to the .feature file')
  .requiredOption('-u, --url <url>', 'Base URL of the service to test')
  .action(async (opts) => {
    if (!existsSync(opts.file)) {
      console.error(`\x1b[31mError: Feature File not found: ${opts.file}\x1b[0m`)
      process.exit(1)
    }

    let scenarios
    try {
      scenarios = await parseFeatureFile(opts.file)
    } catch (err) {
      console.error(`\x1b[31mError: Failed to parse feature file: ${err.message}\x1b[0m`)
      process.exit(1)
    }

    if (scenarios.length === 0) {
      console.log('\x1b[33mNo scenarios found in feature file\x1b[0m')
      process.exit(0)
    }

    let passed = 0
    let failed = 0

    for (const scenario of scenarios) {
      if (!scenario.method || scenario.expectedStatus === null) {
        reportSkipped(scenario.name)
        continue
      }

      const endpoint = buildEndpoint(opts.url, scenario.path)
      const result = await runScenario(scenario, opts.url)
      reportScenario(scenario.name, endpoint, result)

      if (result.pass) passed++
      else failed++
    }

    reportSummary(passed, failed)
    process.exit(failed > 0 ? 1 : 0)
  })

program.parse()
