const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');

// Replace SEED_BACKHAUL_TRIPS fallback
code = code.replace(/return SEED_BACKHAUL_TRIPS;/g, 'return []; // Phase 6: Removed SEED_BACKHAUL_TRIPS');

// Replace mock newTrip in createBackhaulTrip
code = code.replace(
  /const newTrip: BackhaulTrip = {[\s\S]*?status: 'open',\n    };/,
  ''
);
code = code.replace(
  /return newTrip;/,
  'throw new Error("Failed to create backhaul trip");'
);

// Add Phase 6 APIs for options and assign
if (!code.includes('getTransportOptions')) {
  code = code.replace(
    /getBackhaulTrips/,
    `async getTransportOptions(poolId: string): Promise<any[]> {
    const res = await fetchWithAuth(\`/api/transporters/options/\${poolId}\`);
    if (res.ok) {
      const data = await res.json();
      return data.options;
    }
    return [];
  },
  
  async assignTransport(poolId: string, tripId: string): Promise<any> {
    const res = await fetchWithAuth(\`/api/transporters/assign/\${poolId}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId })
    });
    if (!res.ok) throw new Error("Failed to assign transport");
    return await res.json();
  },
  
  getBackhaulTrips`
  );
}

fs.writeFileSync('frontend/src/services/api.ts', code);
