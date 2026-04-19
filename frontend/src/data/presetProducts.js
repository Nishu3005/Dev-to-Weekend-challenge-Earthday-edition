export const PRESET_PRODUCTS = [
  {
    id: 'preset-1',
    originalRequest: { productName: 'Single-Use Plastic Cups', quantity: 1000, currentBudget: 250 },
    lcaResult: {
      deforestationCostTrees: 50,
      waterCostLiters: 12500,
      carbonCostKg: 4200,
      sustainableAlternative: 'Recycled Paper Cups (FSC Certified)',
      reasoning: 'Single-use plastic cups take 450+ years to decompose and leach microplastics into soil and water systems.'
    },
    backboardFlags: ['WARNING (Backboard): Order exceeds institutional carbon limits (4,200 kg CO₂e).']
  },
  {
    id: 'preset-2',
    originalRequest: { productName: 'Styrofoam Packaging Peanuts', quantity: 500, currentBudget: 180 },
    lcaResult: {
      deforestationCostTrees: 12,
      waterCostLiters: 8200,
      carbonCostKg: 1850,
      sustainableAlternative: 'Biodegradable Cornstarch Packing Peanuts',
      reasoning: 'Polystyrene foam never biodegrades and poses severe toxicity risks to marine ecosystems.'
    },
    backboardFlags: null
  },
  {
    id: 'preset-3',
    originalRequest: { productName: 'Plastic Ballpoint Pens (Bulk)', quantity: 2000, currentBudget: 400 },
    lcaResult: {
      deforestationCostTrees: 8,
      waterCostLiters: 6400,
      carbonCostKg: 980,
      sustainableAlternative: 'Recycled Ocean Plastic Refillable Pens',
      reasoning: 'Disposable pens generate ~1.6 billion units of plastic waste annually worldwide.'
    },
    backboardFlags: null
  },
  {
    id: 'preset-4',
    originalRequest: { productName: 'Single-Use Plastic Water Bottles', quantity: 5000, currentBudget: 1500 },
    lcaResult: {
      deforestationCostTrees: 95,
      waterCostLiters: 68750,
      carbonCostKg: 8200,
      sustainableAlternative: 'Stainless Steel Reusable Bottles (BPA-Free)',
      reasoning: 'Plastic bottle production uses 17 million barrels of oil annually and only 30% are recycled.'
    },
    backboardFlags: [
      'WARNING (Backboard): Order exceeds institutional carbon limits (8,200 kg CO₂e).',
      'WARNING (Backboard): Order exceeds institutional water strain limits (68,750 L).'
    ]
  },
  {
    id: 'preset-5',
    originalRequest: { productName: 'Incandescent Light Bulbs', quantity: 300, currentBudget: 600 },
    lcaResult: {
      deforestationCostTrees: 3,
      waterCostLiters: 1200,
      carbonCostKg: 510,
      sustainableAlternative: 'LED Smart Bulbs (Energy Star Certified)',
      reasoning: 'Incandescent bulbs waste 90% of energy as heat. LEDs use 75% less energy and last 25x longer.'
    },
    backboardFlags: null
  },
  {
    id: 'preset-6',
    originalRequest: { productName: 'Non-Recycled Printer Paper (Reams)', quantity: 800, currentBudget: 2400 },
    lcaResult: {
      deforestationCostTrees: 240,
      waterCostLiters: 95000,
      carbonCostKg: 5600,
      sustainableAlternative: '100% Post-Consumer Recycled Paper (FSC Certified)',
      reasoning: 'Virgin paper production requires 10 litres of water per A4 sheet and drives 15% of global deforestation.'
    },
    backboardFlags: [
      'WARNING (Backboard): Order exceeds institutional carbon limits (5,600 kg CO₂e).',
      'WARNING (Backboard): Order exceeds institutional water strain limits (95,000 L).'
    ]
  },
  {
    id: 'preset-7',
    originalRequest: { productName: 'Disposable Plastic Cutlery Sets', quantity: 3000, currentBudget: 750 },
    lcaResult: {
      deforestationCostTrees: 28,
      waterCostLiters: 21500,
      carbonCostKg: 3100,
      sustainableAlternative: 'Bamboo Compostable Cutlery Sets',
      reasoning: 'Plastic cutlery is rarely recycled due to food contamination and ends up in landfills or oceans within months.'
    },
    backboardFlags: null
  }
];
