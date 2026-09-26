const fs = require('fs');
let code = fs.readFileSync('shared/types.ts', 'utf-8');

code = code.replace(
  /'consumer' \| 'admin' \| 'judge'/g,
  "'consumer' | 'admin' | 'government_admin' | 'judge'"
);
code = code.replace(
  /'buyer' \| 'admin'/g,
  "'buyer' | 'admin' | 'government_admin'"
);

fs.writeFileSync('shared/types.ts', code);
