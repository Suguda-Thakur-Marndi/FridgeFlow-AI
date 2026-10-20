# Contributing to FridgeFlow AI

Thank you for contributing to **FridgeFlow AI** for the **Hacktoberfest 2026 Open-Source AI Challenge (Week 3: Slow and Steady)**!

## Development Guidelines

1. **Architecture Separation**:
   - `mobile/`: React Native + Expo + Expo Router + SQLite
   - `backend/`: Python + FastAPI + Pydantic + Gemma Vision pipeline
2. **Design Grounding**:
   - Strictly follow the `Culinary Ecology` design system in `mobile/src/constants/theme.ts`.
   - Adhere to the 48dp touch target guidelines and accessible contrast ratios.
3. **Local Independence**:
   - Core inventory tracking and shopping lists MUST function offline via SQLite without network dependency.
4. **AI Vision & Gemma Integration**:
   - Vision inference outputs must be validated through Pydantic schemas in `backend/app/schemas/models.py`.
   - Never fabricate certainty; flag uncertain predictions with `needs_review: true` when confidence is < 0.85.

## Testing Before Submitting

Run all automated verification commands:

```bash
# 1. Backend tests
python -m pytest backend/tests/ -v

# 2. Mobile type checks & unit tests
cd mobile
npm run check
npm test

# 3. Android production bundle verification
npx expo export --platform android
```
