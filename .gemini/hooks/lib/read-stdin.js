// Cross-platform stdin reader using fd 0 (works on Unix, Windows Git Bash, WSL)
function readStdin() {
  try {
    return JSON.parse(require('fs').readFileSync(0, 'utf8'));
  } catch (_) {
    return {}; // fallback on empty or malformed input
  }
}

module.exports = { readStdin };
