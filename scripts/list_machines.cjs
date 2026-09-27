const fs = require('fs');
const content = fs.readFileSync('src/data/officialCatalogs.ts', 'utf8');
const lines = content.split('\n');
const machines = [];
let cur = null;
for (const line of lines) {
  const idM = line.match(/id:\s*['"]([^'"]+)['"]/);
  if (idM) {
    if (cur && cur.id) machines.push(cur);
    cur = { id: idM[1] };
  }
  const nameM = line.match(/name:\s*['"]([^'"]+)['"]/);
  if (nameM && cur) cur.name = nameM[1];
  const brandM = line.match(/brand:\s*['"]([^'"]+)['"]/);
  if (brandM && cur) cur.brand = brandM[1];
  const catM = line.match(/category:\s*['"]([^'"]+)['"]/);
  if (catM && cur) cur.category = catM[1];
  const imgM = line.match(/image:\s*['"]([^'"]+)['"]/);
  if (imgM && cur) cur.image = imgM[1];
}
if (cur && cur.id) machines.push(cur);

console.log(`Found ${machines.length} machines:\n`);
machines.forEach((m, idx) => {
  const isExternal = m.image && (m.image.startsWith('http://') || m.image.startsWith('https://'));
  console.log(`[${idx + 1}] ${m.id} | ${m.brand} - ${m.name} | ${m.category}`);
  console.log(`    Current: ${m.image} ${isExternal ? '⚠️ [EXTERNAL]' : '✅ [LOCAL]'}`);
});
