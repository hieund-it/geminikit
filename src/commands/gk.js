#!/usr/bin/env node

const { program } = require('commander')
const { version } = require('../../package.json')

// Verify Node.js version requirement
const [major] = process.versions.node.split('.').map(Number)
if (major < 18) {
  console.error(`gemini-kit requires Node.js >=18. Current: v${process.versions.node}`)
  process.exit(1)
}

program
  .name('gk')
  .description('Gemini Kit — multi-agent AI development framework for Gemini CLI')
  .version(version)

program
  .command('version')
  .description('Show the current version of gemini-kit')
  .action(() => {
    console.log(`gemini-kit v${version}`)
  })

program
  .command('init')
  .description('Scaffold .gemini/ and GEMINI.md into the current project')
  .action(() => require('./init')())

program
  .command('list')
  .description('List available agents and skills in the current project')
  .action(() => require('./list')())

program
  .command('update')
  .description('Update gemini-kit to the latest version from GitHub')
  .action(() => require('./update')())

program
  .command('uninstall')
  .description('Remove Gemini Kit and its local runtime from the current project')
  .action(() => require('./uninstall')())

program.parse()
