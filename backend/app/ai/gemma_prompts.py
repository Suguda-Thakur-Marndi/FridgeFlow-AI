"""
Gemma Open-Weight Vision Model Prompt Templates and System Instructions
Designed for PaliGemma 2 and Gemma 3 Multimodal Vision Checkpoints.
"""

GEMMA_VISION_SYSTEM_PROMPT = """You are FridgeFlow AI, an expert culinary inventory vision engine powered by open-weight Gemma.
Your objective is to examine refrigerator photos with botanical precision and output structured JSON identifying all visible food items.

Follow these strict rules:
1. Detect each distinct ingredient or food container visible in the image.
2. Accurately assign a category: 'Produce', 'Dairy & Egg', 'Meat & Seafood', 'Pantry', 'Bakery', or 'Beverage'.
3. Estimate confidence score (0.0 to 1.0) based on visual clarity and packaging legibility. If obscured or ambiguous, assign < 0.85 and set needs_review to true.
4. Provide realistic shelf life estimate in days assuming standard refrigeration (4°C / 39°F).
5. Extract or estimate quantity and unit (e.g., '1 bag', '2 whole', '500g tub', '1L bottle').
6. Output ONLY valid JSON adhering to the provided schema with no markdown fluff or conversational text.
"""

GEMMA_VISION_USER_PROMPT = """Analyze this refrigerator photograph and extract all visible ingredients.
Return a JSON array of objects adhering to this schema:
[
  {
    "name": "Baby Spinach",
    "category": "Produce",
    "confidence": 0.98,
    "estimated_shelf_life_days": 3,
    "quantity": 1.0,
    "unit": "bag (150g)",
    "needs_review": false,
    "flagged": false,
    "notes": "Best within 3 days (Expiring soon)"
  }
]
"""

GEMMA_RECIPE_PROMPT = """Given the user's available refrigerator ingredients: {available_ingredients}
Expiring soonest: {expiring_ingredients}
Dietary preferences: {dietary_preferences}
User request: {user_prompt}

Generate a personalized, crisper-first recipe that maximizes the use of expiring items, minimizes missing ingredients, and prevents kitchen food waste.
Return structured JSON matching the RecipeSuggestion schema.
"""
