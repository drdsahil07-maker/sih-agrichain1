const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');

code = code.replace(/async async getTransportOptions/g, 'async getTransportOptions');
code = code.replace(/getBackhaulTrips\(\): Promise<BackhaulTrip\[\]> {/g, 'async getBackhaulTrips(): Promise<BackhaulTrip[]> {');

fs.writeFileSync('frontend/src/services/api.ts', code);
