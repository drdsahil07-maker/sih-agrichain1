const fs = require('fs');
let content = fs.readFileSync('docs/API_CONTRACT.md', 'utf-8');

const newDoc = `

### Pools API (Phase 5)

| Method | Endpoint | Description | Auth Required | Roles Allowed |
|--------|----------|-------------|---------------|---------------|
| \`GET\` | \`/api/pools\` | Fetch active dynamic pools | Yes | All |
| \`POST\` | \`/api/pools/suggest\` | Generate AI candidate pools based on requirements | Yes | Admin, Aggregator |
| \`POST\` | \`/api/pools\` | Lock/Create a new pool and associate members | Yes | Admin, Aggregator |

#### Create Pool Payload:
\`\`\`json
{
  "crop": "Tomato",
  "qualityGrade": "Grade A",
  "targetQuantityKg": 1000,
  "clusterName": "Indore Hub",
  "destination": "Indore City",
  "estimatedSavings": 1.50,
  "matchScore": 95,
  "farmers": [
    {
      "farmerId": "uuid",
      "harvestId": "uuid",
      "quantityKg": 250
    }
  ]
}
\`\`\`
`;

if (!content.includes('Pools API (Phase 5)')) {
  fs.appendFileSync('docs/API_CONTRACT.md', newDoc);
}
