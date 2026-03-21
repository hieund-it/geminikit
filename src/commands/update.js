/**
 * gk update — reinstalls gemini-kit globally from the GitHub
 * repository URL defined in package.json#repository.
 */

const { execSync } = require('child_process')
const pc = require('picocolors')

module.exports = function update() {
  const pkg = require('../../package.json')

  // Resolve repository URL from package.json
  const repoRaw = pkg.repository?.url || pkg.repository
  if (!repoRaw) {
    console.error(pc.red('✗ No repository URL found in package.json'))
    console.error('  Add: "repository": "github:username/gemini-kit"')
    process.exit(1)
  }

  // Normalize to npm-installable format: github:user/repo
  const repoUrl = repoRaw
    .replace('https://github.com/', 'github:')
    .replace('git+', '')
    .replace('.git', '')

  console.log(pc.cyan(`Updating gemini-kit from ${repoUrl}...`))
  console.log()

  try {
    execSync(`npm install -g ${repoUrl}`, { stdio: 'inherit' })
    console.log()
    console.log(pc.green('✓ gemini-kit updated successfully!'))
  } catch (err) {
    console.error()
    console.error(pc.red('✗ Update failed. Try manually:'))
    console.error(`  npm install -g ${repoUrl}`)
    process.exit(1)
  }
}
