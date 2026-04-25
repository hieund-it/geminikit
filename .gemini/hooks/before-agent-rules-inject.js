// BeforeAgent hook — injects compact dev rules + session context (deduped, 5min TTL)
// Also injects skill-specific context (no dedup) when .gemini/.skill-state.json present
// Fail-open: return empty output on error, never block agent
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { readStdin } = require('./lib/read-stdin');
const { logError, logInfo } = require('./lib/logger');
const { readSkillState } = require('./lib/skill-state-manager');
const { buildSkillContext } = require('./lib/skill-context-builder');

const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getStatePath(sessionId) {
  // Sanitize session_id to prevent path traversal via malformed IDs
  const safeId = String(sessionId).replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join('/tmp', `gk-rules-inject-${safeId}.json`);
}

function shouldInject(sessionId) {
  try {
    const raw = fs.readFileSync(getStatePath(sessionId), 'utf8');
    const { lastInjected } = JSON.parse(raw);
    return Date.now() - new Date(lastInjected).getTime() > DEDUP_TTL_MS;
  } catch {
    return true; // inject if state missing or unreadable
  }
}

function markInjected(sessionId) {
  try {
    fs.writeFileSync(getStatePath(sessionId), JSON.stringify({ lastInjected: new Date().toISOString() }));
  } catch { /* ignore */ }
}

function getGitBranch(cwd) {
  try {
    return execSync('git branch --show-current', { cwd, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch { return 'unknown'; }
}

function getActivePlanContext(cwd) {
  try {
    const plansDir = path.join(cwd, 'plans');
    if (!fs.existsSync(plansDir)) return '';
    const dirs = fs.readdirSync(plansDir)
      .filter(d => fs.statSync(path.join(plansDir, d)).isDirectory());
    for (const dir of dirs.sort().reverse()) {
      const planFile = path.join(plansDir, dir, 'plan.md');
      if (!fs.existsSync(planFile)) continue;
      const content = fs.readFileSync(planFile, 'utf8');
      const statusMatch = content.match(/^status:\s*(.+)$/m);
      const titleMatch = content.match(/^title:\s*"?(.+?)"?$/m);
      if (statusMatch && ['in_progress', 'pending'].includes(statusMatch[1].trim())) {
        return `Active plan: ${titleMatch?.[1] || dir} (${statusMatch[1].trim()})`;
      }
    }
  } catch { /* ignore */ }
  return '';
}

async function main() {
  try {
    const input = readStdin();
    // Official BeforeAgent API: { session_id, hook_event_name, prompt, cwd, transcript_path, timestamp }
    const { session_id = 'default', cwd = process.cwd() } = input;

    // Skill context: always inject (no dedup) — changes per skill session
    const skillState = readSkillState(cwd);
    let skillContext = '';
    try {
      skillContext = buildSkillContext(skillState, cwd);
    } catch (err) {
      logError('before-agent-rules-inject', 'skill context build failed: ' + err.message);
    }

    if (!shouldInject(session_id)) {
      // Rules deduped — only inject skill context if present
      if (skillContext) {
        process.stdout.write(JSON.stringify({
          hookSpecificOutput: { additionalContext: skillContext }
        }));
      } else {
        process.stdout.write(JSON.stringify({}));
      }
      process.exit(0);
    }

    const branch = getGitBranch(cwd);
    const planCtx = getActivePlanContext(cwd);

    const rulesContext = [
      `## Session`,
      `DateTime: ${new Date().toISOString()}  CWD: ${cwd}  Branch: ${branch}`,
      ``,
      `## Core Rules`,
      `- YAGNI · KISS · DRY — no speculative abstractions`,
      `- Max 200 LOC per file — split if exceeded`,
      `- kebab-case for JS/TS/Python/shell filenames`,
      planCtx ? `\n## Active Plan\n${planCtx}` : null,
    ].filter(s => s !== null && s !== undefined).join('\n');

    markInjected(session_id);
    logInfo('before-agent-rules-inject', `Injected context for session ${session_id}`);

    const context = [skillContext, rulesContext].filter(Boolean).join('\n\n');
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { additionalContext: context }
    }));
  } catch (err) {
    logError('before-agent-rules-inject', err);
    // Fail-open: return empty (don't block agent)
    process.stdout.write(JSON.stringify({}));
  }
  process.exit(0);
}

main();
