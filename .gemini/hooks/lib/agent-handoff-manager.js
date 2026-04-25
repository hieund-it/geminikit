// agent-handoff-manager.js — read/write/clear agent handoff state
// File: .gemini/.agent-handoff-{session_id}.json
// Max size: 2KB. Fail-open on all operations.
const fs = require('fs');
const path = require('path');

const HANDOFF_DIR = '.gemini';
const MAX_SIZE = 2048;

function getHandoffPath(cwd, sessionId) {
  const safeId = String(sessionId).replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join(cwd, HANDOFF_DIR, `.agent-handoff-${safeId}.json`);
}

function readHandoff(cwd, sessionId) {
  try {
    const p = getHandoffPath(cwd, sessionId);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    if (raw.length > MAX_SIZE * 2) return null; // likely corrupted
    return JSON.parse(raw);
  } catch { return null; }
}

function writeHandoff(cwd, sessionId, handoff) {
  try {
    const json = JSON.stringify(handoff, null, 0);
    if (json.length > MAX_SIZE) return false; // too large
    fs.writeFileSync(getHandoffPath(cwd, sessionId), json);
    return true;
  } catch { return false; }
}

function clearHandoff(cwd, sessionId) {
  try { fs.unlinkSync(getHandoffPath(cwd, sessionId)); } catch {}
}

// Clear all stale handoff files (for session start cleanup)
function clearAllHandoffs(cwd) {
  try {
    const dir = path.join(cwd, HANDOFF_DIR);
    fs.readdirSync(dir)
      .filter(f => f.startsWith('.agent-handoff-') && f.endsWith('.json'))
      .forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
  } catch {}
}

module.exports = { readHandoff, writeHandoff, clearHandoff, clearAllHandoffs };
