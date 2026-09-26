const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.tsx', 'utf-8');
content = content.replace(
  "const [currentTab, setCurrentTab] = useState<string>('landing');",
  "const [currentTab, setCurrentTab] = useState<string>('landing');\n  const [compilerHarvest, setCompilerHarvest] = useState<Harvest | undefined>(undefined);"
);

content = content.replace(
  "onOpenCompiler={() => setCurrentTab('compiler')}",
  "onOpenCompiler={(harvest) => { if (harvest) setCompilerHarvest(harvest); setCurrentTab('compiler'); }}"
);

content = content.replace(
  "{currentTab === 'compiler' && (\n          <CompilerView onChainAccepted={handleChainAccepted} />\n        )}",
  "{currentTab === 'compiler' && (\n          <CompilerView onChainAccepted={handleChainAccepted} initialHarvest={compilerHarvest} />\n        )}"
);

fs.writeFileSync('frontend/src/App.tsx', content);

let dashboardContent = fs.readFileSync('frontend/src/components/FarmerDashboard.tsx', 'utf-8');
dashboardContent = dashboardContent.replace(
  "onOpenCompiler: () => void;",
  "onOpenCompiler: (harvest?: Harvest) => void;"
);
dashboardContent = dashboardContent.replace(
  "onClick={onOpenCompiler}",
  "onClick={() => onOpenCompiler(flagshipHarvest)}"
);
dashboardContent = dashboardContent.replace(
  "onClick={onOpenCompiler}",
  "onClick={() => onOpenCompiler(flagshipHarvest)}"
);
fs.writeFileSync('frontend/src/components/FarmerDashboard.tsx', dashboardContent);

let compilerContent = fs.readFileSync('frontend/src/components/CompilerView.tsx', 'utf-8');
if (!compilerContent.includes('initialHarvest?: Harvest')) {
  compilerContent = compilerContent.replace(
    "interface CompilerViewProps {\n  onChainAccepted?: (option: ChainOption) => void;\n}",
    "interface CompilerViewProps {\n  onChainAccepted?: (option: ChainOption) => void;\n  initialHarvest?: Harvest;\n}"
  );
  compilerContent = compilerContent.replace(
    "export const CompilerView: React.FC<CompilerViewProps> = ({ onChainAccepted }) => {",
    "export const CompilerView: React.FC<CompilerViewProps> = ({ onChainAccepted, initialHarvest }) => {"
  );
  compilerContent = compilerContent.replace(
    "const [crop, setCrop] = useState('Tomato');",
    "const [crop, setCrop] = useState(initialHarvest?.crop || 'Tomato');"
  );
  compilerContent = compilerContent.replace(
    "const [quantityKg, setQuantityKg] = useState<number>(100);",
    "const [quantityKg, setQuantityKg] = useState<number>(initialHarvest?.quantityKg || 100);"
  );
  compilerContent = compilerContent.replace(
    "const [location, setLocation] = useState('Sanwer (Village Cluster A), Indore');",
    "const [location, setLocation] = useState(initialHarvest?.location || 'Sanwer (Village Cluster A), Indore');"
  );
}
fs.writeFileSync('frontend/src/components/CompilerView.tsx', compilerContent);
