/**
 * Python runtime setup utilities for gk init/update commands.
 * Handles venv creation, Windows embeddable Python download, and path detection.
 */

const fse = require('fs-extra')
const path = require('path')
const https = require('https')
const { execSync, spawnSync } = require('child_process')

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
 * Returns the available system python command name, or null if not found
 */
function getSystemPython() {
  if (commandExists('python3')) return 'python3'
  if (commandExists('python')) return 'python'
  return null
}

/**
 * Downloads and extracts Python Embeddable for Windows into targetDir/runtime/python.
 * Also installs pip into the embeddable environment.
 * Returns path to python.exe.
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

          // Bootstrap pip (required for installing dependencies)
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
 * Creates a virtualenv using the given system python inside targetDir/runtime/venv.
 * Returns path to the venv python binary, or null on failure.
 */
async function setupVenv(systemPython, targetDir) {
  const venvDir = path.join(targetDir, 'runtime', 'venv')
  try {
    // Use spawnSync (no shell) to avoid cmd.exe path escaping issues on Windows
    const result = spawnSync(systemPython, ['-m', 'venv', venvDir], { encoding: 'utf8' })
    if (result.status !== 0) return null
    return process.platform === 'win32'
      ? path.join(venvDir, 'Scripts', 'python.exe')
      : path.join(venvDir, 'bin', 'python')
  } catch {
    return null
  }
}

/**
 * Returns the path to an existing Python binary inside geminiTarget, or null if none found.
 * Checks venv (Win/Linux) and Windows embeddable paths.
 */
async function getExistingPython(geminiTarget) {
  const candidates = [
    path.join(geminiTarget, 'runtime', 'venv', 'Scripts', 'python.exe'), // Win venv
    path.join(geminiTarget, 'runtime', 'venv', 'bin', 'python'),         // Linux/Mac venv
    path.join(geminiTarget, 'runtime', 'python', 'python.exe'),          // Win embeddable
  ]
  for (const p of candidates) {
    if (await fse.pathExists(p)) return p
  }
  return null
}

module.exports = { getSystemPython, setupEmbeddablePython, setupVenv, getExistingPython }
