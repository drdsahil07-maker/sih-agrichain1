const fs = require('fs');

let content = fs.readFileSync('vite.config.ts', 'utf8');

// Update public paths in aistudioMediaPlugin
content = content.replace(/'public',\s*'assets'/g, "'frontend', 'public', 'assets'");
content = content.replace(/'public',\s*relativePath/g, "'frontend', 'public', relativePath");

// Add root and outDir to config
content = content.replace('plugins: [react(), tailwindcss(), aistudioMediaPlugin()],', 
  "root: 'frontend',\n    build: {\n      outDir: '../dist',\n      emptyOutDir: true,\n    },\n    plugins: [react(), tailwindcss(), aistudioMediaPlugin()],");

fs.writeFileSync('vite.config.ts', content, 'utf8');
