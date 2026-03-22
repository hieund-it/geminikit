/**
 * gk init — scaffolds .gemini/ and GEMINI.md into the current project
 * from the installed package's scaffold/ directory.
 */

const fse = require('fs-extra')
const path = require('path')
const pc = require('picocolors')
const { execSync, spawnSync } = require('child_process')
const readline = require('readline')
const { Spinner, renderProgressBar } = require('../utils/ui')
const { getSystemPython, setupEmbeddablePython, setupVenv, getExistingPython } = require('../utils/python-setup')

/**
 * Interactive confirmation prompt — returns true if user answers y/yes
 */
function askConfirmation(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close()
    resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
  }))
}

/**
 * Recursively collects all file paths from dir, skipping entries where filterFn returns false.
 * The filter receives the full path and applies to both files and directories.
 */
async function walkFiles(dir, filterFn) {
  const files = []
  const walk = async (cur) => {
    for (const e of await fse.readdir(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name)
      if (filterFn && !filterFn(full)) continue
      e.isDirectory() ? await walk(full) : files.push(full)
    }
  }
  await walk(dir)
  return files
}

/**
 * Copies files one by one with verbose output (→ filename per line).
 * Shows each relative path as it copies.
 */
async function copyFilesVerbose(files, srcBase, destBase, overwrite) {
  for (const src of files) {
    const rel = path.relative(srcBase, src)
    const dest = path.join(destBase, rel)
    await fse.ensureDir(path.dirname(dest))
    await fse.copy(src, dest, { overwrite })
    console.log(`  ${pc.gray('→')} ${rel}`)
  }
}

/**
 * Parses requirements.txt, lists all packages, then installs them in one batch.
 * Using batch install avoids Windows shell escaping issues with version specifiers (>=, <=, ~=).
 * Returns the number of packages installed.
 */
async function installPackagesVerbose(pythonPath, reqFile) {
  const pkgs = (await fse.readFile(reqFile, 'utf8'))
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  if (pkgs.length === 0) return 0

  // Pre-list packages before installing
  for (const pkg of pkgs) {
    console.log(`  ${pc.gray('→')} ${pc.cyan(pkg)}`)
  }

  // Use spawnSync (no shell) to avoid cmd.exe escaping issues with paths and version specifiers
  const spinner = new Spinner('Installing...')
  spinner.start()
  const result = spawnSync(pythonPath, ['-m', 'pip', 'install', '-r', reqFile, '--quiet'], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'pip install failed')
  spinner.stop(`${pkgs.length} packages installed`)
  return pkgs.length
}

/**
 * The main initialization logic, exported for reuse by 'update' command.
 * Runs 3 steps: copy files → setup Python → install packages.
 */
async function performInit(geminiSource, geminiTarget, targetDir, geminiMdSource, overwrite = false) {
  const startTime = Date.now()

  try {
    // Step 1: Copy framework files
    const filterFn = (src) => {
      const rel = path.relative(geminiSource, src)
      return !rel.startsWith('memory') && !rel.startsWith('runtime') && !src.endsWith('.env')
    }
    console.log(`${pc.cyan('[1/3]')} ${pc.bold('Copying framework files...')}`)
    const files = await walkFiles(geminiSource, filterFn)
    await copyFilesVerbose(files, geminiSource, geminiTarget, overwrite)
    if (await fse.pathExists(geminiMdSource)) {
      await fse.copy(geminiMdSource, path.join(targetDir, 'GEMINI.md'), { overwrite })
    }
    console.log(`${pc.cyan('[1/3]')} ${pc.green('✓')} Copied ${files.length} files ${renderProgressBar(1, 1)}`)

    // Step 2: Setup Python Runtime
    let pythonPath = await getExistingPython(geminiTarget)
    const systemPython = getSystemPython()

    if (pythonPath) {
      console.log(`\n${pc.cyan('[2/3]')} ${pc.green('✓')} Existing Python runtime reused`)
    } else if (systemPython) {
      const spinner = new Spinner(`[2/3] Creating Python venv with ${systemPython}...`)
      spinner.start()
      pythonPath = await setupVenv(systemPython, geminiTarget)
      spinner.stop(`[2/3] Python venv ready`)
    } else if (process.platform === 'win32') {
      const spinner = new Spinner('[2/3] Downloading Python (Windows embeddable)...')
      spinner.start()
      pythonPath = await setupEmbeddablePython(geminiTarget)
      spinner.stop(`[2/3] Python embeddable ready`)
    } else {
      console.log(pc.red('\n[2/3] ✗ No Python found. Install Python 3 to use Gemini Kit skills.'))
    }

    // Step 3: Install Python packages
    if (pythonPath) {
      const reqFile = path.join(geminiTarget, 'requirements.txt')
      if (await fse.pathExists(reqFile)) {
        console.log(`\n${pc.cyan('[3/3]')} ${pc.bold('Installing Python packages...')}`)
        const count = await installPackagesVerbose(pythonPath, reqFile)
        console.log(`${pc.cyan('[3/3]')} ${pc.green('✓')} ${count} packages installed ${renderProgressBar(1, 1)}`)
      }

      // Persist python path to settings
      const settingsPath = path.join(geminiTarget, 'settings.json')
      const settings = await fse.readJson(settingsPath).catch(() => ({}))
      settings.python_path = pythonPath
      await fse.writeJson(settingsPath, settings, { spaces: 2 })
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(pc.green(`\n✓ Gemini Kit initialized successfully! (${elapsed}s)`))
    console.log(`  - Local Python: ${pc.cyan(pythonPath || 'Not found')}`)
    console.log(`  - Config file:  ${pc.cyan('GEMINI.md')}\n`)
  } catch (err) {
    console.error(pc.red('\n✗ Error during initialization: ' + err.message))
    throw err
  }
}

module.exports = async function init() {
  const pkgRoot = path.join(__dirname, '../..')
  const geminiSource = path.join(pkgRoot, 'scaffold')
  const geminiMdSource = path.join(pkgRoot, 'GEMINI.md')
  const targetDir = process.cwd()
  const geminiTarget = path.join(targetDir, '.gemini')

  // Validation: Ensure source directory exists (now using 'scaffold/' for stability)
  if (!(await fse.pathExists(geminiSource))) {
    console.error(pc.red(`âœ— Source error: Could not find framework files in ${geminiSource}`))
    console.error(pc.yellow('  Try reinstalling with: npm install -g geminicli-kit --force'))
    process.exit(1)
  }

  if (await fse.pathExists(geminiTarget)) {
    console.log(pc.yellow(`âš   .gemini/ already exists in this project.`))
    console.log(pc.red('   WARNING: Initializing will OVERWRITE your current configuration and custom settings!'))
    console.log(pc.cyan('   Please back up your changes (e.g. settings.json, custom agents) before proceeding.\n'))
    
    const confirmed = await askConfirmation(pc.bold('   Are you sure you want to continue? (y/N): '))
    if (!confirmed) {
      console.log(pc.gray('\nâš™  Initialization cancelled. Your files were not changed.'))
      process.exit(0)
    }
    
    console.log(pc.blue('   Removing existing .gemini/ to reinitialize...'))
    await fse.remove(geminiTarget)
  }

  await performInit(geminiSource, geminiTarget, targetDir, geminiMdSource)
}

module.exports.performInit = performInit
module.exports.askConfirmation = askConfirmation


