// Silent error logger — writes to errors.log, never throws
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'errors.log');

function logError(context, error) {
  try {
    const ts = new Date().toISOString();
    const msg = `[${ts}] ERROR [${context}]: ${error?.message || error}\n`;
    fs.appendFileSync(LOG_FILE, msg);
  } catch (_) { /* intentionally swallowed */ }
}

function logInfo(context, message) {
  // No-op by default; enable via LOG_LEVEL=debug env
  if (process.env.LOG_LEVEL === 'debug') {
    try {
      const ts = new Date().toISOString();
      fs.appendFileSync(LOG_FILE, `[${ts}] INFO [${context}]: ${message}\n`);
    } catch (_) {}
  }
}

module.exports = { logError, logInfo };
