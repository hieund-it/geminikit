/**
 * gk update — reinstalls gemini-kit globally from the npm registry.
 */

const { spawnSync } = require('child_process')
const path = require('path')
const fse = require('fs-extra')
const { intro, outro, confirm, log, cancel, isCancel } = require('@clack/prompts')
// Moved to top-level to surface module-load errors early
const init = require('./init')

// Safe package name pattern — prevents command injection if package.json is tampered
const PKG_NAME_PATTERN = /^[@a-z0-9/_.-]+$/i

module.exports = async function update() {
  const pkgRoot = path.join(__dirname, '../..')
  const pkg = require(path.join(pkgRoot, 'package.json'))

  const pkgName = pkg.name

  // Validate package name before passing to shell
  if (!pkgName || !PKG_NAME_PATTERN.test(pkgName)) {
    log.error(`Invalid package name in package.json: "${pkgName}"`)
    process.exit(1)
  }

  intro('[>] GeminiKit CLI - Update')

  try {
    log.step(`Running: npm install -g ${pkgName}`)
    // On Windows, npm is a .cmd file — must use npm.cmd or shell:true to resolve it
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const result = spawnSync(npmCmd, ['install', '-g', pkgName], { stdio: 'inherit', shell: false })
    if (result.status !== 0) throw new Error(`npm exited with code ${result.status}`)
    log.success('gemini-kit updated successfully!')

    // Check if current directory is a Gemini Kit project
    const targetDir = process.cwd()
    const geminiTarget = path.join(targetDir, '.gemini')

    if (await fse.pathExists(geminiTarget)) {
      log.info('Detected an existing .gemini/ folder in this project.')

      const shouldUpdate = await confirm({
        message: 'Update local project GeminiKit content?',
      })

      if (isCancel(shouldUpdate) || !shouldUpdate) {
        cancel('Project update skipped.')
        return
      }

      log.info('Updating project-local .gemini/ folder...')

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
        log.success('Project update completed. Existing libraries and data were preserved.')
      } catch (initErr) {
        // ROLLBACK: If init failed, restore the backup
        log.error('Project update failed: ' + initErr.message)
        log.warn('Restoring from backup...')
        if (await fse.pathExists(geminiTarget)) await fse.remove(geminiTarget)
        await fse.move(tempDir, geminiTarget)
        log.success('Project restored to its previous state.')
        return  // skip outro('Update complete') on partial failure
      }
    }

    outro('Update complete')
  } catch (err) {
    log.error('Update failed: ' + err.message)
    log.info(`  Try manually: npm install -g ${pkgName}`)
    process.exit(1)
  }
}
