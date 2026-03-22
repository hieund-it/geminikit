const pc = require('picocolors');

class Spinner {
  constructor(message) {
    this.message = message;
    this.frames = ['â‹', 'â ™', 'â ¹', 'â ¸', 'â ¼', 'â ¶', 'â §', 'â ¯'];
    this.frameIndex = 0;
    this.timer = null;
  }

  start() {
    process.stdout.write('\x1B[?25l'); // áº¨n con trá» chuá»™t
    
    // Restore cursor on exit/interrupt
    const cleanup = () => {
      process.stdout.write('\x1B[?25h');
      process.exit();
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    this.timer = setInterval(() => {
      const frame = pc.cyan(this.frames[this.frameIndex]);
      process.stdout.write(`\r${frame} ${this.message}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage, isError = false) {
    clearInterval(this.timer);
    process.stdout.write('\r\x1B[K'); // XÃ³a dÃ²ng hiá»‡n táº¡i
    const symbol = isError ? pc.red('âœ—') : pc.green('âœ“');
    console.log(`${symbol} ${finalMessage || this.message}`);
    process.stdout.write('\x1B[?25h'); // Hiá»‡n láº¡i con trá» chuá»™t
  }

  update(newMessage) {
    this.message = newMessage;
  }
}

/** Returns an ASCII progress bar: [████████░░░░] 66% */
function renderProgressBar(current, total, width = 20) {
  const pct = total > 0 ? current / total : 1
  const filled = Math.round(pct * width)
  const bar = pc.green('█'.repeat(filled)) + pc.gray('░'.repeat(width - filled))
  return `[${bar}] ${Math.round(pct * 100)}%`
}

module.exports = { Spinner, renderProgressBar };
