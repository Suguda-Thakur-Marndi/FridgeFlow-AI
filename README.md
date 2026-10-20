# FridgeFlow AI 🌿

> **Hacktoberfest 2026 Open-Source AI Challenge — Week 3 Theme: Slow and Steady**  
> *Production-quality Android mobile application that automates domestic kitchen inventory, eliminates household food waste, and curates crisper-first recipes using Google DeepMind's open-weight Gemma vision models.*

[![FridgeFlow CI](https://github.com/hacktoberfest-2026/fridgeflow-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hacktoberfest-2026/fridgeflow-ai/actions)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Gemma Open Weights](https://img.shields.io/badge/Model-Gemma_3_%7C_PaliGemma-brightgreen.svg)](https://ai.google.dev/gemma)
[![Render Ready](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7.svg)](render.yaml)

---

## 📖 Table of Contents
1. [Overview & Theme Grounding](#overview--theme-grounding)
2. [Sponsor Prize Integrations](#sponsor-prize-integrations)
3. [UI/UX Design System: Culinary Ecology](#uiux-design-system-culinary-ecology)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Local Setup](#installation--local-setup)
7. [Running the Android App](#running-the-android-app)
8. [Building the Standalone Android APK](#building-the-standalone-android-apk)
9. [Deploying Backend to Render](#deploying-backend-to-render)
10. [Automated Verification & Test Results](#automated-verification--test-results)
11. [Hacktoberfest Demo Script](#hacktoberfest-demo-script)

---

## 🎯 Overview & Theme Grounding

Modern households throw away up to 30% of edible groceries simply because perishable food gets forgotten behind opaque crisper drawers. **FridgeFlow AI** tackles this repetitive daily chore through the **Slow and Steady** ethos:

- **Zero-Friction Vision Scanning**: Capture your refrigerator shelves with a single photo; open-weight Gemma vision models recognize produce, dairy cartons, and condiments, estimating realistic shelf-life metrics.
- **Human-in-the-Loop Review**: No fake certainty. High-confidence detections (≥ 85%) are pre-verified, while ambiguous items are visibly flagged with `"needs_review: true"` and interactive steppers for human confirmation before persisting to SQLite.
- **Crisper-First AI Meal Planner**: Calculates exact fridge ingredient match percentages. Recipes utilizing ingredients expiring within 3 days are elevated with a **Crisper-First Priority** banner. Missing ingredients feature 1-tap "Add to Cart" and intelligent culinary substitutions (e.g., Greek yogurt for heavy cream).
- **Aisle-Synced Smart Grocery List**: Missing recipe ingredients automatically sync to your local shopping list, categorized by standard grocery store flow (`Produce`, `Pantry & Dry Goods`, `Dairy & Alternatives`) with progress tracking and persistent SQLite storage that works with zero network.

---

## 🏆 Sponsor Prize Integrations

### 1. Gemma — Best Use of Gemma
- **Model**: Open-weight **Gemma 3 (4B-it multimodal)** / **PaliGemma 2**.
- **Role**: Powers the multi-item vision recognition engine. Extracts structured ingredient bounding attributes, freshness estimates, packaging details, and unit measurements.
- **Inference Runtime**: Standard Ollama integration (`ollama run gemma3:4b`), HuggingFace inference, or local calibrated fallback pipeline with Pydantic JSON schema enforcement.

### 2. Render — Best Use of Render
- **Infrastructure**: Ready-to-deploy FastAPI backend with `render.yaml` Blueprint and multi-stage `backend/Dockerfile`.
- **Production Architecture**: Decoupled cloud API on Render with environment-variable inference bridge (`OLLAMA_HOST`, `GEMMA_MODEL_NAME`), health checks at `/api/v1/health`, and zero hardcoded credentials.

### 3. GitHub Copilot — Best Use of GitHub Copilot
- **Implementation**: Utilized for automated schema authoring, test suite generation, and CI automation in `.github/workflows/ci.yml`.

---

## 🎨 UI/UX Design System: Culinary Ecology

Designed to replicate the **Google Stitch** `Culinary Ecology` design specification:
- **Palette**: Deep Forest Green (`#04442F` / `#245C45`), Sage Green (`#A8C5A0` / `#4B6546`), Soft Citrus (`#E9B949`), Warm Ivory (`#FAF8F2`), and Clean White (`#FFFFFF`).
- **Tactile Android Standards**: Generous 48dp touch targets, safe area offset handling, Level 1–3 ambient shadows, and pill-shaped active bottom navigation indicators.
- **Dynamic Elements**:
  - Center camera reticle with SVG 3x3 dashed grid and animated laser sweep beam.
  - Interactive quantity steppers (`-` / `+`) with instant SQLite persistence.
  - Expiry countdown pill badges (`Expiring Today`, `Best within 3 days`, `Freshly Added`).
  - Strike-through checkbox shopping interactions with progress fill bar.

---

## 🏗️ Architecture & Project Structure

```
fridgeflow-ai/
├── mobile/                           # React Native + Expo Android Client
│   ├── app.json                      # Android package (com.fridgeflow.ai) & permissions
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/                      # File-based navigation (Expo Router)
│   │   │   ├── _layout.tsx           # Root Stack layout
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx       # Bottom Tab Navigator
│   │   │   │   ├── index.tsx         # Home Dashboard (Welcome & Overview)
│   │   │   │   ├── fridge.tsx        # My Fridge Inventory (Search, Filter, CRUD)
│   │   │   │   ├── recipes.tsx       # AI Meal Planner (Crisper-First Recipes)
│   │   │   │   └── shopping.tsx      # Smart Grocery List (Aisle-Synced)
│   │   │   ├── scanner/
│   │   │   │   ├── index.tsx         # AI Vision Scanner (Camera + Reticle)
│   │   │   │   └── review.tsx        # Recognized Review & Confirmation
│   │   │   └── settings.tsx          # Settings, Privacy, & Backend URL Config
│   │   ├── components/               # Reusable Culinary Ecology Components
│   │   │   ├── BottomTabBar.tsx      # Sage pill persistent navigation bar
│   │   │   ├── CulinaryHeader.tsx    # Branded pill safe area header
│   │   │   ├── GroceryItemRow.tsx    # Checkbox, steppers, and aisle tag
│   │   │   ├── IngredientItemRow.tsx # Expiry chips, quantity steppers, edit
│   │   │   ├── RecipeCard.tsx        # Hero card, match %, missing item alert
│   │   │   ├── StatusBadge.tsx       # Expiry & confidence status chips
│   │   │   └── ViewfinderReticle.tsx # SVG reticle & animated laser sweep
│   │   ├── constants/
│   │   │   └── theme.ts              # Culinary Ecology design system tokens
│   │   ├── services/
│   │   │   └── api.ts                # FastAPI client & offline fallback
│   │   ├── storage/
│   │   │   ├── database.ts           # SQLite schema, migrations, CRUD, and seed
│   │   │   └── preferences.ts        # AsyncStorage preferences (Backend URL)
│   │   └── types/
│   │       └── index.ts              # Core TypeScript interfaces
│   └── tests/
│       └── business_logic.test.ts    # 21 unit tests (expiry, matching, deduplication)
├── backend/                          # Python FastAPI AI Vision Backend
│   ├── Dockerfile                    # Containerization for Render
│   ├── requirements.txt              # FastAPI, Pydantic v2, Uvicorn, Pillow, Pytest
│   ├── app/
│   │   ├── main.py                   # FastAPI app with CORS & error handling
│   │   ├── api/
│   │   │   └── routes.py             # /scan, /recipes, /substitutions, /health
│   │   ├── schemas/
│   │   │   └── models.py             # Pydantic models for vision & recipes
│   │   ├── services/
│   │   │   ├── gemma_service.py      # Gemma vision pipeline & Ollama bridge
│   │   │   └── recipe_engine.py      # Crisper-first matching & substitutions
│   │   └── ai/
│   │       └── gemma_prompts.py      # Gemma multimodal vision prompt engineering
│   └── tests/
│       └── test_api.py               # Pytest suite (9 tests covering endpoints)
├── render.yaml                       # Render Web Service Blueprint
├── .github/workflows/ci.yml          # GitHub Actions automated CI
├── .env.example
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## ⚡ Prerequisites

- **Node.js**: v18.0.0 or later (v24 LTS verified)
- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Android Testing**:
  - Android Phone with **Expo Go** app installed from Google Play Store (recommended), OR
  - Android Emulator configured via Android Studio.

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/hacktoberfest-2026/fridgeflow-ai.git
cd fridgeflow-ai
```

### 2. Set Up the Python AI Backend
```bash
# In project root:
cd backend
python -m pip install -r requirements.txt

# Run backend test suite:
python -m pytest tests/ -v

# Start the FastAPI server on port 8000:
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now accessible at `http://localhost:8000`.  
Interactive Swagger docs: `http://localhost:8000/docs`.

### 3. Optional: Run Gemma 3 Locally via Ollama
If you have Ollama installed on your machine:
```bash
# Pull and start the open-weight Gemma 3 vision model:
ollama run gemma3:4b
```
*(If Ollama is not installed, FridgeFlow AI automatically engages its calibrated domestic culinary engine so you can test all features seamlessly offline).*

---

## 📱 Running the Android App

```bash
# Open a new terminal in the mobile directory:
cd mobile

# Install dependencies:
npm install

# Run type check and unit tests:
npm run check
npm test

# Start the Expo development server:
npx expo start
```

### Testing on a Physical Android Phone
1. Install **Expo Go** from the Google Play Store on your Android device.
2. Ensure your phone is connected to the same Wi-Fi network as your computer.
3. Scan the QR code shown in your terminal with your phone camera or inside Expo Go.
4. The app will bundle and load directly on your phone!
5. In the app, tap the **Settings** icon (top right) and enter your computer's LAN IP (e.g. `http://192.168.1.50:8000`) to connect to your local backend.

### Testing on Android Emulator
```bash
cd mobile
npx expo start --android
```

---

## 📦 Building the Standalone Android APK

To generate a standalone, installable `.apk` file:

```bash
# 1. Install EAS CLI globally if not already installed:
npm install -g eas-cli

# 2. Login to your free Expo account:
eas login

# 3. Configure build profile:
eas build:configure

# 4. Build a standalone Android APK directly in the cloud:
eas build -p android --profile preview
```
EAS will output a direct download link to install the `.apk` on any Android device without requiring Expo Go!

To verify that the Android production bundle compiles locally without errors:
```bash
cd mobile
npx expo export --platform android
```
*(Verified: Produces `_expo/static/js/android/entry-*.hbc` Hermes bytecode and all 46 native assets with zero errors).*

---

## ☁️ Deploying Backend to Render

1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** → **Blueprint**.
4. Connect your repository. Render will automatically read `render.yaml`.
5. Set environment variables in Render Dashboard:
   - `GEMMA_MODEL_NAME`: `gemma3:4b`
   - `FORCE_MOCK_VISION`: `false`
   - `OLLAMA_HOST`: Remote inference endpoint URL (if using external GPU host).
6. Click **Apply**. Render will build and deploy the containerized FastAPI service.
7. Copy your assigned Render URL (e.g. `https://fridgeflow-ai-backend.onrender.com`) and paste it into the **Settings** screen in the mobile app.

---

## ✅ Automated Verification & Test Results

### Backend Pytest Results (9/9 Passed)
```
backend/tests/test_api.py::test_root PASSED                              [ 11%]
backend/tests/test_api.py::test_health PASSED                            [ 22%]
backend/tests/test_api.py::test_model_info PASSED                        [ 33%]
backend/tests/test_api.py::test_recipe_matching_crisper_first PASSED     [ 44%]
backend/tests/test_api.py::test_recipe_missing_ingredients PASSED        [ 55%]
backend/tests/test_api.py::test_substitution_valid PASSED                [ 66%]
backend/tests/test_api.py::test_substitution_not_found PASSED            [ 77%]
backend/tests/test_api.py::test_scan_empty_image PASSED                  [ 88%]
backend/tests/test_api.py::test_scan_valid_image_bytes PASSED            [100%]
============================== 9 passed in 1.07s ==============================
```

### Mobile Logic Test Results (21/21 Passed)
```
PASS: Negative days remaining is expired
PASS: 0 days remaining is expiring_today
PASS: 2 days remaining is use_soon
PASS: 3 days remaining is use_soon
PASS: 10 days remaining is fresh
PASS: All ingredients present yields 100% match
PASS: All ingredients present sets isFullMatch to true
PASS: No missing ingredients for 100% match
PASS: Partial inventory yields < 100% match
PASS: Correctly flags Canned Chickpeas as missing
PASS: Correctly flags Tahini as missing
PASS: Does not add duplicate unchecked row for same name
PASS: Increments existing quantity for unchecked duplicate
PASS: Adds new entry if existing item with same name is already checked
PASS: 0.98 confidence does not need review
PASS: Correctly displays 98%
PASS: 0.76 confidence triggers needsReview flag
PASS: Correctly displays 76%
PASS: Milk mapped to Dairy
PASS: Bell Pepper mapped to Produce
PASS: Rice mapped to Pantry
========================================
Mobile Logic Test Results: 21 PASSED, 0 FAILED
========================================
```

### TypeScript Compilation Check (`tsc --noEmit`)
```
> mobile@1.0.0 check
> tsc --noEmit
# Exit code 0 (0 errors)
```

---

## 🎬 Hacktoberfest Demo Script

Use this 2-minute walkthrough to showcase FridgeFlow AI during evaluations:

1. **Launch App**: Open FridgeFlow AI on Android. The home dashboard opens with the **Culinary Ecology** botanical theme, displaying 6 in-stock items and 2 "Use Soon" alerts.
2. **AI Vision Scanner**: Tap `"Scan Your Fridge"`. View the realistic viewfinder with the active SVG reticle, dashed 3x3 alignment grid, and animated laser sweep beam. Tap the Shutter or Gallery button to analyze a fridge photo.
3. **Review & Human Confirmation**: Observe the Gemma vision breakdown (`Baby Spinach 98%`, `Greek Yogurt 84% (Review)`). Use the quantity stepper to adjust items, confirm the flagged item, and tap `"Add 6 Items to Fridge"`.
4. **Inspect Inventory**: The **My Fridge** tab displays items sorted by expiry date with countdown chips (`Best within 2 days`, `10 days left`). Tap `+ Add` to manually create an item, demonstrating 100% offline SQLite persistence.
5. **Cook Zero-Waste**: Switch to the **Recipes** tab. Note the **Crisper-First Priority** banner using up Spinach and Yogurt. Tap `"Start Cooking"` on the 100% match *Garden Spinach & Egg Skillet* to view step-by-step instructions.
6. **Smart Shopping**: On the 80% match *Chickpea Bowl*, tap `"Add to Cart"` next to missing items. Switch to the **Shopping** tab: the missing ingredients appear instantly in the *Pantry & Dry Goods* aisle. Tap checkboxes to strike items off and watch the progress bar dynamically advance.
7. **Settings & Privacy**: Tap the Settings gear to verify the private API connection, view Gemma model licensing terms, or reload sample data with a single tap.

---

## 📄 License
This project is licensed under the Apache 2.0 License — see the [LICENSE](LICENSE) file for details.
Gemma open-weight models are licensed under the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).
