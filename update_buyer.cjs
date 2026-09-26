const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/BuyerDashboard.tsx', 'utf-8');

if (!content.includes('import { Harvest }')) {
  content = content.replace(
    "import { Buyer, BuyerDemand } from '../../../shared/types';",
    "import { Buyer, BuyerDemand, Harvest } from '../../../shared/types';"
  );
  content = content.replace(
    "import { useEffect } from 'react';",
    ""
  );
  content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';"
  );
}

const customOffersLogic = `  const [realHarvests, setRealHarvests] = useState<Harvest[]>([]);
  useEffect(() => {
    api.getHarvests().then(h => setRealHarvests(h));
  }, []);

  const handlePlaceOffer = async (harvestId: string, crop: string, quantityKg: number) => {
    try {
      await api.createOffer({
        harvestId,
        crop,
        quantityKg,
        offeredPrice: 18.0,
        destination: buyer.location,
        pickupTerms: 'Farmgate'
      });
      alert("Offer placed successfully for ₹18/kg!");
    } catch(e) {
      alert("Error placing offer. Are you logged in as a buyer? " + e);
    }
  };`;

content = content.replace(
  "  const availableProduce = [",
  customOffersLogic + "\n  const availableProduce = ["
);

content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\s*\{availableProduce.map\(\(item\) => \(/,
  `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {realHarvests.slice(0,3).map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 font-display">{item.crop}</span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {item.qualityGrade}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 font-display">
                  ₹{item.minAcceptablePrice} / kg (Min)
                </div>
                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-semibold text-slate-800">{item.quantityKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium text-slate-800">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Farmer:</span>
                    <span className="font-medium text-slate-800">{item.farmerName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handlePlaceOffer(item.id, item.crop, item.quantityKg)}
                className="w-full py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold text-xs hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Place Offer at ₹18/kg
              </button>
            </div>
          ))}
          {availableProduce.map((item) => (`
);

fs.writeFileSync('frontend/src/components/BuyerDashboard.tsx', content);
