/**
 * gk init — copies .gemini/ and GEMINI.md from the installed package
 * into the current working directory to initialize a new project.
 *
 * No separate scaffold/ directory needed — the package's own .gemini/
 * IS the scaffold, keeping a single source of truth.
 */

const fse = require('fs-extra')
const path = require('path')
const pc = require('picocolors')
const https = require('https')
const { execSync } = require('child_process')
const readline = require('readline')
const { Spinner } = require('../utils/ui')

/**
 * Interactive confirmation prompt
 */
function askConfirmation(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close()
    resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
  }))
}

/**
 * Checks if a command exists in the system PATH
 */
function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Gets the available system python command
 */
function getSystemPython() {
  if (commandExists('python3')) return 'python3'
  if (commandExists('python')) return 'python'
  return null
}

/**
 * Downloads and extracts Python Embeddable for Windows
 */
async function setupEmbeddablePython(targetDir) {
  const pythonDir = path.join(targetDir, 'runtime', 'python')
  if (await fse.pathExists(pythonDir)) return path.join(pythonDir, 'python.exe')

  await fse.ensureDir(pythonDir)

  const pythonUrl = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
  const zipPath = path.join(targetDir, 'runtime', 'python.zip')

  return new Promise((resolve, reject) => {
    const file = fse.createWriteStream(zipPath)
    https.get(pythonUrl, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        try {
          execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${pythonDir}' -Force"`)
          fse.removeSync(zipPath)
          
          // Setup pip for embeddable python (required for dependencies)
          const getPipPath = path.join(pythonDir, 'get-pip.py')
          execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '${getPipPath}'"`)
          execSync(`"${path.join(pythonDir, 'python.exe')}" "${getPipPath}" --no-warn-script-location`, { stdio: 'ignore' })
          fse.removeSync(getPipPath)
          
          resolve(path.join(pythonDir, 'python.exe'))
        } catch (err) { reject(err) }
      })
    }).on('error', (err) => { reject(err) })
  })
}

/**
 * Creates a Virtual Environment using system Python
 */
async function setupVenv(systemPython, targetDir) {
  const venvDir = path.join(targetDir, 'runtime', 'venv')
  
  try {
    execSync(`"${systemPython}" -m venv "${venvDir}"`, { stdio: 'ignore' })
    const venvPython = process.platform === 'win32' 
      ? path.join(venvDir, 'Scripts', 'python.exe')
      : path.join(venvDir, 'bin', 'python')
    return venvPython
  } catch (err) {
    return null
  }
}

/**
 * The main initialization logic, exported for reuse by 'update' command
 */
async function performInit(geminiSource, geminiTarget, targetDir, geminiMdSource) {
  const spinner = new Spinner('Scaffolding Gemini Kit framework...')
  spinner.start()
  
  try {
    // 1. Copy framework files
    await fse.copy(geminiSource, geminiTarget, {
      overwrite: false,
      filter: (src) => {
        const relative = path.relative(geminiSource, src)
        return !relative.startsWith('memory') && !relative.startsWith('runtime') && !src.endsWith('.env')
      }
    })
    
    if (await fse.pathExists(geminiMdSource)) {
      await fse.copy(geminiMdSource, path.join(targetDir, 'GEMINI.md'), { overwrite: false })
    }
    
    spinner.stop('Framework files copied.')

    // 2. Setup Python Runtime
    let pythonPath = null
    const systemPython = getSystemPython()

    if (systemPython) {
      spinner.update(`Creating virtual environment with system ${systemPython}...`)
      pythonPath = await setupVenv(systemPython, geminiTarget)
    } else if (process.platform === 'win32') {
      spinner.update('No system Python found. Downloading local Python (Windows)...')
      pythonPath = await setupEmbeddablePython(geminiTarget)
    } else {
      console.log(pc.red('\nâœ— No Python found. Please install Python 3 to use Gemini Kit skills.'))
    }

    // 3. Install dependencies locally
    if (pythonPath) {
      const reqFile = path.join(geminiTarget, 'requirements.txt')
      if (await fse.pathExists(reqFile)) {
        spinner.update('Installing Python dependencies locally...')
        execSync(`"${pythonPath}" -m pip install -r "${reqFile}" --quiet`)
      }

      // Update settings.json with the project-local python path
      const settingsPath = path.join(geminiTarget, 'settings.json')
      const settings = await fse.readJson(settingsPath).catch(() => ({}))
      settings.python_path = pythonPath
      await fse.writeJson(settingsPath, settings, { spaces: 2 })
    }

    console.log(pc.green('\nâœ“ Gemini Kit initialized successfully!'))
    console.log(`  - Local Python: ${pc.cyan(pythonPath || 'Not found')}`)
    console.log(`  - Config file:  ${pc.cyan('GEMINI.md')}\n`)
  } catch (err) {
    spinner.stop('Initialization failed.', true)
    console.error(pc.red('\nâœ— Error: ' + err.message))
    process.exit(1)
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
    console.error(pc.yellow('  Try reinstalling with: npm install -g github:hieund-it/geminikit --force'))
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


