/**
 * gk init — scaffolds .gemini/ and GEMINI.md into the current project
 * from the installed package's scaffold/ directory.
 */

const fse = require('fs-extra')
const path = require('path')
const pc = require('picocolors')
const { spawnSync } = require('child_process')
const { intro, outro, confirm, log, cancel, isCancel } = require('@clack/prompts')
const { createSpinner } = require('../utils/ui')
const { getSystemPython, setupEmbeddablePython, setupVenv, getExistingPython } = require('../utils/python-setup')

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
 * Uses plain console.log for per-file lines — clack decorators are too noisy for 20+ lines.
 */
async function copyFilesVerbose(files, srcBase, destBase, overwrite) {
  for (const src of files) {
    const rel = path.relative(srcBase, src)
    const dest = path.join(destBase, rel)
    await fse.ensureDir(path.dirname(dest))
    await fse.copy(src, dest, { overwrite })
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

  // Use spawnSync (no shell) to avoid cmd.exe escaping issues with paths and version specifiers
  const s = createSpinner()
  s.start('Installing packages...')
  const result = spawnSync(pythonPath, ['-m', 'pip', 'install', '-r', reqFile, '--quiet'], { encoding: 'utf8', timeout: 300000 })
  if (result.error?.code === 'ETIMEDOUT') throw new Error('pip install timed out (5 min)')
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'pip install failed')
  s.stop(`${pkgs.length} packages installed`)
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
    log.info('[1/3] Copying framework files...')
    const files = await walkFiles(geminiSource, filterFn)
    await copyFilesVerbose(files, geminiSource, geminiTarget, overwrite)
    if (await fse.pathExists(geminiMdSource)) {
      await fse.copy(geminiMdSource, path.join(targetDir, 'GEMINI.md'), { overwrite })
    }
    log.success(`[1/3] Copied ${files.length} files`)

    // Step 2: Setup Python Runtime
    let pythonPath = await getExistingPython(geminiTarget)
    const systemPython = getSystemPython()

    if (pythonPath) {
      log.success('[2/3] Existing Python runtime reused')
    } else if (systemPython) {
      const s = createSpinner()
      s.start(`[2/3] Creating Python venv with ${systemPython}...`)
      pythonPath = await setupVenv(systemPython, geminiTarget)
      s.stop('[2/3] Python venv ready')
    } else if (process.platform === 'win32') {
      const s = createSpinner()
      s.start('[2/3] Downloading Python (Windows embeddable)...')
      pythonPath = await setupEmbeddablePython(geminiTarget)
      s.stop('[2/3] Python embeddable ready')
    } else {
      throw new Error('No Python found. Install Python 3 to use Gemini Kit skills.')
    }

    // Step 3: Install Python packages
    if (pythonPath) {
      const reqFile = path.join(geminiTarget, 'requirements.txt')
      if (await fse.pathExists(reqFile)) {
        log.info('[3/3] Installing Python packages...')
        const count = await installPackagesVerbose(pythonPath, reqFile)
        log.success(`[3/3] ${count} packages installed`)
      }

      // Persist python path to settings
      const settingsPath = path.join(geminiTarget, 'settings.json')
      const settings = await fse.readJson(settingsPath).catch(() => ({}))
      settings.python_path = pythonPath
      await fse.writeJson(settingsPath, settings, { spaces: 2 })
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    log.success(`Gemini Kit initialized successfully! (${elapsed}s)`)
    log.info(`Local Python: ${pc.cyan(pythonPath || 'Not found')}`)
    log.info(`Config file:  ${pc.cyan('GEMINI.md')}`)
  } catch (err) {
    log.error('Error during initialization: ' + err.message)
    throw err
  }
}

module.exports = async function init() {
  const pkgRoot = path.join(__dirname, '../..')
  const geminiSource = path.join(pkgRoot, 'scaffold')
  const geminiMdSource = path.join(pkgRoot, 'GEMINI.md')
  const targetDir = process.cwd()
  const geminiTarget = path.join(targetDir, '.gemini')

  intro('[>] GeminiKit CLI - Init')

  // Validation: Ensure source directory exists (now using 'scaffold/' for stability)
  if (!(await fse.pathExists(geminiSource))) {
    log.error(`Source error: Could not find framework files in ${geminiSource}`)
    log.warn('Try reinstalling with: npm install -g geminicli-kit --force')
    process.exit(1)
  }

  if (await fse.pathExists(geminiTarget)) {
    log.warn('.gemini/ already exists in this project.')
    log.warn('WARNING: Initializing will OVERWRITE your current configuration and custom settings!')
    log.info('Please back up your changes (e.g. settings.json, custom agents) before proceeding.')

    const shouldContinue = await confirm({
      message: 'Are you sure you want to continue?',
    })

    if (isCancel(shouldContinue) || !shouldContinue) {
      cancel('Initialization cancelled. Your files were not changed.')
      process.exit(0)
    }

    log.info('Removing existing .gemini/ to reinitialize...')
    await fse.remove(geminiTarget)
  }

  try {
    await performInit(geminiSource, geminiTarget, targetDir, geminiMdSource)
    outro('Initialization complete')
  } catch (err) {
    log.error('Initialization failed: ' + err.message)
    process.exit(1)
  }
}

module.exports.performInit = performInit
module.exports.walkFiles = walkFiles
