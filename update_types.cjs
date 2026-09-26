const fs = require('fs');
let content = fs.readFileSync('shared/types.ts', 'utf-8');

content = content.replace(
  'source: string;',
  'source: string;\n  isDemoData?: boolean;'
);

fs.writeFileSync('shared/types.ts', content);
