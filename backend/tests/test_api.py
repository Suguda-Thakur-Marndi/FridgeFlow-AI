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


def test_root_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FridgeFlow AI" in data["service"]


def test_client_config():
    response = client.get("/api/v1/config")
    assert response.status_code == 200
    data = response.json()
    assert data["app_name"] == "FridgeFlow AI"
    assert "model" in data
    assert len(data["categories"]) >= 5
    assert "image/jpeg" in data["supported_mime_types"]


def test_reference_ingredients():
    response = client.get("/api/v1/ingredients")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    assert len(data["items"]) == data["count"]
    assert "Baby Spinach" in [item["name"] for item in data["items"]]
    assert "Vegetables" in data["categories"]


def test_recipe_suggest_alias():
    payload = {
        "available_ingredients": ["Baby Spinach", "Eggs", "Cheddar Cheese"],
        "expiring_ingredients": ["Baby Spinach"],
        "dietary_preferences": ["Vegetarian"]
    }
    response = client.post("/api/v1/recipes/suggest", json=payload)
    assert response.status_code == 200
    recipes = response.json()
    assert len(recipes) >= 1
    assert any("Skillet" in r["title"] or "Spinach" in r["title"] for r in recipes)


def test_calculate_missing_ingredients_endpoint():
    payload = {
        "recipe_ingredients": ["Eggs", "Baby Spinach", "Feta Cheese", "Olive Oil"],
        "available_ingredients": ["Eggs", "Baby Spinach"]
    }
    response = client.post("/api/v1/recipes/missing-ingredients", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_required"] == 4
    assert data["in_stock_count"] == 2
    assert data["missing_count"] == 2
    assert data["match_percentage"] == 50
    assert "Eggs" in data["in_stock_ingredients"]
    assert "Feta Cheese" in data["missing_ingredients"]


def test_scan_real_image_produce():
    # Read the real image from mobile assets
    import os
    img_path = os.path.join(os.path.dirname(__file__), "..", "..", "mobile", "assets", "images", "hero_produce.jpg")
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            content = f.read()
        response = client.post("/api/v1/scan", files={"file": ("hero_produce.jpg", content, "image/jpeg")})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["items_detected"] > 0
        assert len(data["ingredients"]) > 0
        names = [item["name"].lower() for item in data["ingredients"]]
        # Either real gemma detected avocados/kale/tomatoes or calibrated reference
        assert any("avocado" in n or "kale" in n or "tomato" in n or "spinach" in n for n in names)


def test_scan_oversized_image():
    # 16 MB dummy payload
    oversized_data = b"X" * (16 * 1024 * 1024)
    response = client.post("/api/v1/scan", files={"file": ("huge.jpg", oversized_data, "image/jpeg")})
    assert response.status_code == 413
    assert "exceeds maximum allowed size" in response.json()["detail"]


def test_scan_invalid_format():
    response = client.post("/api/v1/scan", files={"file": ("invalid.txt", b"This is plain text, not an image.", "text/plain")})
    assert response.status_code == 400
    assert "not a valid image" in response.json()["detail"]


def test_scan_is_live_flag():
    img = Image.new("RGB", (50, 50), color=(10, 20, 30))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    response = client.post("/api/v1/scan", files={"file": ("test.jpg", buf.getvalue(), "image/jpeg")})
    assert response.status_code == 200
    data = response.json()
    assert "is_live_model" in data
    assert isinstance(data["is_live_model"], bool)



