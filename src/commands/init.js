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

  console.log(pc.blue('âš™  No system Python found. Downloading local Python (Windows)...'))
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
          console.log(pc.blue('   Extracting local Python...'))
          execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${pythonDir}' -Force"`)
          fse.removeSync(zipPath)
          
          // Setup pip for embeddable python (required for dependencies)
          console.log(pc.blue('   Setting up local pip...'))
          const getPipPath = path.join(pythonDir, 'get-pip.py')
          execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '${getPipPath}'"`)
          execSync(`"${path.join(pythonDir, 'python.exe')}" "${getPipPath}" --no-warn-script-location`)
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
  console.log(pc.blue(`âš™  Creating local virtual environment using system ${systemPython}...`))
  
  try {
    execSync(`"${systemPython}" -m venv "${venvDir}"`)
    const venvPython = process.platform === 'win32' 
      ? path.join(venvDir, 'Scripts', 'python.exe')
      : path.join(venvDir, 'bin', 'python')
    return venvPython
  } catch (err) {
    console.error(pc.red('âœ— Failed to create venv: ' + err.message))
    return null
  }
}

module.exports = async function init() {
  const pkgRoot = path.join(__dirname, '../..')
  const geminiSource = path.join(pkgRoot, '.gemini')
  const geminiMdSource = path.join(pkgRoot, 'GEMINI.md')
  const targetDir = process.cwd()
  const geminiTarget = path.join(targetDir, '.gemini')

  if (await fse.pathExists(geminiTarget)) {
    console.log(pc.yellow('âš   .gemini/ already exists. Remove it manually to reinitialize.'))
    process.exit(1)
  }

  try {
    // 1. Copy framework files
    await fse.copy(geminiSource, geminiTarget, {
      overwrite: false,
      filter: (src) => !src.includes(`${path.sep}memory${path.sep}`) && !src.includes(`${path.sep}runtime${path.sep}`) && !src.endsWith('.env')
    })
    await fse.copy(geminiMdSource, path.join(targetDir, 'GEMINI.md'), { overwrite: false })

    // 2. Setup Python Runtime
    let pythonPath = null
    const systemPython = getSystemPython()

    if (systemPython) {
      pythonPath = await setupVenv(systemPython, geminiTarget)
    } else if (process.platform === 'win32') {
      pythonPath = await setupEmbeddablePython(geminiTarget)
    } else {
      console.log(pc.red('âœ— No Python found. Please install Python 3 to use Gemini Kit skills.'))
    }

    // 3. Install dependencies locally
    if (pythonPath) {
      const reqFile = path.join(geminiTarget, 'requirements.txt')
      if (await fse.pathExists(reqFile)) {
        console.log(pc.blue('âš™  Installing Python dependencies locally...'))
        execSync(`"${pythonPath}" -m pip install -r "${reqFile}" --quiet`)
        console.log(pc.green('   Dependencies installed.'))
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
    console.error(pc.red('âœ— Init failed: ' + err.message))
    process.exit(1)
  }
}


