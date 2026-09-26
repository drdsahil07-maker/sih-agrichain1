const fs = require('fs');

let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

tsconfig.compilerOptions.paths = {
  "@/*": ["./*"],
  "@shared/*": ["./shared/*"]
};

// Also we should ensure type checking covers these.
// By default if no "include" is provided, it covers all TS files.
// Let's add an explicit include just in case.
tsconfig.include = ["frontend/src", "backend", "shared", "vite.config.ts"];

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2), 'utf8');
