const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../../.gemini');
const dest = path.join(__dirname, '../../scaffold');

function sync() {
  try {
    console.log('âš™  Generating scaffold from .gemini...');
    
    // 1. Ensure source exists
    if (!fs.existsSync(src)) {
      console.warn('âš   Warning: .gemini directory not found. Skipping scaffold generation.');
      return;
    }

    // 2. Clean up old scaffold (Using Node 18+ rmSync)
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    
    // 3. Create fresh scaffold directory
    fs.mkdirSync(dest, { recursive: true });
    
    // 4. Copy content with native filter (Using Node 18+ cpSync)
    fs.cpSync(src, dest, {
      recursive: true,
      filter: (srcPath) => {
        if (srcPath === src) return true;
        
        const relative = path.relative(src, srcPath);
        const isTrash = relative.startsWith('memory') || 
                        relative.startsWith('runtime') || 
                        path.basename(srcPath).startsWith('.env');
        
        return !isTrash;
      }
    });
    
    console.log('âœ“ Scaffold generated successfully.');
  } catch (err) {
    console.error('âœ— Sync failed:', err.message);
    process.exit(1);
  }
}

sync();
