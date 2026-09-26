const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.tsx', 'utf-8');
content = content.replace(
  "import { Harvest, ChainOption, QualityGrade } from '../../shared/types';",
  "import { Harvest, ChainOption, QualityGrade } from '../../shared/types';\nimport { api } from './services/api';"
);
content = content.replace(
  "const [activeHarvests, setActiveHarvests] = useState<Harvest[]>(SEED_HARVESTS);",
  "const [activeHarvests, setActiveHarvests] = useState<Harvest[]>([]);\n\n  useEffect(() => {\n    api.getHarvests().then(setActiveHarvests);\n  }, []);"
);
content = content.replace(
  "import { useAuth } from './context/AuthContext';",
  "import { useAuth } from './context/AuthContext';\nimport { useEffect } from 'react';"
);

const handleHarvestCreatedStr = `  const handleHarvestCreated = async (data: {
    crop: string;
    quantityKg: number;
    location: string;
    minAcceptablePrice: number;
    qualityGrade: QualityGrade;
    sellingWindow: string;
  }) => {
    try {
      const created = await api.createHarvest(data);
      setActiveHarvests([created, ...activeHarvests]);
      showNotification(\`✓ Successfully added \${data.quantityKg}kg of \${data.crop}\`);
    } catch (e) {
      console.error(e);
      showNotification(\`❌ Failed to add harvest: \${e.message}\`);
    }
    setIsVoiceOpen(false);
    setIsCallOpen(false);
    setIsAssistedOpen(false);
    setIsSellOpen(false);
  };`;

content = content.replace(/  const handleHarvestCreated = async \(data: \{[\s\S]*?setIsSellOpen\(false\);\n  };/, handleHarvestCreatedStr);

fs.writeFileSync('frontend/src/App.tsx', content);
