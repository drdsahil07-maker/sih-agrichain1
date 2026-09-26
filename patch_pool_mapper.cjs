const fs = require('fs');
let code = fs.readFileSync('backend/src/services/pool.service.ts', 'utf-8');

code = code.replace(
  /requirementId: p\.requirement_id,/,
  'requirementId: p.requirement_id,\n    tripId: p.trip_id,'
);

fs.writeFileSync('backend/src/services/pool.service.ts', code);
