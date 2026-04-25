// SessionStart hook — loads pinned + recent long-term memory into short-term context
const { readMemory, writeMemory } = require('./lib/memory-manager');
const { readStdin } = require('./lib/read-stdin');
const { logError } = require('./lib/logger');

async function main() {
  try {
    const input = readStdin(); // { session_id: '...', hook_event_name: 'SessionStart', ... }

    // Load pinned context (immutable rules/instructions)
    const pinned = readMemory('pinned.md');

    // Load last 3 entries from long-term memory
    const longTerm = readMemory('long-term.md');
    const entries = longTerm.split(/(?=^## )/m).filter(s => s.trim());
    const recent = entries.slice(-3).join('\n');

    // Write initialized short-term context for this session
    // Support both field names: session_id (official API) and sessionId (legacy)
    const sessionContext = [
      `# Session Context`,
      `Loaded: ${new Date().toISOString()}`,
      `Session: ${input.session_id || input.sessionId || 'unknown'}`,
      '',
      pinned ? `## Pinned Context\n${pinned}` : '',
      recent ? `## Recent History\n${recent}` : '',
    ].filter(Boolean).join('\n') + '\n';

    writeMemory('short-term.md', sessionContext);

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { additionalContext: sessionContext }
    }));
  } catch (err) {
    logError('session-start', err);
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { additionalContext: '' } }));
  }
  process.exit(0);
}

main();
