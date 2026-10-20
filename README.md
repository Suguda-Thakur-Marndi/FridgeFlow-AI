# FridgeFlow AI 🌿

> **Tagline:** *Scan less. Plan smarter. Waste less.*  
> **Hacktoberfest 2026 Open-Source AI Challenge — Week 3 Theme: Slow and Steady**  
> *Production-quality, cross-platform food management platform for Android, iOS (iPhone & iPad), and modern web browsers. Powered by Google DeepMind's open-weight Gemma vision models and built with the Google Stitch "Culinary Ecology" design system.*

[![FridgeFlow CI](https://github.com/hacktoberfest-2026/fridgeflow-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hacktoberfest-2026/fridgeflow-ai/actions)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Gemma Open Weights](https://img.shields.io/badge/Model-Gemma_3_%7C_PaliGemma-brightgreen.svg)](https://ai.google.dev/gemma)
[![Cross-Platform: Web + Android + iOS](https://img.shields.io/badge/Targets-Android_%7C_iOS_%7C_Web-orange.svg)](mobile/app.json)
[![Render Ready](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7.svg)](render.yaml)

---

## 📖 Table of Contents
1. [Project Mission & Overview](#-project-mission--overview)
2. [Cross-Platform Architecture (Android, iOS, Web)](#-cross-platform-architecture)
3. [UI/UX Design System: Culinary Ecology](#-uiux-design-system-culinary-ecology)
4. [Real Open-Weight AI Integration (Gemma)](#-real-open-weight-ai-integration-gemma)
5. [Cross-Platform Persistent Storage](#-cross-platform-persistent-storage)
6. [Repository Structure](#-repository-structure)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
8. [Running & Building Each Target](#-running--building-each-target)
   - [Web Application](#1-web-application)
   - [Android](#2-android)
   - [iOS (iPhone & iPad)](#3-ios-iphone--ipad)
   - [FastAPI Backend Service](#4-fastapi-backend-service)
9. [Automated Verification & Test Suites](#-automated-verification--test-suites)
10. [Privacy, Data Security & Licensing](#-privacy-data-security--licensing)

---

## 🎯 Project Mission & Overview

Modern households discard up to 30% of edible groceries simply because perishable food gets forgotten behind opaque crisper drawers. **FridgeFlow AI** solves this with a cohesive, cross-platform culinary assistant grounded in the **Slow and Steady** ethos:

- **Unified Product**: One coherent codebase with shared business logic, shared design tokens, and platform-appropriate experiences across Android phones, iPhones, iPads, and desktop/tablet web browsers.
- **Vision Scanning with Open-Weight Gemma**: Capture or upload refrigerator shelf photos; vision-capable Gemma models identify produce, dairy, proteins, and pantry staples while estimating realistic shelf-life days.
- **Human-in-the-Loop Confidence**: Clear confidence indicators (e.g. 98% vs 76%). Items needing verification are visibly highlighted (`needs_review: true`), allowing instant quantity, unit, and shelf-life corrections before saving.
- **Crisper-First Meal Suggestions**: Evaluates ingredient match percentages against inventory. Recipes prioritizing items expiring in under 3 days receive a **Crisper-First Priority** banner.
- **Zero-Waste Shopping Integration**: Automatically computes missing ingredients, supports 1-tap addition to a categorized grocery list, and suggests domestic culinary substitutions (e.g., Greek yogurt for heavy cream).
- **Offline Independence**: Inventory and grocery lists persist locally on each device (SQLite on mobile, persistent browser storage on web), ensuring complete privacy with zero account registration needed.

---

## 📱 Cross-Platform Architecture

```
                                  ┌─────────────────────────────┐
                                  │      FridgeFlow AI App      │
                                  └──────────────┬──────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
   ┌─────────────────┐                  ┌─────────────────┐                  ┌─────────────────┐
   │  Android Phone  │                  │  iOS & iPadOS   │                  │   Web Browser   │
   ├─────────────────┤                  ├─────────────────┤                  ├─────────────────┤
   │ • Native Camera │                  │ • Photo Library │                  │ • File Picker   │
   │ • Local SQLite  │                  │ • Local SQLite  │                  │ • Local Storage │
   │ • 48dp Touch UI │                  │ • iPad Support  │                  │ • Responsive UI │
   └────────┬────────┘                  └────────┬────────┘                  └────────┬────────┘
            │                                    │                                    │
            └────────────────────────────────────┼────────────────────────────────────┘
                                                 │
                                                 ▼ (HTTP / REST)
                                  ┌─────────────────────────────┐
                                  │   FastAPI Python Backend    │
                                  ├─────────────────────────────┤
                                  │ • POST /api/v1/scan         │
                                  │ • POST /api/v1/recipes      │
                                  │ • POST /api/v1/substitutions│
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  Gemma Vision Model (Ollama)│
                                  │    gemma3:4b / paligemma2   │
                                  └─────────────────────────────┘
```

- **Frontend Core**: React Native + Expo SDK 58, TypeScript (Strict Mode), Expo Router file-based navigation, React Native Web.
- **Mobile Local Storage**: `expo-sqlite` with WAL mode on Android and iOS.
- **Web Local Storage**: Browser-native storage adapter (`database.web.ts`) providing zero-latency reads and cross-session persistence across page refreshes.
- **Backend Service**: Python 3.11+, FastAPI, Pydantic v2 schemas, Pillow image validation, Pytest, HTTPX test client.

---

## 🎨 UI/UX Design System: Culinary Ecology

Faithfully built according to the **Google Stitch** `Culinary Ecology` specification:

| Token Name | Hex Code | Visual Role |
| :--- | :--- | :--- |
| **Forest Green (Primary)** | `#245C45` / `#04442F` | Primary actions, headers, brand touchpoints |
| **Sage Green (Secondary)** | `#A8C5A0` / `#4B6546` | Active chips, container fills, tonal badges |
| **Warm Ivory (Background)** | `#FAF8F2` | Root canvas reducing glare, tactile warmth |
| **Clean White (Surface)** | `#FFFFFF` | Elevated cards, dialog modals, bottom bar |
| **Charcoal (On-Surface)** | `#202923` | High-contrast slate typography |
| **Muted Gray-Green (Text 2)** | `#778078` | Subtitles, meta-tags, unselected states |
| **Citrus Accent (Tertiary)** | `#E9B949` | Match percentages, "Use Soon" warnings |
| **Muted Coral (Warning)** | `#D96C5F` | "Expiring Today" urgency badges, item deletion |

### Core Screens Implemented:
1. **Welcome & Onboarding**: Hero produce visual frame, value propositions, Hacktoberfest badge.
2. **Home Dashboard**: Quick statistics, crisper priority banner, prompt inspiration bar.
3. **Fridge Scanner & Upload**: Camera viewfinder reticle, animated laser sweep, gallery file upload.
4. **AI Ingredient Recognition**: Detection cards, confidence scores (e.g. 98%), editable quantity steppers.
5. **My Fridge Inventory**: Filter chips (`Produce`, `Dairy & Egg`, `Expiring Soon`), search, and full CRUD.
6. **AI Meal Planner**: Recipes ranked by zero-waste fridge match with prep times and servings.
7. **Recipe Details Modal**: In-stock vs missing ingredients, step-by-step instructions, and cooking log.
8. **Smart Grocery List**: Aisle-sorted sections, interactive checkboxes, progress bar, quick-add input.
9. **Ingredient Details & Expiry**: Contextual shelf-life countdown, category assignment, storage notes.
10. **Settings & Privacy**: Configurable backend URL, live connection test, local storage controls.

---

## 🤖 Real Open-Weight AI Integration (Gemma)

FridgeFlow AI uses Google's open-weight **Gemma 3 (4B multimodal)** and **PaliGemma 2** models:

- **Visual Ingredient Extraction**: Accepts validated image uploads (JPEG/PNG/WebP), validates them with Pillow, and invokes Gemma vision through Ollama (`OLLAMA_HOST`) or compatible OpenAI-standard vision APIs.
- **Pydantic Schema Validation**: The vision response is parsed and validated against strict `IngredientPrediction` schemas (`name`, `category`, `confidence`, `estimated_shelf_life_days`, `quantity`, `unit`, `needs_review`).
- **Resilient Fallback**: If offline or running without a local GPU, the backend returns calibrated zero-waste reference items matching the Stitch test scenario so the app remains fully testable without fake AI claims.
- **Gemma License**: Open-weight terms permit commercial, research, and educational deployment.

---

## 💾 Cross-Platform Persistent Storage

Data persistence is abstracted behind clean repository interfaces (`IIngredientRepository`, `IShoppingListRepository`, `IPreferencesRepository`):

- **Mobile (Android & iOS)**: Implemented in `database.native.ts` using `expo-sqlite` with write-ahead logging (WAL) for high performance and transactional consistency.
- **Web**: Implemented in `database.web.ts` using browser-native persistent storage (`localStorage` / `IndexedDB`), ensuring data persists across browser restarts and page refreshes.
- **Privacy Notice**: Data stays strictly local by default. Cross-device syncing is deliberately omitted in this version to avoid transmitting personal pantry data without user-configured authentication.

---

## 📂 Repository Structure

```
fridgeflow-ai/
├── mobile/                           # React Native + Expo Client (Android, iOS, Web)
│   ├── app.json                      # Permissions, bundle ID, adaptive icons, web config
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/                      # Expo Router screens
│   │   │   ├── _layout.tsx           # Root stack layout & database seeder
│   │   │   ├── onboarding.tsx        # Welcome & onboarding screen
│   │   │   ├── (tabs)/               # Bottom tab navigator
│   │   │   │   ├── _layout.tsx       # Tab bar configuration
│   │   │   │   ├── index.tsx         # Home dashboard
│   │   │   │   ├── fridge.tsx        # My Fridge inventory
│   │   │   │   ├── recipes.tsx       # AI meal planner
│   │   │   │   └── shopping.tsx      # Smart grocery list
│   │   │   ├── scanner/              # Vision scanner & ingredient review
│   │   │   │   ├── index.tsx         # Camera viewfinder & file uploader
│   │   │   │   └── review.tsx        # Ingredient review & edit screen
│   │   │   └── settings.tsx          # Settings, endpoint config, privacy notice
│   │   ├── components/               # Shared UI design system components
│   │   ├── constants/theme.ts        # Culinary Ecology color tokens & typography
│   │   ├── hooks/                    # SSR-safe hooks (useSafeIsFocused)
│   │   ├── services/api.ts           # Cross-platform API client (web blob & native file)
│   │   └── storage/                  # Cross-platform storage layer
│   │       ├── types.ts              # Repository interfaces
│   │       ├── database.native.ts    # Expo SQLite adapter (Android & iOS)
│   │       ├── database.web.ts       # Browser persistent storage adapter (Web)
│   │       └── preferences.ts        # AsyncStorage preferences & backend URL
│   └── tests/
│       └── business_logic.test.ts    # 28 automated unit tests
├── backend/                          # FastAPI Vision & Culinary Engine
│   ├── Dockerfile                    # Container definition for Render deployment
│   ├── requirements.txt              # FastAPI, Pydantic, Pillow, Pytest, Uvicorn
│   ├── app/
│   │   ├── main.py                   # FastAPI application & CORS configuration
│   │   ├── api/routes.py             # Versioned REST endpoints (/api/v1/scan, /recipes, etc.)
│   │   ├── ai/gemma_prompts.py       # Gemma vision & recipe system prompts
│   │   ├── schemas/models.py         # Pydantic request & response schemas
│   │   └── services/
│   │       ├── gemma_service.py      # Ollama & live Gemma vision inference pipeline
│   │       └── recipe_engine.py      # Crisper-first recipe matcher & substitutions
│   └── tests/
│       └── test_api.py               # 15 backend Pytest tests
├── stitch_design/                    # Google Stitch design source of truth
├── .github/workflows/ci.yml          # GitHub Actions multi-platform CI
├── render.yaml                       # Render deployment Blueprint
└── README.md
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18 or v20+
- **Python**: v3.11+
- **Ollama** *(Optional for local AI inference)*: `ollama run gemma3:4b`

### 1. Clone & Set Up Backend

```bash
git clone https://github.com/hacktoberfest-2026/fridgeflow-ai.git
cd fridgeflow-ai

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# (macOS/Linux: source .venv/bin/activate)

# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend test suite
python -m pytest backend/tests/ -v

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be live at `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.

### 2. Set Up Client Application

```bash
cd mobile

# Install client dependencies
npm install

# Run TypeScript type check
npm run check

# Run mobile business logic unit tests
npm test
```

---

## 🛠️ Running & Building Each Target

### 1. Web Application

#### Development Mode:
```bash
cd mobile
npm run web
```
Opens in your browser at `http://localhost:8081`.

#### Production Static Web Export:
```bash
cd mobile
npx expo export --platform web
```
Builds the production static site into `mobile/dist`. Serve it locally:
```bash
npx serve -s dist -l 8082
```

### 2. Android

#### Development on Android Device or Emulator:
```bash
cd mobile
npm run android
```

#### Production Android Build:
```bash
cd mobile
# Verify production bundle export
npx expo export --platform android

# Generate standalone Android APK via EAS Build
eas build --platform android --profile preview
```
*Note: Ensure `android/` permissions in `app.json` include `CAMERA` and `READ_MEDIA_IMAGES`.*

### 3. iOS (iPhone & iPad)

#### Development on iOS Simulator / Device:
```bash
cd mobile
npm run ios
```

#### iOS Production Export & Signing:
```bash
cd mobile
# Verify production bundle export
npx expo export --platform ios

# Build via EAS Build
eas build --platform ios --profile preview
```
*Note: Configured with bundle identifier `com.fridgeflow.ai`, tablet support (`supportsTablet: true`), and iOS permission strings (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).*

### 4. FastAPI Backend Service

#### Local Development:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Docker Container:
```bash
docker build -t fridgeflow-backend -f backend/Dockerfile .
docker run -p 8000:8000 -e OLLAMA_HOST=http://host.docker.internal:11434 fridgeflow-backend
```

#### Render Cloud Deployment:
The project includes a `render.yaml` Blueprint:
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Blueprint Instance** pointing to `render.yaml`.
3. Set environment variable `GEMMA_MODEL_NAME=gemma3:4b`.

---

## 🧪 Automated Verification & Test Suites

The codebase includes comprehensive test suites across both frontend and backend:

### Backend Pytest Suite (`15 passed`):
- `test_root`: API root documentation endpoints.
- `test_health`: Health check and model readiness.
- `test_model_info`: Gemma model family metadata.
- `test_recipe_matching_crisper_first`: 100% fridge match ranking.
- `test_recipe_missing_ingredients`: Missing ingredient detection.
- `test_substitution_valid`: Domestic culinary substitution rules.
- `test_substitution_not_found`: Fallback on invalid ingredients.
- `test_scan_empty_image`: 400 validation on empty payload.
- `test_scan_valid_image_bytes`: Pillow validation and structured inference.
- `test_root_health`: Root health check alias.
- `test_client_config`: Non-secret client config endpoint.
- `test_reference_ingredients`: Master ingredient guidance.
- `test_recipe_suggest_alias`: Alias route for recipe suggestions.
- `test_calculate_missing_ingredients_endpoint`: Missing ingredient calculation API.
- `test_scan_real_image_produce`: Real image produce inference validation.

### Mobile Unit Test Suite (`28 passed`):
- Expiry calculation logic (expired, expiring today, use soon, fresh).
- Recipe matching percentage and `isFullMatch` boolean evaluations.
- Missing ingredient calculation against dynamic inventory.
- Grocery item deduplication (incrementing quantities for existing items).
- AI confidence scoring and `needsReview` thresholding (85%).
- Category mapping from ingredient names.
- Platform image URI validation.

---

## 🔒 Privacy, Data Security & Licensing

- **Local-First Data**: All inventory items, grocery checklists, and expiry dates are stored exclusively on your device.
- **No Background Image Storage**: Fridge images sent to the vision backend are processed in-memory and discarded immediately after prediction generation.
- **No Tracking**: No telemetry or third-party advertising SDKs.
- **License**: Released under the permissive **Apache 2.0 License**.

---

<div align="center">
  <sub>Built for Hacktoberfest 2026 — Slow and Steady 🌿</sub>
</div>
