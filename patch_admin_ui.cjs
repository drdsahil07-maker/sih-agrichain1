const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AdminCommandCenter.tsx', 'utf-8');

code = code.replace(
  /admin: \{ label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-300' \},/,
  "admin: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-300' },\n    government_admin: { label: 'Gov Admin', icon: Shield, color: 'bg-red-100 text-red-800 border-red-300' },"
);

fs.writeFileSync('frontend/src/components/AdminCommandCenter.tsx', code);
