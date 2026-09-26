const fs = require('fs');

let compilerView = fs.readFileSync('frontend/src/components/CompilerView.tsx', 'utf-8');
compilerView = compilerView.replace(
  "import { ChainOption, QualityGrade } from '../../../shared/types';",
  "import { ChainOption, QualityGrade, Harvest } from '../../../shared/types';"
);
fs.writeFileSync('frontend/src/components/CompilerView.tsx', compilerView);

let chainCompiler = fs.readFileSync('shared/services/chainCompiler.ts', 'utf-8');
chainCompiler = chainCompiler.replace(
  "type: 'direct_institutional',",
  "type: 'direct_buyer',"
);
fs.writeFileSync('shared/services/chainCompiler.ts', chainCompiler);
