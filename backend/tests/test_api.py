import pytest
from fastapi.testclient import TestClient
import io
from PIL import Image

from backend.app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "FridgeFlow AI"
    assert "/api/v1/health" in data["health_check"]


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FridgeFlow AI" in data["service"]


def test_model_info():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "Gemma" in data["model_family"]
    assert "gemma-3" in data["recommended_vision_checkpoint"] or "paligemma" in data["recommended_vision_checkpoint"]


def test_recipe_matching_crisper_first():
    payload = {
        "available_ingredients": ["Baby Spinach", "Eggs", "Cheddar Cheese", "Red Bell Pepper"],
        "expiring_ingredients": ["Baby Spinach"],
        "dietary_preferences": ["Vegetarian"]
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 200
    recipes = response.json()
    assert len(recipes) >= 1
    
    # Skillet should be 100% match
    skillet = next((r for r in recipes if "Skillet" in r["title"]), None)
    assert skillet is not None
    assert skillet["match_percentage"] == 100
    assert skillet["crisper_first"] is True
    assert len(skillet["missing_ingredients"]) == 0


def test_recipe_missing_ingredients():
    payload = {
        "available_ingredients": ["Greek Yogurt", "Baby Spinach", "Red Bell Pepper"],
        "expiring_ingredients": []
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 200
    recipes = response.json()
    
    chickpea_bowl = next((r for r in recipes if "Chickpea" in r["title"]), None)
    assert chickpea_bowl is not None
    assert chickpea_bowl["match_percentage"] < 100
    assert "Canned Chickpeas" in chickpea_bowl["missing_ingredients"]


def test_substitution_valid():
    payload = {
        "missing_ingredient": "Heavy Cream",
        "available_ingredients": ["Greek Yogurt", "Eggs", "Spinach"]
    }
    response = client.post("/api/v1/substitutions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Yogurt" in data["substitute_ingredient"] or "yogurt" in data["substitute_ingredient"].lower()
    assert data["confidence"] > 0.8


def test_substitution_not_found():
    payload = {
        "missing_ingredient": "Exotic Truffle Oil XYZ",
        "available_ingredients": ["Water"]
    }
    response = client.post("/api/v1/substitutions", json=payload)
    assert response.status_code == 404


def test_scan_empty_image():
    response = client.post("/api/v1/scan", files={"file": ("test.jpg", b"", "image/jpeg")})
    assert response.status_code == 400


def test_scan_valid_image_bytes():
    # Generate a small 100x100 RGB image in-memory
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    response = client.post("/api/v1/scan", files={"file": ("fridge.jpg", image_bytes, "image/jpeg")})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["items_detected"] > 0
    assert len(data["ingredients"]) > 0
    # Check that ingredients have required fields
    first_item = data["ingredients"][0]
    assert "name" in first_item
    assert "confidence" in first_item
    assert "estimated_shelf_life_days" in first_item
