from typing import List, Dict, Optional
from backend.app.schemas.models import RecipeSuggestion, RecipeRequest, SubstitutionResponse

# Curated recipe knowledge base tuned for zero-waste domestic cooking
MASTER_RECIPES = [
    {
        "id": "recipe-garden-skillet",
        "title": "Garden Spinach & Egg Skillet",
        "description": "Pan-sautéed breakfast-for-dinner bowl with melted cheddar and fresh crisp peppers.",
        "category": "Quick Skillets",
        "prep_time_minutes": 15,
        "servings": 2,
        "difficulty": "Easy",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBgOCPpB99ZOeyaMjwXbkUJS4y7un4OJI8E1p85fpnY51wqma5qhpdZsvI0Jh_TkqKI9iudvugzNWmDclXbMyOYBBwGS2sFJrUMhOLomkI42Z8bMz-yQojGINWz2XieEYDm-UjikXPf8vhMrUqalBh-diwnBHoxLkm2_HDwKmqgsEWH67BRiP1S9ApZ-8-4qX0vkCP2unG7XDtwzvL4vYT-NgcpzHQIY4DN52GufFYw6G4A1UHNglQ8",
        "required_ingredients": ["Eggs", "Baby Spinach", "Cheddar Cheese", "Red Bell Pepper"],
        "instructions": [
            "Heat a cast iron skillet over medium heat with a light drizzle of oil or butter.",
            "Dice the red bell pepper and sauté for 3 minutes until tender-crisp.",
            "Toss in the baby spinach leaves and allow them to gently wilt for 1 minute.",
            "Crack the eggs directly into the skillet, lightly scramble, and season with salt and pepper.",
            "Sprinkle shredded cheddar cheese over the top, cover for 60 seconds until melted, and serve hot."
        ],
        "dietary_tags": ["Vegetarian", "Gluten-Free", "High Protein", "Quick (< 20m)"]
    },
    {
        "id": "recipe-chickpea-bowl",
        "title": "Crispy Spiced Chickpea & Green Bowl",
        "description": "Warm grain & yogurt bowl topped with spiced roasted chickpeas and tender greens.",
        "category": "Mediterranean Bowls",
        "prep_time_minutes": 25,
        "servings": 2,
        "difficulty": "Easy",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBcxE0E4SeqXzoedMtFrshvYDknFx2RCfb8fHeFE54_pf9eJd6ZBtTCRUdfW4ufBG66bwB2_8HHNem3VQQd4ajIC97IUDS7hyHRcOju5N08f1wBY71xNl2B1pPoCsHQg5VfGf2a8nl6gj3JI0y7ae05gUpB7XsBLY2ygKrviUk8O5KDDhjwdlur0g6UadaTuSshBM_a_mM_g4lr0rNQrMPkTB5MMDNrKE7xDMS-nvugWV72V9PeKneF",
        "required_ingredients": ["Greek Yogurt", "Baby Spinach", "Red Bell Pepper", "Canned Chickpeas", "Tahini"],
        "instructions": [
            "Rinse and drain canned chickpeas thoroughly, pat dry with a paper towel.",
            "Toss chickpeas with olive oil, cumin, paprika, salt, and roast in a pan or oven until crispy.",
            "Whisk Greek yogurt with a spoonful of tahini, lemon juice, and a pinch of salt to form a creamy dressing.",
            "Arrange a bed of baby spinach and sliced raw bell peppers in serving bowls.",
            "Top with warm crispy chickpeas and drizzle generously with the savory yogurt dressing."
        ],
        "dietary_tags": ["Vegetarian", "High Fiber", "Mediterranean"]
    },
    {
        "id": "recipe-frittata-bake",
        "title": "Creamy Vegetable Frittata Bake",
        "description": "Fluffy oven-baked frittata layered with caramelized peppers, spinach, and savory cheese.",
        "category": "Oven Bakes",
        "prep_time_minutes": 30,
        "servings": 4,
        "difficulty": "Medium",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBGX66K93g_1X9c3_821k12j_189218392183",
        "required_ingredients": ["Eggs", "Baby Spinach", "Cheddar Cheese", "Heavy Cream"],
        "instructions": [
            "Preheat oven to 375°F (190°C) and grease a medium pie dish or oven-safe skillet.",
            "Beat eggs together with heavy cream (or Greek yogurt substitute), salt, and black pepper.",
            "Fold in wilted baby spinach and half of the grated cheddar cheese.",
            "Pour into the baking dish and top with the remaining cheddar cheese.",
            "Bake for 20-25 minutes until the center is set and the edges are golden brown."
        ],
        "dietary_tags": ["Vegetarian", "Keto", "High Protein"]
    }
]

KNOWN_SUBSTITUTIONS = {
    "heavy cream": {
        "substitute": "Greek Yogurt (thinned with milk/water)",
        "confidence": 0.94,
        "ratio": "Use 3/4 cup Greek yogurt whisked with 1/4 cup water or oat milk for 1 cup heavy cream.",
        "notes": "Adds a pleasant tangy richness while reducing excess fat in baked egg dishes."
    },
    "sour cream": {
        "substitute": "Greek Yogurt",
        "confidence": 0.98,
        "ratio": "Direct 1:1 replacement.",
        "notes": "Nearly identical texture and acidity in dressings and dips."
    },
    "dairy milk": {
        "substitute": "Oat Milk (Barista)",
        "confidence": 0.92,
        "ratio": "Direct 1:1 replacement in baking and pan sauces.",
        "notes": "Provides smooth body and mild natural sweetness."
    }
}


class RecipeEngine:
    @staticmethod
    def match_recipes(request: RecipeRequest) -> List[RecipeSuggestion]:
        # Normalize inventory item names for fuzzy matching
        user_items_lower = [it.lower().strip() for it in request.available_ingredients]
        expiring_items_lower = [it.lower().strip() for it in (request.expiring_ingredients or [])]

        suggestions: List[RecipeSuggestion] = []

        for recipe in MASTER_RECIPES:
            required = recipe["required_ingredients"]
            in_stock: List[str] = []
            missing: List[str] = []
            expiring_used: List[str] = []

            for req in required:
                req_lower = req.lower()
                matched = False
                for u_item in user_items_lower:
                    if req_lower in u_item or u_item in req_lower:
                        matched = True
                        in_stock.append(req)
                        # Check if this item is expiring soon
                        if any(exp in req_lower or req_lower in exp for exp in expiring_items_lower):
                            expiring_used.append(req)
                        break
                if not matched:
                    missing.append(req)

            match_pct = int((len(in_stock) / len(required)) * 100) if required else 0
            crisper_priority = len(expiring_used) > 0

            # Filter by diet if specified
            if request.dietary_preferences:
                diet_match = all(
                    any(p.lower() in tag.lower() for tag in recipe["dietary_tags"])
                    for p in request.dietary_preferences
                )
                if not diet_match:
                    continue

            # Filter by prep time if specified
            if request.max_prep_time_minutes and recipe["prep_time_minutes"] > request.max_prep_time_minutes:
                continue

            suggestions.append(RecipeSuggestion(
                id=recipe["id"],
                title=recipe["title"],
                description=recipe["description"],
                category=recipe["category"],
                match_percentage=match_pct,
                prep_time_minutes=recipe["prep_time_minutes"],
                servings=recipe["servings"],
                difficulty=recipe["difficulty"],
                image_url=recipe.get("image_url"),
                in_stock_ingredients=in_stock,
                missing_ingredients=missing,
                instructions=recipe["instructions"],
                dietary_tags=recipe["dietary_tags"],
                crisper_first=crisper_priority,
                expiring_items_used=expiring_used
            ))

        # Sort: Crisper-first recipes first, then by match percentage descending
        suggestions.sort(key=lambda s: (1 if s.crisper_first else 0, s.match_percentage), reverse=True)
        return suggestions

    @staticmethod
    def get_substitution(missing: str, available: List[str]) -> Optional[SubstitutionResponse]:
        missing_clean = missing.lower().strip()
        for key, sub_info in KNOWN_SUBSTITUTIONS.items():
            if key in missing_clean or missing_clean in key:
                # Check if user has the suggested substitute in available ingredients
                for avail in available:
                    avail_lower = avail.lower()
                    if "yogurt" in avail_lower and "yogurt" in sub_info["substitute"].lower():
                        return SubstitutionResponse(
                            original_ingredient=missing,
                            substitute_ingredient=avail,
                            confidence=sub_info["confidence"],
                            ratio_instructions=sub_info["ratio"],
                            culinary_notes=sub_info["notes"]
                        )
                    if "oat milk" in avail_lower and "oat milk" in sub_info["substitute"].lower():
                        return SubstitutionResponse(
                            original_ingredient=missing,
                            substitute_ingredient=avail,
                            confidence=sub_info["confidence"],
                            ratio_instructions=sub_info["ratio"],
                            culinary_notes=sub_info["notes"]
                        )
                # Generic suggestion even if not in stock
                return SubstitutionResponse(
                    original_ingredient=missing,
                    substitute_ingredient=sub_info["substitute"],
                    confidence=sub_info["confidence"],
                    ratio_instructions=sub_info["ratio"],
                    culinary_notes=sub_info["notes"]
                )
        return None
