const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');
code = code.replace(/return SEED_POOLS;/g, 'return []; // Removed in Phase 5 to ensure Supabase truth');
code = code.replace(/return SEED_HARVESTS;/g, 'return []; // Removed in Phase 5 to ensure Supabase truth');
fs.writeFileSync('frontend/src/services/api.ts', code);
