const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');
code = code.replace(/SEED_POOLS,/g, '');
code = code.replace(/SEED_HARVESTS,/g, '');
fs.writeFileSync('frontend/src/services/api.ts', code);
