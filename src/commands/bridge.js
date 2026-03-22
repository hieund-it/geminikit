/**
 * gk bridge — Claude-Gemini bridge pipeline subcommands.
 * Subcommands: init, start, status, reset
 */

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { spawnSync, spawn } = require('child_process')
const pc = require('picocolors')
const { intro, outro, log, spinner } = require('@clack/prompts')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// gk bridge init [--plan <path>]
// ---------------------------------------------------------------------------

function bridgeInit(options) {
  intro('[>] GeminiKit CLI - Bridge Init')

  const bridgeDir = getBridgeDir()
  const scriptsDir = getBridgeScriptsDir()

  // Create runtime directory structure
  fse.ensureDirSync(path.join(bridgeDir, 'queue'))
  fse.ensureDirSync(path.join(bridgeDir, 'logs'))
  fse.ensureDirSync(path.join(bridgeDir, 'rules'))
  log.info('Created .bridge/ directory structure')

  // Copy prompt templates to .bridge/rules/ if not already present
  const templatesDir = path.join(scriptsDir, 'templates')
  const rulesDir = path.join(bridgeDir, 'rules')
  for (const tmpl of ['task-prompt-template.md', 'review-prompt-template.md']) {
    const src = path.join(templatesDir, tmpl)
    const dst = path.join(rulesDir, tmpl)
    if (!fs.existsSync(dst) && fs.existsSync(src)) {
      fse.copySync(src, dst)
      log.info(`Copied template: ${tmpl}`)
    }
  }

  // Resolve plan path
  let planPath = options.plan
  if (!planPath) {
    // Auto-detect: find most recent plan.md in plans/
    const plansDir = path.join(process.cwd(), 'plans')
    if (fs.existsSync(plansDir)) {
      const dirs = fs.readdirSync(plansDir)
        .map(d => path.join(plansDir, d, 'plan.md'))
        .filter(p => fs.existsSync(p))
        .sort()
        .reverse()
      planPath = dirs[0] || null
    }
  }

  if (!planPath || !fs.existsSync(planPath)) {
    log.error('No plan.md found. Use --plan <path> to specify one.')
    outro('Aborted')
    process.exit(1)
  }

  log.info(`Using plan: ${planPath}`)

  // Run task-generator.py
  const python = getPythonPath()
  const generatorScript = path.join(scriptsDir, 'task-generator.py')
  const s = spinner()
  s.start('Generating task queue...')

  const result = spawnSync(python, [
    generatorScript,
    '--plan', planPath,
    '--bridge-dir', bridgeDir,
  ], { encoding: 'utf8', cwd: process.cwd() })

  if (result.status !== 0) {
    s.stop(pc.red('Failed'))
    log.error(result.stderr || result.stdout || 'Unknown error')
    outro('Aborted')
    process.exit(1)
  }

  s.stop(pc.green('Done'))
  console.log(result.stdout.trim())

  const tasks = readAllTasks(bridgeDir)
  log.success(`${tasks.length} task(s) queued in .bridge/queue/`)
  outro('Bridge initialized. Run `gk bridge start` to begin.')
}

// ---------------------------------------------------------------------------
// gk bridge start
// ---------------------------------------------------------------------------

function bridgeStart() {
  intro('[>] GeminiKit CLI - Bridge Start')

  const bridgeDir = getBridgeDir()
  const state = readState(bridgeDir)

  if (!state) {
    log.error('No .bridge/state.json found. Run `gk bridge init` first.')
    outro('Aborted')
    process.exit(1)
  }

  const tasks = readAllTasks(bridgeDir)
  if (tasks.length === 0) {
    log.error('No tasks in queue. Run `gk bridge init --plan <path>` first.')
    outro('Aborted')
    process.exit(1)
  }

  const pending = tasks.filter(t => t.status === 'pending').length
  log.info(`Starting orchestrator — ${pending} pending task(s) of ${tasks.length} total`)

  const python = getPythonPath()
  const orchestratorScript = path.join(getBridgeScriptsDir(), 'orchestrator.py')

  const child = spawn(python, [orchestratorScript, '--bridge-dir', bridgeDir], {
    cwd: process.cwd(),
    stdio: 'inherit',  // stream output directly to terminal
  })

  child.on('error', err => {
    log.error(`Failed to start orchestrator: ${err.message}`)
    process.exit(1)
  })

  child.on('exit', (code) => {
    if (code === 0) {
      outro(pc.green('Pipeline completed successfully.'))
    } else {
      outro(pc.red(`Orchestrator exited with code ${code}`))
    }
  })
}

// ---------------------------------------------------------------------------
// gk bridge status
// ---------------------------------------------------------------------------

function bridgeStatus() {
  intro('[>] GeminiKit CLI - Bridge Status')

  const bridgeDir = getBridgeDir()
  const state = readState(bridgeDir)

  if (!state) {
    log.warn('No .bridge/state.json found. Run `gk bridge init` first.')
    outro('Done')
    return
  }

  const stats = state.stats || {}
  const statusColor = {
    idle: pc.gray, running: pc.cyan, completed: pc.green,
    failed: pc.red, paused: pc.yellow,
  }
  const colorFn = statusColor[state.pipeline_status] || pc.white
  console.log(`\nPipeline: ${colorFn(state.pipeline_status.toUpperCase())}`)
  console.log(`Total tasks: ${state.total_tasks}`)
  console.log(`  ${pc.green('done')}: ${stats.done || 0}  ` +
    `${pc.yellow('pending')}: ${stats.pending || 0}  ` +
    `${pc.cyan('executing')}: ${stats.executing || 0}  ` +
    `${pc.red('failed')}: ${stats.failed || 0}`)

  const tasks = readAllTasks(bridgeDir)
  if (tasks.length === 0) {
    log.warn('No tasks found in queue.')
    outro('Done')
    return
  }

  // Show up to 50 tasks in a table
  const SHOW_MAX = 50
  const display = tasks.slice(0, SHOW_MAX)
  const taskStatusColor = {
    pending: pc.yellow, executing: pc.cyan, gemini_done: pc.blue,
    reviewing: pc.magenta, done: pc.green, failed: pc.red,
  }

  console.log(`\n${'ID'.padEnd(18)} ${'Title'.padEnd(35)} ${'Status'.padEnd(14)} Retries`)
  console.log('─'.repeat(75))
  for (const t of display) {
    const colorFn = taskStatusColor[t.status] || pc.white
    const id = (t.id || '').padEnd(18)
    const title = (t.title || '').slice(0, 34).padEnd(35)
    const status = colorFn((t.status || '').padEnd(14))
    const retries = `${t.retry_count}/${t.max_retries}`
    console.log(`${id} ${title} ${status} ${retries}`)
  }

  if (tasks.length > SHOW_MAX) {
    console.log(`  ... and ${tasks.length - SHOW_MAX} more`)
  }

  outro('Done')
}

// ---------------------------------------------------------------------------
// gk bridge reset [--failed-only]
// ---------------------------------------------------------------------------

function bridgeReset(options) {
  intro('[>] GeminiKit CLI - Bridge Reset')

  const bridgeDir = getBridgeDir()
  const tasks = readAllTasks(bridgeDir)

  if (tasks.length === 0) {
    log.warn('No tasks found. Nothing to reset.')
    outro('Done')
    return
  }

  const toReset = options.failedOnly
    ? tasks.filter(t => t.status === 'failed')
    : tasks

  if (toReset.length === 0) {
    log.info('No tasks match the reset criteria.')
    outro('Done')
    return
  }

  const queueDir = path.join(bridgeDir, 'queue')
  let count = 0
  for (const task of toReset) {
    task.status = 'pending'
    task.retry_count = 0
    task.review_result = null
    task.review_passed = null
    task.gemini_summary = null
    task.updated_at = new Date().toISOString()
    const taskPath = path.join(queueDir, `task-${task.id}.json`)
    fse.writeJsonSync(taskPath, task, { spaces: 2 })
    count++
  }

  // Update state.json stats
  const state = readState(bridgeDir) || {}
  const allTasks = readAllTasks(bridgeDir)
  const stats = {}
  for (const t of allTasks) {
    stats[t.status] = (stats[t.status] || 0) + 1
  }
  state.stats = stats
  state.pipeline_status = 'idle'
  state.updated_at = new Date().toISOString()
  fse.writeJsonSync(path.join(bridgeDir, 'state.json'), state, { spaces: 2 })

  log.success(`Reset ${count} task(s) to pending${options.failedOnly ? ' (failed only)' : ''}`)
  outro('Done. Run `gk bridge start` to retry.')
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { bridgeInit, bridgeStart, bridgeStatus, bridgeReset }
