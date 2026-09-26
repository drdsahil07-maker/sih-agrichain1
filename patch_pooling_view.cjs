const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/DynamicPoolingView.tsx', 'utf-8');
code = code.replace(/s.poolCode !== suggestion.poolCode/g, 's !== suggestion');
fs.writeFileSync('frontend/src/components/DynamicPoolingView.tsx', code);
