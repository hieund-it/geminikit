const fs = require('fs-extra');
const path = require('path');

const src = path.join(__dirname, '../.gemini');
const dest = path.join(__dirname, '../scaffold');

async function sync() {
  try {
    // 1. Dọn dẹp scaffold cũ nếu có
    if (await fs.pathExists(dest)) {
      await fs.remove(dest);
    }
    
    // 2. Tạo thư mục scaffold mới
    await fs.ensureDir(dest);
    
    // 3. Sao chép nội dung từ .gemini sang scaffold (loại bỏ rác)
    await fs.copy(src, dest, {
      filter: (srcPath) => {
        const relative = path.relative(src, srcPath);
        const isTrash = relative.startsWith('memory') || 
                        relative.startsWith('runtime') || 
                        srcPath.endsWith('.env');
        return !isTrash;
      }
    });
    
    console.log('âœ“ Scaffold generated successfully from .gemini');
  } catch (err) {
    console.error('âœ— Sync failed:', err);
    process.exit(1);
  }
}

sync();
