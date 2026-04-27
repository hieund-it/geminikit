/**
 * bridge-manage.js — bridgeStatus and bridgeReset subcommands.
 */

const path = require('path')
const fse = require('fs-extra')
const pc = require('picocolors')
const { intro, outro, log } = require('@clack/prompts')
const { getBridgeDir, readState, readAllTasks } = require('./bridge-utils')

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

  const SHOW_MAX = 50
  const taskStatusColor = {
    pending: pc.yellow, executing: pc.cyan, gemini_done: pc.blue,
    reviewing: pc.magenta, done: pc.green, failed: pc.red,
  }

  console.log(`\n${'ID'.padEnd(18)} ${'Title'.padEnd(35)} ${'Status'.padEnd(14)} Retries`)
  console.log('─'.repeat(75))
  for (const t of tasks.slice(0, SHOW_MAX)) {
    const cf = taskStatusColor[t.status] || pc.white
    const id = (t.id || '').padEnd(18)
    const title = (t.title || '').slice(0, 34).padEnd(35)
    const status = cf((t.status || '').padEnd(14))
    const retries = `${t.retry_count}/${t.max_retries}`
    console.log(`${id} ${title} ${status} ${retries}`)
  }

  if (tasks.length > SHOW_MAX) console.log(`  ... and ${tasks.length - SHOW_MAX} more`)
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

  const toReset = options.failedOnly ? tasks.filter(t => t.status === 'failed') : tasks
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
    fse.writeJsonSync(path.join(queueDir, `task-${task.id}.json`), task, { spaces: 2 })
    count++
  }

  const state = readState(bridgeDir) || {}
  const allTasks = readAllTasks(bridgeDir)
  const stats = {}
  for (const t of allTasks) stats[t.status] = (stats[t.status] || 0) + 1
  state.stats = stats
  state.pipeline_status = 'idle'
  state.updated_at = new Date().toISOString()
  fse.writeJsonSync(path.join(bridgeDir, 'state.json'), state, { spaces: 2 })

  log.success(`Reset ${count} task(s) to pending${options.failedOnly ? ' (failed only)' : ''}`)
  outro('Done. Run `gk bridge start` to retry.')
}

module.exports = { bridgeStatus, bridgeReset }
