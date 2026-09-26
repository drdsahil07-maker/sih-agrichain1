const fs = require('fs');
let content = fs.readFileSync('shared/data/seedData.ts', 'utf-8');
content = content.replace(/source: 'Agmarknet \/ e-NAM Live Feeds \(Seeded\)',/g, "source: 'Agmarknet / e-NAM Live Feeds (Seeded)', isDemoData: true,");
fs.writeFileSync('shared/data/seedData.ts', content);
