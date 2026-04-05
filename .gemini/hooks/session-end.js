// SessionEnd hook — final long-term compress if needed, clears short-term memory
const { readMemory, writeMemory, countEntries } = require('./lib/memory-manager');
const { compressLongTerm, MAX_LONG_TERM_ENTRIES } = require('./lib/gemini-summarizer');
const { logError, logInfo } = require('./lib/logger');

function readStdin() {
  try {
    return JSON.parse(require('fs').readFileSync(0, 'utf8'));
  } catch (_) {
    return {};
  }
}

async function main() {
  try {
    readStdin(); // consume stdin even if unused

    // Final compress if long-term memory is overloaded
    if (countEntries('long-term.md') > MAX_LONG_TERM_ENTRIES) {
      const longTerm = readMemory('long-term.md');
      const entries = longTerm.split(/(?=^## )/m).filter(s => s.trim());
      const compressed = await compressLongTerm(entries);
      if (compressed) {
        const ts = new Date().toISOString();
        writeMemory('long-term.md', `## Session End Compress — ${ts}\n${compressed}\n`);
        logInfo('session-end', 'Long-term memory compressed at session end');
      }
    }

    // Reset short-term memory for next session
    writeMemory('short-term.md', `# Short-term Memory\n_Cleared at session end: ${new Date().toISOString()}_\n`);
    logInfo('session-end', 'Session cleanup complete');

  } catch (err) {
    logError('session-end', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
