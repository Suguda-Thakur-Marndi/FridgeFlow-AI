from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List, Optional
import json

from backend.app.schemas.models import (
    ScanResponse,
    RecipeRequest,
    RecipeSuggestion,
    SubstitutionRequest,
    SubstitutionResponse
)
from backend.app.services.gemma_service import GemmaVisionService
from backend.app.services.recipe_engine import RecipeEngine

router = APIRouter(prefix="/api/v1")
vision_service = GemmaVisionService()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FridgeFlow AI Vision & Culinary Engine",
        "model": vision_service.model_name,
        "version": "1.0.0",
        "hacktoberfest_week": "Week 3 - Slow and Steady"
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

    try:
        result = await vision_service.analyze_image_bytes(contents, filename=file.filename or "upload.jpg")
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision inference error: {str(e)}")


@router.post("/recipes", response_model=List[RecipeSuggestion])
async def get_recipe_recommendations(request: RecipeRequest):
    """
    Returns personalized meal plans ranked crisper-first based on available ingredients,
    marking zero-waste matches and identifying missing items.
    """
    try:
        return RecipeEngine.match_recipes(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe matching failed: {str(e)}")


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
