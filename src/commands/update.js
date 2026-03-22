/**
 * gk update — reinstalls gemini-kit globally from the GitHub
 * repository URL defined in package.json#repository.
 */

const { execSync } = require('child_process')
const path = require('path')
const fse = require('fs-extra')
const pc = require('picocolors')

module.exports = async function update() {
  const pkgRoot = path.join(__dirname, '../..')
  const pkg = require(path.join(pkgRoot, 'package.json'))
  const init = require('./init')

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
    
    // Check if current directory is a Gemini Kit project
    const targetDir = process.cwd()
    const geminiTarget = path.join(targetDir, '.gemini')
    
    if (await fse.pathExists(geminiTarget)) {
      console.log(pc.cyan('\nDetected an existing .gemini/ folder in this project.'))
      console.log(pc.yellow('Would you like to update your project-local framework files to the latest version?'))
      console.log(pc.red('WARNING: This will overwrite default framework files but preserve your memory/runtime data.'))
      
      const confirmed = await init.askConfirmation(pc.bold('Confirm project update? (y/N): '))
      
      if (confirmed) {
        console.log(pc.blue('\nUpdating project-local .gemini/ folder...'))
        
        // Remove old files but we'll be careful in performInit (which already filters memory/runtime)
        // To be safe, we just call performInit after confirming overwrite intent
        await fse.remove(geminiTarget)
        
        const geminiSource = path.join(pkgRoot, 'scaffold')
        const geminiMdSource = path.join(pkgRoot, 'GEMINI.md')
        
        await init.performInit(geminiSource, geminiTarget, targetDir, geminiMdSource)
      } else {
        console.log(pc.gray('\nProject update skipped.'))
      }
    }
  } catch (err) {
    console.error()
    console.error(pc.red('✗ Update failed. Try manually:'))
    console.error(`  npm install -g ${repoUrl}`)
    process.exit(1)
  }
}
