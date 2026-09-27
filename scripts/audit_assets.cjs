const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else {
      if (exts.includes(path.extname(filePath))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const allTsFiles = getAllFiles('src');
console.log(`Found ${allTsFiles.length} TypeScript files to scan for image/asset references.\n`);

const assetRegex = /['"](\/(assets|images)\/[^'"]+\.(png|jpg|jpeg|svg|webp|mp4))['"]/gi;
const foundAssets = new Map(); // assetPath -> Array of file paths

for (const f of allTsFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    const assetPath = match[1];
    if (!foundAssets.has(assetPath)) {
      foundAssets.set(assetPath, []);
    }
    foundAssets.get(assetPath).push(f);
  }
}

console.log(`Unique asset paths referenced across src/: ${foundAssets.size}\n`);

const missing = [];
const existing = [];

for (const [assetPath, files] of foundAssets.entries()) {
  const localPath = path.join('public', assetPath);
  if (fs.existsSync(localPath)) {
    const stat = fs.statSync(localPath);
    existing.push({ assetPath, files, sizeKb: Math.round(stat.size / 1024) });
  } else {
    missing.push({ assetPath, files });
  }
}

console.log(`✅ Valid Assets on Disk: ${existing.length}`);
console.log(`❌ Missing Assets: ${missing.length}`);

if (missing.length > 0) {
  console.log('\n--- MISSING ASSETS DETAILS ---');
  missing.forEach(m => {
    console.log(`MISSING: ${m.assetPath}`);
    console.log(`  Referenced in: ${m.files.slice(0, 3).join(', ')}`);
  });
}

// Find large assets > 500KB
const largeAssets = existing.filter(e => e.sizeKb > 500);
console.log(`\n⚠️ Large Assets (> 500 KB): ${largeAssets.length}`);
largeAssets.sort((a, b) => b.sizeKb - a.sizeKb).slice(0, 15).forEach(l => {
  console.log(`  ${l.sizeKb} KB - ${l.assetPath}`);
});
