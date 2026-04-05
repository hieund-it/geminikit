// PreCompress hook — snapshots short-term memory to long-term before Gemini CLI prunes history
const { readMemory, appendMemory } = require('./lib/memory-manager');
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

    const shortTerm = readMemory('short-term.md');
    if (shortTerm.trim()) {
      const ts = new Date().toISOString();
      appendMemory('long-term.md', `## Pre-Compress Snapshot — ${ts}\n${shortTerm}\n`);
      logInfo('pre-compress', 'Saved pre-compress snapshot to long-term.md');
    }

  } catch (err) {
    logError('pre-compress', err);
  }

  // Always exit 0 to allow Gemini CLI compression to proceed
  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
