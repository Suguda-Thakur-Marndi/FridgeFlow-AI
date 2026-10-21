import { Recipe } from '@/types';

export const MASTER_RECIPES: Recipe[] = [
  {
    id: 'recipe-garden-skillet',
    title: 'Garden Spinach & Egg Skillet',
    description: 'Pan-sautéed breakfast-for-dinner bowl with melted cheddar and fresh crisp peppers.',
    category: 'Quick Skillets',
    match_percentage: 100,
    prep_time_minutes: 15,
    servings: 2,
    difficulty: 'Easy',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgOCPpB99ZOeyaMjwXbkUJS4y7un4OJI8E1p85fpnY51wqma5qhpdZsvI0Jh_TkqKI9iudvugzNWmDclXbMyOYBBwGS2sFJrUMhOLomkI42Z8bMz-yQojGINWz2XieEYDm-UjikXPf8vhMrUqalBh-diwnBHoxLkm2_HDwKmqgsEWH67BRiP1S9ApZ-8-4qX0vkCP2unG7XDtwzvL4vYT-NgcpzHQIY4DN52GufFYw6G4A1UHNglQ8',
    in_stock_ingredients: ['Eggs', 'Baby Spinach', 'Cheddar Cheese', 'Red Bell Pepper'],
    missing_ingredients: [],
    instructions: [
      'Heat a skillet over medium heat with olive oil or butter.',
      'Dice bell pepper and sauté for 3 minutes until tender-crisp.',
      'Add baby spinach and wilt gently for 60 seconds.',
      'Crack in eggs and cook to your preferred doneness.',
      'Top with cheddar, cover with lid to melt, and season with sea salt.',
    ],
    dietary_tags: ['Vegetarian', 'High Protein', 'Quick (< 20m)'],
    crisper_first: true,
    expiring_items_used: ['Baby Spinach'],
  },
  {
    id: 'recipe-chickpea-bowl',
    title: 'Crispy Spiced Chickpea & Green Bowl',
    description: 'Warm grain & yogurt bowl topped with spiced roasted chickpeas and tender greens.',
    category: 'Mediterranean Bowls',
    match_percentage: 80,
    prep_time_minutes: 25,
    servings: 2,
    difficulty: 'Easy',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBcxE0E4SeqXzoedMtFrshvYDknFx2RCfb8fHeFE54_pf9eJd6ZBtTCRUdfW4ufBG66bwB2_8HHNem3VQQd4ajIC97IUDS7hyHRcOju5N08f1wBY71xNl2B1pPoCsHQg5VfGf2a8nl6gj3JI0y7ae05gUpB7XsBLY2ygKrviUk8O5KDDhjwdlur0g6UadaTuSshBM_a_mM_g4lr0rNQrMPkTB5MMDNrKE7xDMS-nvugWV72V9PeKneF',
    in_stock_ingredients: ['Greek Yogurt', 'Baby Spinach', 'Red Bell Pepper'],
    missing_ingredients: ['Canned Chickpeas', 'Tahini'],
    instructions: [
      'Toss drained chickpeas with olive oil, cumin, and sea salt; roast until crispy.',
      'Whisk Greek yogurt with lemon juice and a touch of tahini or garlic.',
      'Layer fresh baby spinach and sliced bell pepper into bowls.',
      'Spoon over yogurt dressing and top with warm crispy chickpeas.',
    ],
    dietary_tags: ['Vegetarian', 'High Fiber', 'Mediterranean'],
    crisper_first: true,
    expiring_items_used: ['Baby Spinach', 'Greek Yogurt'],
  },
  {
    id: 'recipe-frittata-bake',
    title: 'Creamy Vegetable Frittata Bake',
    description: 'Fluffy oven-baked frittata layered with caramelized peppers, spinach, and savory cheese.',
    category: 'Oven Bakes',
    match_percentage: 75,
    prep_time_minutes: 30,
    servings: 4,
    difficulty: 'Medium',
    image_url: undefined,
    in_stock_ingredients: ['Eggs', 'Baby Spinach', 'Cheddar Cheese'],
    missing_ingredients: ['Heavy Cream'],
    instructions: [
      'Preheat oven to 375°F (190°C).',
      'Whisk eggs with Greek yogurt or milk as a domestic substitute for heavy cream.',
      'Fold in chopped spinach, bell peppers, and half the cheese.',
      'Pour into greased baking dish, sprinkle remaining cheese, and bake for 22 minutes.',
    ],
    dietary_tags: ['Vegetarian', 'Keto', 'High Protein'],
    crisper_first: true,
    expiring_items_used: ['Baby Spinach'],
  },
  {
    id: 'recipe-berry-yogurt-parfait',
    title: 'Fresh Berry Greek Yogurt Parfait',
    description: 'Layered breakfast parfait with thick yogurt, sliced strawberries, and honey drizzle.',
    category: 'Quick Breakfast',
    match_percentage: 90,
    prep_time_minutes: 5,
    servings: 1,
    difficulty: 'Easy',
    image_url: undefined,
    in_stock_ingredients: ['Greek Yogurt', 'Strawberries'],
    missing_ingredients: ['Granola'],
    instructions: [
      'Spoon Greek yogurt into a glass or bowl.',
      'Wash and slice fresh strawberries.',
      'Layer strawberries over yogurt and drizzle with honey or maple syrup.',
    ],
    dietary_tags: ['Vegetarian', 'Quick (< 10m)', 'Gluten-Free'],
    crisper_first: true,
    expiring_items_used: ['Strawberries', 'Greek Yogurt'],
  },
];

export function matchLocalRecipes(
  availableIngredients: string[],
  expiringIngredients: string[] = []
): Recipe[] {
  const normAvailable = availableIngredients.map((s) => s.toLowerCase().trim());
  const normExpiring = expiringIngredients.map((s) => s.toLowerCase().trim());

  const matched = MASTER_RECIPES.map((recipe) => {
    const required = [...recipe.in_stock_ingredients, ...recipe.missing_ingredients];
    const inStock: string[] = [];
    const missing: string[] = [];

    for (const req of required) {
      const reqNorm = req.toLowerCase().trim();
      const isPresent = normAvailable.some(
        (avail) => avail.includes(reqNorm) || reqNorm.includes(avail)
      );
      if (isPresent) {
        inStock.push(req);
      } else {
        missing.push(req);
      }
    }

    const pct = required.length > 0 ? Math.round((inStock.length / required.length) * 100) : 0;

    const expiringUsed = expiringIngredients.filter((exp) =>
      inStock.some((stock) => stock.toLowerCase().includes(exp.toLowerCase()) || exp.toLowerCase().includes(stock.toLowerCase()))
    );

    return {
      ...recipe,
      in_stock_ingredients: inStock,
      missing_ingredients: missing,
      match_percentage: pct,
      crisper_first: expiringUsed.length > 0,
      expiring_items_used: expiringUsed,
    };
  });

  // Sort recipes: highest match percentage first, then crisper-first priority
  return matched.sort((a, b) => {
    if (a.crisper_first !== b.crisper_first) {
      return a.crisper_first ? -1 : 1;
    }
    return b.match_percentage - a.match_percentage;
  });
}
