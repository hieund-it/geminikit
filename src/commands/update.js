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
        
        const geminiSource = path.join(pkgRoot, 'scaffold')
        const geminiMdSource = path.join(pkgRoot, 'GEMINI.md')
        
        // 1. Move current .gemini/ to a temp folder to protect it (The Backup)
        const tempDir = path.join(targetDir, '.gemini_backup_' + Date.now())
        await fse.move(geminiTarget, tempDir)
        
        try {
          // 2. Prepare new folder and restore existing data first
          await fse.ensureDir(geminiTarget)
          
          const memoryDir = path.join(tempDir, 'memory')
          const runtimeDir = path.join(tempDir, 'runtime')
          const envFile = path.join(tempDir, '.env')
          
          if (await fse.pathExists(memoryDir)) {
            await fse.move(memoryDir, path.join(geminiTarget, 'memory'))
          }
          if (await fse.pathExists(runtimeDir)) {
            await fse.move(runtimeDir, path.join(geminiTarget, 'runtime'))
          }
          if (await fse.pathExists(envFile)) {
            await fse.copy(envFile, path.join(geminiTarget, '.env'), { overwrite: true })
          }
          
          // 3. Perform init with overwrite=true (it will see the restored runtime)
          await init.performInit(geminiSource, geminiTarget, targetDir, geminiMdSource, true)
          
          // 4. Cleanup backup
          await fse.remove(tempDir)
          console.log(pc.green('Project update completed. Existing libraries and data were preserved.'))
        } catch (initErr) {
          // ROLLBACK: If init failed, restore the backup
          console.log(pc.yellow('\nâš™  Project update failed. Restoring from backup...'))
          if (await fse.pathExists(geminiTarget)) await fse.remove(geminiTarget)
          await fse.move(tempDir, geminiTarget)
          console.log(pc.green('âœ“ Project restored to its previous state.'))
        }
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
