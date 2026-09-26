const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/index.ts', 'utf-8');

if (!content.includes('import poolRoutes')) {
  content = content.replace('import offerRoutes from \'./offer.routes\';', "import offerRoutes from './offer.routes';\nimport poolRoutes from './pool.routes';");
  content = content.replace('router.use(\'/offers\', offerRoutes);', "router.use('/offers', offerRoutes);\nrouter.use('/pools', poolRoutes);");
  fs.writeFileSync('backend/src/routes/index.ts', content);
}
