const fs = require('fs');
const content = fs.readFileSync('frontend/src/services/api.ts', 'utf-8');

const newMethods = `
  async getOffers(harvestId?: string): Promise<any[]> {
    try {
      const url = harvestId ? \`/api/offers?harvestId=\${harvestId}\` : '/api/offers';
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.offers;
      }
    } catch (e) {
      console.warn('API error fetching offers:', e);
    }
    return [];
  },

  async createOffer(offerData: any): Promise<any> {
    const res = await fetchWithAuth('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData),
    });
    if (!res.ok) throw new Error("Failed to create offer");
    const data = await res.json();
    return data.offer;
  },
`;

const updated = content.replace('async getServiceProviders', newMethods + '\n  async getServiceProviders');
fs.writeFileSync('frontend/src/services/api.ts', updated);
