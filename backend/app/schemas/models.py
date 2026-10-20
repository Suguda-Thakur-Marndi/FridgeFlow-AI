from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class IngredientPrediction(BaseModel):
    name: str = Field(..., description="Recognized common ingredient name, e.g. 'Baby Spinach'")
    category: str = Field(..., description="Category, e.g. 'Produce', 'Dairy & Egg', 'Meat', 'Pantry'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    estimated_shelf_life_days: int = Field(default=5, ge=1, le=365, description="Recommended shelf-life in days")
    quantity: float = Field(default=1.0, description="Detected or default quantity")
    unit: str = Field(default="item", description="Unit of measure, e.g. 'bag', 'tub', 'whole', 'item'")
    needs_review: bool = Field(default=False, description="Whether human confirmation is urged (confidence < 0.85)")
    flagged: bool = Field(default=False, description="Flagged for quick spoilage or uncertain label")
    notes: Optional[str] = Field(default=None, description="Culinary advice or freshness observation")


class ScanResponse(BaseModel):
    status: str = Field(default="success")
    model_name: str = Field(default="gemma-3-4b-it / paligemma-2")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    items_detected: int = Field(...)
    needs_review_count: int = Field(default=0)
    ingredients: List[IngredientPrediction] = Field(default_factory=list)
    raw_summary: Optional[str] = None
    processing_time_ms: int = Field(default=0)


class RecipeIngredient(BaseModel):
    name: str
    amount: str
    in_stock: bool = False


class RecipeSuggestion(BaseModel):
    id: str
    title: str
    description: str
    category: str
    match_percentage: int = Field(..., ge=0, le=100)
    prep_time_minutes: int
    servings: int
    difficulty: str  # "Easy", "Medium", "Hard"
    image_url: Optional[str] = None
    in_stock_ingredients: List[str] = Field(default_factory=list)
    missing_ingredients: List[str] = Field(default_factory=list)
    instructions: List[str] = Field(default_factory=list)
    dietary_tags: List[str] = Field(default_factory=list)
    crisper_first: bool = False
    expiring_items_used: List[str] = Field(default_factory=list)


class RecipeRequest(BaseModel):
    available_ingredients: List[str]
    expiring_ingredients: Optional[List[str]] = None
    dietary_preferences: Optional[List[str]] = None
    max_prep_time_minutes: Optional[int] = None
    user_prompt: Optional[str] = None


class SubstitutionRequest(BaseModel):
    missing_ingredient: str
    available_ingredients: List[str]
    recipe_context: Optional[str] = None


class SubstitutionResponse(BaseModel):
    original_ingredient: str
    substitute_ingredient: str
    confidence: float
    ratio_instructions: str
    culinary_notes: str


class MissingIngredientsRequest(BaseModel):
    recipe_ingredients: List[str] = Field(..., description="Required ingredients for recipe")
    available_ingredients: List[str] = Field(..., description="Currently available user ingredients")


class MissingIngredientsResponse(BaseModel):
    total_required: int
    in_stock_count: int
    missing_count: int
    match_percentage: int
    in_stock_ingredients: List[str]
    missing_ingredients: List[str]


class ClientConfigResponse(BaseModel):
    app_name: str = "FridgeFlow AI"
    model: str
    version: str = "1.0.0"
    max_upload_size_bytes: int = 10 * 1024 * 1024
    supported_mime_types: List[str] = Field(default_factory=lambda: ["image/jpeg", "image/png", "image/webp"])
    categories: List[str] = Field(
        default_factory=lambda: [
            "Vegetables",
            "Fruits",
            "Produce",
            "Dairy & Egg",
            "Meat & Seafood",
            "Pantry & Dry Goods",
            "Bakery",
            "Beverage",
            "Other",
        ]
    )
    common_units: List[str] = Field(
        default_factory=lambda: ["item", "bag", "whole", "tub", "bottle", "can", "carton", "bunch", "g", "kg", "ml", "L"]
    )

