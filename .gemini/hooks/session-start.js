// SessionStart hook — loads pinned + recent long-term memory into short-term context
const { readMemory, writeMemory } = require('./lib/memory-manager');
const { logError } = require('./lib/logger');

// Cross-platform stdin reader using fd 0 (works on Unix, Windows Git Bash, WSL)
function readStdin() {
  try {
    return JSON.parse(require('fs').readFileSync(0, 'utf8'));
  } catch (_) {
    return {};
  }
}

async function main() {
  try {
    const input = readStdin(); // { event: 'SessionStart', sessionId: '...' }

    // Load pinned context (immutable rules/instructions)
    const pinned = readMemory('pinned.md');

    // Load last 3 entries from long-term memory
    const longTerm = readMemory('long-term.md');
    const entries = longTerm.split(/(?=^## )/m).filter(s => s.trim());
    const recent = entries.slice(-3).join('\n');

    // Write initialized short-term context for this session
    const sessionContext = [
      `# Session Context`,
      `Loaded: ${new Date().toISOString()}`,
      `Session: ${input.sessionId || 'unknown'}`,
      '',
      pinned ? `## Pinned Context\n${pinned}` : '',
      `## Recent History\n${recent}`,
    ].filter(Boolean).join('\n') + '\n';

    writeMemory('short-term.md', sessionContext);

  } catch (err) {
    logError('session-start', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
