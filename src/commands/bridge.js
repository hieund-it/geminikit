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
const { getPythonPath, getBridgeDir, getBridgeScriptsDir, readAllTasks } = require('./bridge-utils')
const { bridgeStatus, bridgeReset } = require('./bridge-manage')

// ---------------------------------------------------------------------------
// gk bridge init [--plan <path>]
// ---------------------------------------------------------------------------

function bridgeInit(options) {
  intro('[>] GeminiKit CLI - Bridge Init')

  const bridgeDir = getBridgeDir()
  const scriptsDir = getBridgeScriptsDir()

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

  // Resolve plan path: use --plan flag or auto-detect most recent plan.md
  let planPath = options.plan
  if (!planPath) {
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

  const python = getPythonPath()
  const generatorScript = path.join(scriptsDir, 'task-generator.py')
  const s = spinner()
  s.start('Generating task queue...')

  const result = spawnSync(python, [
    generatorScript, '--plan', planPath, '--bridge-dir', bridgeDir,
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
  const tasks = readAllTasks(bridgeDir)

  if (tasks.length === 0) {
    log.error('No .bridge/state.json found. Run `gk bridge init` first.')
    outro('Aborted')
    process.exit(1)
  }

  const pending = tasks.filter(t => t.status === 'pending').length
  log.info(`Starting orchestrator — ${pending} pending task(s) of ${tasks.length} total`)

  const python = getPythonPath()
  const orchestratorScript = path.join(getBridgeScriptsDir(), 'orchestrator.py')
  const child = spawn(python, [orchestratorScript, '--bridge-dir', bridgeDir], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  child.on('error', err => {
    log.error(`Failed to start orchestrator: ${err.message}`)
    process.exit(1)
  })

  child.on('exit', code => {
    if (code === 0) outro(pc.green('Pipeline completed successfully.'))
    else outro(pc.red(`Orchestrator exited with code ${code}`))
  })
}

module.exports = { bridgeInit, bridgeStart, bridgeStatus, bridgeReset }
