export interface SubstitutionResult {
  original_ingredient: string;
  substitute_ingredient: string;
  confidence: number;
  ratio_instructions: string;
  culinary_notes: string;
}

const COMMON_SUBSTITUTIONS: Array<{
  matchKey: string;
  substitute: string;
  ratio: string;
  notes: string;
  neededPresentKey?: string;
}> = [
  {
    matchKey: 'heavy cream',
    substitute: 'Greek Yogurt (whisked with milk/water)',
    ratio: 'Use 3/4 cup Greek yogurt whisked with 1/4 cup water or oat milk.',
    notes: 'Adds pleasant richness while reducing excess fat in baked dishes and frittatas.',
    neededPresentKey: 'yogurt',
  },
  {
    matchKey: 'sour cream',
    substitute: 'Greek Yogurt',
    ratio: '1:1 ratio direct replacement.',
    notes: 'Nearly identical tang and body, with higher protein content.',
    neededPresentKey: 'yogurt',
  },
  {
    matchKey: 'tahini',
    substitute: 'Greek Yogurt + Olive Oil & Cumin',
    ratio: 'Mix 2 tbsp Greek yogurt with 1 tsp olive oil and a pinch of cumin.',
    notes: 'Creates creamy Mediterranean emulsion for grain bowls without sesame paste.',
    neededPresentKey: 'yogurt',
  },
  {
    matchKey: 'butter',
    substitute: 'Extra Virgin Olive Oil',
    ratio: 'Use 3/4 volume of olive oil for melted butter in cooking or sautéing.',
    notes: 'Heart-healthy fat alternative suitable for vegetable skillets.',
  },
  {
    matchKey: 'buttermilk',
    substitute: 'Milk + Lemon Juice or Vinegar',
    ratio: 'Add 1 tbsp lemon juice to 1 cup milk; rest 5 minutes.',
    notes: 'Creates instantaneous domestic acid reaction for baking.',
    neededPresentKey: 'milk',
  },
  {
    matchKey: 'cheddar cheese',
    substitute: 'Parmesan or Crumbled Feta',
    ratio: '1:1 ratio by volume.',
    notes: 'Provides equivalent savory umami notes in egg dishes.',
  },
];

export function findLocalSubstitution(
  missingIngredient: string,
  availableIngredients: string[]
): SubstitutionResult | null {
  const normMissing = missingIngredient.toLowerCase().trim();
  const normAvailable = availableIngredients.map((s) => s.toLowerCase().trim());

  for (const item of COMMON_SUBSTITUTIONS) {
    if (normMissing.includes(item.matchKey)) {
      // Check if required base ingredient is present (if specified)
      if (item.neededPresentKey) {
        const hasBase = normAvailable.some((avail) => avail.includes(item.neededPresentKey!));
        if (!hasBase) continue;
      }

      return {
        original_ingredient: missingIngredient,
        substitute_ingredient: item.substitute,
        confidence: 0.94,
        ratio_instructions: item.ratio,
        culinary_notes: item.notes,
      };
    }
  }

  // Fallback: If Greek Yogurt is in the fridge and missing item is dairy-adjacent
  if (
    normAvailable.some((a) => a.includes('yogurt')) &&
    (normMissing.includes('cream') || normMissing.includes('mayo') || normMissing.includes('sauce'))
  ) {
    return {
      original_ingredient: missingIngredient,
      substitute_ingredient: 'Greek Yogurt with a pinch of salt & lemon',
      confidence: 0.88,
      ratio_instructions: 'Use equal parts as a creamy base substitute.',
      culinary_notes: 'Provides culinary binding without requiring an extra grocery run.',
    };
  }

  return null;
}
