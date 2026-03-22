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
 * Returns the available system python command name or path, or null if not found.
 * On Windows, it prioritizes using the `py.exe` launcher to find installed Pythons.
 */
function getSystemPython() {
  // On Windows, use the `py.exe` launcher for a more robust check
  if (process.platform === 'win32') {
    // The py launcher is the most reliable way to find installed Pythons on Windows.
    // It's usually at C:\Windows\py.exe. We check for it directly to avoid PATH issues.
    const pyLauncherPath = 'C:\\Windows\\py.exe';
    if (fse.existsSync(pyLauncherPath)) {
      try {
        // `py -0p` lists installed Pythons and their paths. Example:
        // -V:3.11 *        "C:\Python311\python.exe"
        const command = `"${pyLauncherPath}" -0p`;
        const output = execSync(command, { encoding: 'utf8' });
        const lines = output.trim().split('\n');

        // Find a valid python.exe path from the output, starting with the newest.
        for (const line of lines.reverse()) {
          const match = line.match(/"([^"]+\\python\.exe)"/);
          if (match && match[1]) {
            const pythonPath = match[1];
            // Verify the executable actually exists at that path before returning
            if (fse.existsSync(pythonPath)) {
              return pythonPath; // Return the full path to the executable
            }
          }
        }
      } catch (e) {
        // If `py -0p` fails for any reason, fall through to the simple PATH check.
      }
    }
  }

  // Fallback for non-Windows or if the py launcher method fails
  if (commandExists('python3')) return 'python3';
  if (commandExists('python')) return 'python';

  return null;
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

  // Escape single quotes for PowerShell single-quoted strings (e.g. paths with apostrophes)
  const psEscape = (p) => p.replace(/'/g, "''")

  return new Promise((resolve, reject) => {
    const file = fse.createWriteStream(zipPath)
    https.get(pythonUrl, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        try {
          execSync(`powershell -Command "Expand-Archive -Path '${psEscape(zipPath)}' -DestinationPath '${psEscape(pythonDir)}' -Force"`)
          fse.removeSync(zipPath)

          // Bootstrap pip (required for installing dependencies)
          const getPipPath = path.join(pythonDir, 'get-pip.py')
          execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '${psEscape(getPipPath)}'"`)
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
    const result = spawnSync(systemPython, ['-m', 'venv', venvDir], { encoding: 'utf8', timeout: 120000 })
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
