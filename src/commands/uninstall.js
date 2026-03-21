const fse = require('fs-extra')
const path = require('path')
const pc = require('picocolors')

module.exports = async function uninstall() {
  const targetDir = process.cwd()
  const geminiDir = path.join(targetDir, '.gemini')
  const geminiMd = path.join(targetDir, 'GEMINI.md')

  console.log(pc.blue('ðŸ—‘  Cleaning up Gemini Kit from current project...'))

  try {
    let cleaned = false
    if (await fse.pathExists(geminiDir)) {
      await fse.remove(geminiDir)
      console.log(pc.green('   Removed .gemini/ directory (including local Python runtime).'))
      cleaned = true
    }
    if (await fse.pathExists(geminiMd)) {
      await fse.remove(geminiMd)
      console.log(pc.green('   Removed GEMINI.md file.'))
      cleaned = true
    }

    if (!cleaned) {
      console.log(pc.yellow('   No Gemini Kit project found in this directory.'))
    } else {
      console.log(pc.green('\nâœ“ Project cleaned successfully.'))
    }

    console.log(pc.cyan('\nTo completely uninstall Gemini Kit from your system, run:'))
    console.log(pc.white('   npm uninstall -g gemini-kit'))
  } catch (err) {
    console.error(pc.red('âœ— Uninstall failed: ' + err.message))
    process.exit(1)
  }
}
