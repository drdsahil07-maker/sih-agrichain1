const fs = require('fs');
let content = fs.readFileSync('docs/API_CONTRACT.md', 'utf-8');

const newDocs = `
### 13. Offers (Buyer/Distributor)
*   **Method**: \`GET\`
*   **Path**: \`/api/offers\`
*   **Purpose**: Get offers (optionally filtered by \`?harvestId=\`).
*   **Authentication requirement**: Required (\`Authorization: Bearer <token>\`)
*   **Role requirement**: None
*   **Database Dependency**: REAL_DATABASE (\`buyer_offers\`)

*   **Method**: \`POST\`
*   **Path**: \`/api/offers\`
*   **Purpose**: Create an offer for a farmer's harvest.
*   **Authentication requirement**: Required (\`Authorization: Bearer <token>\`)
*   **Role requirement**: \`buyer\`, \`distributor\`, or \`consumer\`
*   **Database Dependency**: REAL_DATABASE (\`buyer_offers\`)

## Farmer Net Value Formula
The system strictly enforces the following economic formula when evaluating routes in the Chain Compiler:
**Farmer Net Value (FNV) = Buyer Price - Transport Cost - Service Cost - Expected Loss**
`;

content = content.replace("## Environment Variables", newDocs + "\n## Environment Variables");
fs.writeFileSync('docs/API_CONTRACT.md', content);
