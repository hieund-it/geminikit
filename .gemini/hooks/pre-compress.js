// PreCompress hook — summarizes short-term memory into long-term before Gemini CLI prunes history
const { readMemory, appendMemory } = require('./lib/memory-manager');
const { summarize } = require('./lib/gemini-summarizer');
const { readStdin } = require('./lib/read-stdin');
const { logError, logInfo } = require('./lib/logger');

async function main() {
  try {
    readStdin(); // consume stdin even if unused

    const shortTerm = readMemory('short-term.md');
    if (shortTerm.trim()) {
      const ts = new Date().toISOString();
      // Summarize before persisting to avoid duplicating raw content already in long-term
      const summary = await summarize(shortTerm);
      const content = summary || shortTerm; // fallback to raw if API unavailable
      appendMemory('long-term.md', `## Pre-Compress Snapshot — ${ts}\n${content}\n`);
      logInfo('pre-compress', summary ? 'Saved summarized pre-compress snapshot' : 'Saved raw pre-compress snapshot (API unavailable)');
    }

  } catch (err) {
    logError('pre-compress', err);
  }

  // Always exit 0 to allow Gemini CLI compression to proceed
  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
