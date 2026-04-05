// AfterModel hook — accumulates response into short-term, summarizes when threshold met, then resets
const { readMemory, writeMemory, appendMemory } = require('./lib/memory-manager');
const { shouldSummarize, summarize } = require('./lib/gemini-summarizer');
const { compressLongTermIfNeeded } = require('./lib/compress-if-needed');
const { readStdin } = require('./lib/read-stdin');
const { logError, logInfo } = require('./lib/logger');

async function main() {
  try {
    const input = readStdin();
    // Expected: { event, sessionId, turnId, response: { text }, stats: { totalTokens, ... } }

    const { turnId = 0, stats = {}, response = {} } = input;
    const totalTokens = stats.totalTokens || 0;
    const responseText = response.text || '';

    logInfo('after-model', `turn=${turnId} tokens=${totalTokens}`);

    // Accumulate current response into short-term rolling buffer
    if (responseText) {
      const ts = new Date().toISOString();
      appendMemory('short-term.md', `## Turn ${turnId} — ${ts}\n${responseText}\n`);
    }

    if (shouldSummarize(totalTokens, turnId)) {
      const shortTerm = readMemory('short-term.md');
      if (shortTerm.trim()) {
        const summary = await summarize(shortTerm);
        if (summary) {
          const ts = new Date().toISOString();
          appendMemory('long-term.md', `## Turn ${turnId} — ${ts}\n${summary}\n`);
          logInfo('after-model', `Appended summary for turn ${turnId}`);

          // Reset short-term buffer so next summarization starts fresh
          writeMemory('short-term.md', `# Short-term Memory\n_Reset after summarization at turn ${turnId}: ${ts}_\n`);
        }
      }

      // Compress long-term memory if too many entries accumulate
      await compressLongTermIfNeeded('Compressed');
    }

  } catch (err) {
    logError('after-model', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
