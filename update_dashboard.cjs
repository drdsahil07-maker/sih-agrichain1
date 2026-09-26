const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/FarmerDashboard.tsx', 'utf-8');

if (!content.includes('import { api }')) {
  content = content.replace(
    "import { SEED_PRICE_BENCHMARKS } from '../../../shared/data/seedData';",
    "import { SEED_PRICE_BENCHMARKS } from '../../../shared/data/seedData';\nimport { api } from '../services/api';\nimport { useEffect } from 'react';"
  );
}

content = content.replace(
  "const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');",
  "const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');\n  const [benchmarks, setBenchmarks] = useState<Record<string, PriceBenchmark>>({});\n  useEffect(() => { api.getPriceBenchmarks().then(setBenchmarks) }, []);"
);

content = content.replace(
  "const benchmark: PriceBenchmark = SEED_PRICE_BENCHMARKS[selectedCrop] || SEED_PRICE_BENCHMARKS['Tomato'];",
  "const benchmark: PriceBenchmark = benchmarks[selectedCrop] || SEED_PRICE_BENCHMARKS['Tomato'];"
);

content = content.replace(
  "<span>Fair-Price Benchmark Engine</span>",
  "<span>Fair-Price Benchmark Engine {benchmark.isDemoData && <span className=\"ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold\">Demo Data</span>}</span>"
);

fs.writeFileSync('frontend/src/components/FarmerDashboard.tsx', content);
