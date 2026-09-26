const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/CompilerView.tsx', 'utf-8');

if (!content.includes('import { api }')) {
  content = content.replace(
    "import { compileSupplyChains } from '../../../shared/services/chainCompiler';",
    "import { compileSupplyChains } from '../../../shared/services/chainCompiler';\nimport { api } from '../services/api';\nimport { useEffect } from 'react';"
  );
}

const compileLogicStr = `  const [compiledOptions, setCompiledOptions] = useState<ChainOption[]>([]);
  const [selectedChainId, setSelectedChainId] = useState<string>('chain-dynamic-pool');
  
  useEffect(() => {
    handleRecompile();
  }, [initialHarvest]);

  const handleRecompile = async () => {
    setIsCompiling(true);
    setAcceptedSuccess(false);

    try {
      const results = await api.compileChain({
        crop,
        quantityKg,
        location,
        harvestDate: '2026-09-10',
        minAcceptablePrice: minPrice,
        qualityGrade,
        harvestId: initialHarvest?.id
      });
      setCompiledOptions(results.options);
      setSelectedChainId(results.options[0]?.id || 'chain-dynamic-pool');
    } catch(e) {
      console.error(e);
      // Fallback
      const results = compileSupplyChains({
        crop,
        quantityKg,
        location,
        harvestDate: '2026-09-10',
        minAcceptablePrice: minPrice,
        qualityGrade,
      });
      setCompiledOptions(results);
      setSelectedChainId(results[0]?.id || 'chain-dynamic-pool');
    }
    setIsCompiling(false);
  };`;

// We have to replace the existing state setup and handleRecompile
content = content.replace(
  /  const \[compiledOptions, setCompiledOptions\] = useState<ChainOption\[\]>\([\s\S]*?setIsCompiling\(false\);\n    \}, 800\);\n  };/,
  compileLogicStr
);

fs.writeFileSync('frontend/src/components/CompilerView.tsx', content);
