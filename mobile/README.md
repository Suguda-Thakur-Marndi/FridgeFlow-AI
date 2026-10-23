# FridgeFlow AI — Mobile & Web Client

The universal cross-platform client for **FridgeFlow AI**, targeting **Android**, **iOS (iPhone & iPad)**, and modern **Web browsers**. Built on Expo SDK 58, Expo Router 58, React Native 0.88, and on-device/edge ONNX Runtime & TFLite inference.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Expo SDK 58 (`expo-router` v58 file-based routing)
- **Platforms**:
  - 🌐 **Web**: Responsive layout, HTML5 File API image processing, ONNX Runtime Web fallback, local storage persistence
  - 🤖 **Android**: Native edge AI module (`FridgeFlowEdgeAIModule`), SQLite storage, 48dp touch targets, back handler support
  - 🍎 **iOS**: Responsive iPhone/iPad modal presentation, SQLite storage, safe-area adaptation
- **Design System**: Google Stitch *Culinary Ecology* design tokens (`#04442F` deep hunter green, `#F2FCF2` mint cream, `#F0BF4E` warm ochre)
- **Edge AI**: Dual-runtime architecture:
  - On-Device Neural Backbone: Quantized ONNX & TFLite models (`assets/models/bundled-vlm/`)
  - Classification Head: Matrix forward pass with cosine similarity against 20 culinary classes
  - Fallback: Cloud-assisted inference via FastAPI backend (`../backend`)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run start
```
From the interactive terminal prompt, you can press:
- `w` — Open in Web browser
- `a` — Open on connected Android device/emulator
- `i` — Open on connected iOS simulator

### 3. Dedicated Platform Launchers
```bash
npm run web       # Start Expo web dev server
npm run android   # Run on connected Android device
npm run ios       # Run on iOS simulator
```

---

## 🧪 Testing & Verification

FridgeFlow AI includes comprehensive test suites across storage, business logic, offline Edge AI inference, and held-out dataset benchmarking:

```bash
# Run TypeScript compilation check
npm run check

# Run all automated test suites (Business Logic, Edge AI, Benchmark, Offline Inference)
npm test

# Run ESLint validation
npm run lint
```

---

## 📦 Production Builds

```bash
# Build production web bundle (outputs to mobile/dist/)
npm run build:web

# Build Android preview APK via EAS
npm run build:apk

# Build Android production AAB via EAS
npm run build:aab

# Build iOS production archive via EAS
npm run build:ios
```

---

## 📁 Directory Structure

```
mobile/
├── assets/                  # App icons, splash screens, hero images & test datasets
│   ├── models/bundled-vlm/  # Real ONNX, TFLite & neural head model weights
│   └── test_dataset/        # Held-out real fridge test photos & ground truth
├── plugins/                 # Expo config plugins (native edge AI linking)
├── public/                  # Web static assets (models served for ONNX Runtime Web)
├── scripts/                 # Maintenance scripts (patch_ort.py)
├── src/
│   ├── app/                 # Expo Router file-based screens & navigation tabs
│   │   ├── (tabs)/          # Main tab screens: Home, Fridge, Recipes, Shopping
│   │   ├── scanner/         # Viewfinder camera & ingredient review screens
│   │   └── settings.tsx     # Settings, sample data reset & storage controls
│   ├── components/          # Reusable UI components (CulinaryHeader, RecipeCard, etc.)
│   ├── constants/           # Culinary Ecology design theme tokens
│   ├── hooks/               # Custom hooks (color schemes, focus safety)
│   ├── native-modules/      # Android Kotlin bridge for edge AI acceleration
│   ├── services/            # Edge AI inference engine & backend API client
│   └── storage/             # Cross-platform SQLite & Web storage repositories
└── tests/                   # Automated unit, integration, and benchmark tests
```
