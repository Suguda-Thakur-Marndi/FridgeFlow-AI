from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List, Optional

from backend.app.schemas.models import (
    ScanResponse,
    RecipeRequest,
    RecipeSuggestion,
    SubstitutionRequest,
    SubstitutionResponse,
    MissingIngredientsRequest,
    MissingIngredientsResponse,
    ClientConfigResponse,
)
from backend.app.services.gemma_service import GemmaVisionService
from backend.app.services.recipe_engine import RecipeEngine

router = APIRouter(prefix="/api/v1")
vision_service = GemmaVisionService()

# Common master reference ingredients for inventory guidance
MASTER_REFERENCE_INGREDIENTS = [
    {"name": "Baby Spinach", "category": "Vegetables", "default_shelf_life_days": 3, "unit": "bag"},
    {"name": "Red Bell Pepper", "category": "Vegetables", "default_shelf_life_days": 7, "unit": "whole"},
    {"name": "Avocados", "category": "Fruits", "default_shelf_life_days": 5, "unit": "whole"},
    {"name": "Lemons", "category": "Fruits", "default_shelf_life_days": 14, "unit": "whole"},
    {"name": "Eggs (Organic)", "category": "Dairy & Egg", "default_shelf_life_days": 14, "unit": "large"},
    {"name": "Greek Yogurt", "category": "Dairy & Egg", "default_shelf_life_days": 7, "unit": "tub"},
    {"name": "Cheddar Cheese", "category": "Dairy & Egg", "default_shelf_life_days": 21, "unit": "block"},
    {"name": "Oat Milk", "category": "Dairy & Egg", "default_shelf_life_days": 7, "unit": "L"},
    {"name": "Chicken Breast", "category": "Meat & Seafood", "default_shelf_life_days": 3, "unit": "pack"},
    {"name": "Salmon Fillet", "category": "Meat & Seafood", "default_shelf_life_days": 2, "unit": "fillet"},
    {"name": "Tofu (Firm)", "category": "Meat & Seafood", "default_shelf_life_days": 7, "unit": "block"},
    {"name": "Canned Chickpeas", "category": "Pantry & Dry Goods", "default_shelf_life_days": 365, "unit": "can"},
    {"name": "Tahini Paste", "category": "Pantry & Dry Goods", "default_shelf_life_days": 180, "unit": "jar"},
    {"name": "Extra Virgin Olive Oil", "category": "Pantry & Dry Goods", "default_shelf_life_days": 365, "unit": "bottle"},
]


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FridgeFlow AI Vision & Culinary Engine",
        "model": vision_service.model_name,
        "version": "1.0.0",
        "hacktoberfest_week": "Week 3 - Slow and Steady"
    }


@router.get("/config", response_model=ClientConfigResponse)
async def get_client_config():
    """
    Exposes safe, non-secret client configuration for mobile runtime alignment.
    """
    return ClientConfigResponse(
        app_name="FridgeFlow AI",
        model=vision_service.model_name,
        version="1.0.0",
    )


@router.get("/ingredients")
async def get_reference_ingredients():
    """
    Returns reference food inventory categories and common shelf-life guidance.
    """
    return {
        "count": len(MASTER_REFERENCE_INGREDIENTS),
        "items": MASTER_REFERENCE_INGREDIENTS,
        "categories": [
            "Vegetables",
            "Fruits",
            "Produce",
            "Dairy & Egg",
            "Meat & Seafood",
            "Pantry & Dry Goods",
            "Bakery",
            "Beverage",
            "Other",
        ],
    }


@router.get("/model-info")
async def model_info():
    return {
        "model_family": "Gemma Open Models (Google DeepMind)",
        "recommended_vision_checkpoint": "gemma-3-4b-it or paligemma-2-3b-pt",
        "license": "Gemma Terms of Use (Open Weights, Commercial & Research permitted)",
        "vision_capabilities": [
            "Produce item recognition",
            "Packaging & label OCR",
            "Shelf-life & freshness estimation",
            "Multi-item bounding extraction"
        ],
        "local_setup_command": "ollama run gemma3:4b",
        "render_deployment_mode": "Cloud API with environment-variable inference bridge"
    }


@router.post("/scan", response_model=ScanResponse)
async def scan_fridge_image(
    file: UploadFile = File(None)
):
    """
    Accepts an image file from the mobile camera or gallery,
    analyzes it using the open-weight Gemma vision pipeline,
    and returns verified ingredient predictions.
    """
    if file is None:
        raise HTTPException(status_code=400, detail="An image file is required.")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Image file exceeds maximum allowed size of 15MB.")

    try:
        result = await vision_service.analyze_image_bytes(contents, filename=file.filename or "upload.jpg")
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision inference error: {str(e)}")


@router.post("/recipes/suggest", response_model=List[RecipeSuggestion])
@router.post("/recipes", response_model=List[RecipeSuggestion])
async def suggest_recipes(request: RecipeRequest):
    """
    Suggests meals based on the provided confirmed ingredient inventory,
    prioritizing crisper items expiring soonest.
    """
    try:
        return RecipeEngine.match_recipes(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe suggestion failed: {str(e)}")


@router.post("/recipes/missing-ingredients", response_model=MissingIngredientsResponse)
async def calculate_missing_ingredients(request: MissingIngredientsRequest):
    """
    Calculates available vs missing ingredients for a specific recipe request.
    """
    avail_lower = [a.lower().strip() for a in request.available_ingredients]
    in_stock = []
    missing = []

    for req in request.recipe_ingredients:
        req_clean = req.lower().strip()
        matched = any(req_clean in a or a in req_clean for a in avail_lower)
        if matched:
            in_stock.append(req)
        else:
            missing.append(req)

    total = len(request.recipe_ingredients)
    pct = int((len(in_stock) / total) * 100) if total > 0 else 0

    return MissingIngredientsResponse(
        total_required=total,
        in_stock_count=len(in_stock),
        missing_count=len(missing),
        match_percentage=pct,
        in_stock_ingredients=in_stock,
        missing_ingredients=missing,
    )


@router.post("/substitutions", response_model=Optional[SubstitutionResponse])
async def get_ingredient_substitution(request: SubstitutionRequest):
    """
    Suggests smart domestic culinary substitutions for missing recipe ingredients
    based on ingredients currently in the user's crisper.
    """
    sub = RecipeEngine.get_substitution(request.missing_ingredient, request.available_ingredients)
    if not sub:
        raise HTTPException(status_code=404, detail="No reliable culinary substitution found for this item.")
    return sub
