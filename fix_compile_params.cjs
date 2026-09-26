const fs = require('fs');
let content = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');
content = content.replace(
  'preferredBuyerType?: string;',
  'preferredBuyerType?: string;\n  harvestId?: string;'
);
fs.writeFileSync('frontend/src/services/api.ts', content);
