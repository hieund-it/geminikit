// AfterModel hook — checks token threshold, summarizes if needed, appends to long-term memory
const { readMemory, writeMemory, appendMemory, countEntries } = require('./lib/memory-manager');
const { shouldSummarize, summarize, compressLongTerm, MAX_LONG_TERM_ENTRIES } = require('./lib/gemini-summarizer');
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
    const input = readStdin();
    // Expected: { event, sessionId, turnId, response: { text }, stats: { totalTokens, promptTokens, responseTokens } }

    const { turnId = 0, stats = {} } = input;
    const totalTokens = stats.totalTokens || 0;

    logInfo('after-model', `turn=${turnId} tokens=${totalTokens}`);

    if (shouldSummarize(totalTokens, turnId)) {
      // Summarize recent short-term context
      const shortTerm = readMemory('short-term.md');
      if (shortTerm.trim()) {
        const summary = await summarize(shortTerm);
        if (summary) {
          const ts = new Date().toISOString();
          appendMemory('long-term.md', `## Turn ${turnId} — ${ts}\n${summary}\n`);
          logInfo('after-model', `Appended summary for turn ${turnId}`);
        }
      }

      // Compress long-term memory if too many entries accumulate
      if (countEntries('long-term.md') > MAX_LONG_TERM_ENTRIES) {
        const longTerm = readMemory('long-term.md');
        const entries = longTerm.split(/(?=^## )/m).filter(s => s.trim());
        const compressed = await compressLongTerm(entries);
        if (compressed) {
          const ts = new Date().toISOString();
          writeMemory('long-term.md', `## Compressed — ${ts}\n${compressed}\n`);
          logInfo('after-model', 'Long-term memory compressed');
        }
      }
    }

  } catch (err) {
    logError('after-model', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
