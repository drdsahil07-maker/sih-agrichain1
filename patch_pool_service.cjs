const fs = require('fs');
let code = fs.readFileSync('backend/src/services/pool.service.ts', 'utf-8');

code = code.replace(
  /\['distributor', 'buyer', 'aggregator', 'admin'\]/g,
  "['distributor', 'buyer', 'aggregator', 'government_admin', 'admin']"
);

fs.writeFileSync('backend/src/services/pool.service.ts', code);
