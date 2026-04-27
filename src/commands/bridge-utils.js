/**
 * bridge-utils.js — filesystem helpers shared by bridge subcommands.
 */

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

/** Locate Python: venv first (Windows + POSIX), then system python3/python. */
function getPythonPath() {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, '.gemini', 'skills', '.venv', 'Scripts', 'python.exe'),
    path.join(cwd, '.gemini', 'skills', '.venv', 'bin', 'python3'),
    'python3',
    'python',
  ]
  for (const p of candidates) {
    if (!p.includes(path.sep) || fs.existsSync(p)) return p
  }
  return 'python3'
}

/** Absolute path to .bridge/ in current project. */
function getBridgeDir() {
  return path.join(process.cwd(), '.bridge')
}

/** Absolute path to bridge/ Python scripts directory. */
function getBridgeScriptsDir() {
  return path.join(__dirname, '..', '..', 'bridge')
}

/** Read .bridge/state.json; returns null if missing. */
function readState(bridgeDir) {
  const statePath = path.join(bridgeDir, 'state.json')
  if (!fse.pathExistsSync(statePath)) return null
  try { return fse.readJsonSync(statePath) } catch { return null }
}

/** Read all task JSON files from .bridge/queue/; returns array. */
function readAllTasks(bridgeDir) {
  const queueDir = path.join(bridgeDir, 'queue')
  if (!fs.existsSync(queueDir)) return []
  return fs.readdirSync(queueDir)
    .filter(f => f.startsWith('task-') && f.endsWith('.json'))
    .sort()
    .map(f => {
      try { return fse.readJsonSync(path.join(queueDir, f)) } catch { return null }
    })
    .filter(Boolean)
}

module.exports = { getPythonPath, getBridgeDir, getBridgeScriptsDir, readState, readAllTasks }
