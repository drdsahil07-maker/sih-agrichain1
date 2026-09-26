const fs = require('fs');
let content = fs.readFileSync('shared/services/chainCompiler.ts', 'utf-8');
content = content.replace(
  'allowBackhaul?: boolean;\n}',
  'allowBackhaul?: boolean;\n  offers?: any[];\n}'
);

const customOffersLogic = `
  const generatedOptions: ChainOption[] = [];

  // 0. Explicit Buyer Offers
  if (input.offers && input.offers.length > 0) {
    input.offers.forEach((offer, i) => {
      // Net Value = Buyer Price - Transport Cost - Service Cost - Expected Loss
      const buyerPrice = offer.offeredPrice;
      const transportCost = 1.20; // Estimated transport or backhaul
      const serviceCost = 1.00; // Aggregation/Platform fee
      const expectedLoss = 0.50; // Standard loss
      const farmerNetValue = buyerPrice - transportCost - serviceCost - expectedLoss;
      
      const breakdown: CostBreakdown = {
        buyerPrice: buyerPrice,
        aggregationFee: serviceCost,
        transportCost: transportCost,
        gradingFee: 0,
        storageFee: 0,
        financeCost: 0,
        platformFee: 0.0,
        farmerNetValue: farmerNetValue,
      };
      
      generatedOptions.push({
        id: \`chain-offer-\${offer.id}\`,
        type: 'direct_institutional',
        title: \`Live Offer: \${offer.buyerName}\`,
        description: \`Direct sale to \${offer.buyerName} (\${offer.destination})\`,
        nodes: [
          { id: 'n1', role: 'Farmer', name: 'Farmgate', feePerKg: 0, timeHours: 0, isServiceOnly: false, reliabilityScore: 90 },
          { id: 'n2', role: 'Logistics', name: 'Logistics', feePerKg: transportCost, timeHours: 2.5, isServiceOnly: true, serviceType: 'Direct Freight', reliabilityScore: 88 },
          { id: 'n3', role: 'Buyer', name: offer.buyerName, feePerKg: 0, timeHours: 1.0, isServiceOnly: false, reliabilityScore: 92 }
        ],
        breakdown,
        farmerNetValue,
        totalFarmerPayout: Math.round(farmerNetValue * quantityKg),
        totalTransitHours: 3.5,
        reliabilityScore: 90,
        paymentReliability: 95,
        wastageRisk: 'Low',
        logisticsRisk: 'Low',
        qualityDisputeRisk: 'Low',
        overallScore: farmerNetValue * 5 + 20, // Simplified score calculation
        badge: i === 0 ? 'LIVE OFFER' : undefined,
        recommendedReason: 'Direct offer placed by verified buyer on the platform.',
      });
    });
  }
`;

content = content.replace(
  '  // 1. OPTION B:',
  customOffersLogic + '\n  // 1. OPTION B:'
);

content = content.replace(
  'return [optionB, optionD, optionC, optionE, optionA];',
  'return [...generatedOptions, optionB, optionD, optionC, optionE, optionA].sort((a, b) => b.overallScore - a.overallScore);'
);

fs.writeFileSync('shared/services/chainCompiler.ts', content);
