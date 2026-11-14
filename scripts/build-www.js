const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.resolve(ROOT, 'www');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('Synchronizing web assets to www/ directory...');
if (fs.existsSync(WWW)) {
  fs.rmSync(WWW, { recursive: true, force: true });
}
fs.mkdirSync(WWW, { recursive: true });

// Copy essential folders and files
const targets = ['index.html', 'css', 'js', 'assets'];
targets.forEach((target) => {
  const srcPath = path.join(ROOT, target);
  const destPath = path.join(WWW, target);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
    console.log(`- Copied ${target}`);
  }
});

console.log('✓ Build complete: www/ is up to date.');
