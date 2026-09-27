const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/data/officialCatalogs.ts', 'utf8');
const lines = content.split('\n');

let total = 0;
let missing = 0;
const missingList = [];
const existingList = [];

for (const line of lines) {
  const match = line.match(/image:\s*['"]([^'"]+)['"]/);
  if (match) {
    total++;
    const imgPath = match[1];
    const localFile = path.join('public', imgPath);
    if (!fs.existsSync(localFile)) {
      missing++;
      missingList.push(imgPath);
    } else {
      existingList.push(imgPath);
    }
  }
}

console.log(`Total machines in officialCatalogs.ts: ${total}`);
console.log(`Valid machine image files on disk: ${existingList.length}`);
console.log(`Missing machine image files: ${missing}`);

if (missingList.length > 0) {
  console.log('\nMissing machine images:');
  missingList.forEach(m => console.log(' - ' + m));
} else {
  console.log('🎉 100% of official catalog machines have existing, valid local images!');
}
