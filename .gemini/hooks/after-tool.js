// AfterTool hook — logs tool invocations (name, status, duration) to execution.md
const { appendMemory } = require('./lib/memory-manager');
const { readStdin } = require('./lib/read-stdin');
const { logError } = require('./lib/logger');

// Redact sensitive field values before logging
const SENSITIVE_KEYS = /\b(key|token|secret|password|credential|auth)\b/i;

function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      SENSITIVE_KEYS.test(k) ? [k, '[REDACTED]'] : [k, v]
    )
  );
}

async function main() {
  try {
    const input = readStdin();
    // Expected: { event, toolName, status: 'success'|'error', durationMs, params? }

    const { toolName = 'unknown', status = 'unknown', durationMs = 0 } = input;
    const ts = new Date().toISOString();
    const logLine = `[${ts}] TOOL ${toolName} → ${status} (${durationMs}ms)\n`;
    appendMemory('execution.md', logLine);

  } catch (err) {
    logError('after-tool', err);
  }

  process.stdout.write(JSON.stringify({ status: 'ok' }));
  process.exit(0);
}

main();
