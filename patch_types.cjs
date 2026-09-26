const fs = require('fs');
let code = fs.readFileSync('shared/types.ts', 'utf-8');

if (!code.includes('tripId?: string;')) {
  code = code.replace(
    /transporterId\?: string;/,
    'transporterId?: string;\n  tripId?: string;'
  );
  fs.writeFileSync('shared/types.ts', code);
}
