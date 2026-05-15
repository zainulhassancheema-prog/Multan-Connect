import fs from 'fs';

const lines = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf-8').split('\n');
// Truncate at line 345
const t = lines.slice(0, 345).join('\n');
fs.writeFileSync('src/pages/ProductDetail.tsx', t);
