// AfterModel hook — accumulates response into short-term, summarizes when threshold met, then resets
// Fires per-chunk during streaming; only acts on last chunk (finishReason present)
const { writeMemory, appendMemory, extractTurns } = require('./lib/memory-manager');
const { shouldSummarize, summarize } = require('./lib/gemini-summarizer');
const { compressLongTermIfNeeded } = require('./lib/compress-if-needed');
const { readStdin } = require('./lib/read-stdin');
const { logError, logInfo } = require('./lib/logger');

async function main() {
  try {
    const input = readStdin();
    // Official AfterModel API: { session_id, llm_response: { candidates, usageMetadata }, ... }

    const { llm_response } = input;
    const candidate = llm_response?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    // Parts may be Part objects {text: string} or plain strings depending on Gemini CLI version
    const responseText = Array.isArray(parts)
      ? parts.map(p => (typeof p === 'string' ? p : (p?.text || ''))).join('')
      : String(parts || '');
    const totalTokens = llm_response?.usageMetadata?.totalTokenCount || 0;
    // finishReason present ("STOP", "MAX_TOKENS", etc.) only on last chunk
    const isLastChunk = !!candidate?.finishReason;

    logInfo('after-model', `tokens=${totalTokens} lastChunk=${isLastChunk}`);

    // Accumulate chunk text into short-term buffer
    if (responseText) {
      const ts = new Date().toISOString();
      appendMemory('short-term.md', `## Chunk — ${ts}\n${responseText}\n`);
    }

    // Only summarize + reset on last chunk to avoid mid-stream processing
    if (isLastChunk && shouldSummarize(totalTokens)) {
      const turns = extractTurns('short-term.md');
      if (turns) {
        const summary = await summarize(turns);
        if (summary) {
          const ts = new Date().toISOString();
          appendMemory('long-term.md', `## Summary — ${ts}\n${summary}\n`);
          logInfo('after-model', 'Appended summary to long-term');
          writeMemory('short-term.md', `# Short-term Memory\n_Reset after summarization: ${ts}_\n`);
        }
      }
      await compressLongTermIfNeeded('Compressed');
    }

  } catch (err) {
    logError('after-model', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
