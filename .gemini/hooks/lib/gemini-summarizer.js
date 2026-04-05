// Gemini API wrapper for conversation summarization with token threshold logic
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logError } = require('./logger');

const TOKENS_THRESHOLD = 25000;   // trigger summarization after 25K tokens/session
const TURNS_INTERVAL = 10;         // or every 10 turns
const MAX_LONG_TERM_ENTRIES = 15;  // compress long-term memory when > 15 entries

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function shouldSummarize(totalTokens, turnId) {
  return totalTokens >= TOKENS_THRESHOLD || (turnId > 0 && turnId % TURNS_INTERVAL === 0);
}

async function summarize(text, systemPrompt) {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = systemPrompt
      ? `${systemPrompt}\n\n---\n${text}`
      : `Summarize the following conversation concisely, preserving key decisions, tasks, and context:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logError('summarize', err);
    return null; // caller handles null gracefully — non-blocking
  }
}

async function compressLongTerm(entries) {
  const combined = entries.join('\n\n---\n\n');
  return summarize(combined,
    'Compress these session summaries into one concise summary. Preserve: active tasks, key decisions, current focus, important context. Max 500 words.'
  );
}

module.exports = { shouldSummarize, summarize, compressLongTerm, MAX_LONG_TERM_ENTRIES };
