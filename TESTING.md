# EcoLens AI — Testing Documentation

EcoLens AI contains comprehensive test coverage across both the frontend and backend applications to ensure high quality and protect against regressions.

## Testing Strategy

### Frontend Testing
- **Framework:** Vitest + jsdom environment.
- **Library:** React Testing Library (RTL) for rendering components and simulating user interactions.
- **Mocks:** Standardizes mocks for routers, context providers, Recharts layouts, and API requests.

### Backend Testing
- **Framework:** Jest.
- **Library:** Supertest for testing HTTP route integration.
- **Mocks:** Intercepts mock databases (`dbMock`) and file system configurations using standard Jest mock utilities.

---

## Running the Tests

### 1. Frontend Tests
Navigate to the `frontend` folder and run:
```bash
cd frontend
npm run test
```

### 2. Backend Tests
Navigate to the `backend` folder and run:
```bash
cd backend
npm test
```

---

## Test Suites Index

### Frontend (`frontend/src/__tests__`)
1. `components/ProtectedRoute.test.jsx`: Guards loading, authenticated, and redirect paths.
2. `components/StatCard.test.jsx`: Renders values, titles, units, and trend parameters.
3. `components/ProgressBar.test.jsx`: Checks clamping, max zero limits, and aria progress status.
4. `pages/LoginPage.test.jsx`: Verifies validations and submit requests.
5. `pages/RegisterPage.test.jsx`: Validates passwords check matching, and form submission.
6. `pages/Dashboard.test.jsx`: Mocks Recharts packages and tests empty / populated metric views.
7. `pages/CarbonCalculator.test.jsx`: Verifies multi-step wizards, navigation back/forth, and calculation submissions.
8. `pages/Goals.test.jsx`: Verifies targets creations and progress updates.
9. `pages/Challenges.test.jsx`: Checks week progress indicators and challenge completion actions.
10. `pages/ReceiptAnalysis.test.jsx`: Validates file parsing preview and OCR.
11. `context/AuthContext.test.jsx`: Asserts simulated session updates and user profiles on mounting.
12. `utils/api.test.js`: Validates Bearer token headers addition.

### Backend (`backend/__tests__`)
1. `controllers/authController.test.js`: Validates credentials inputs and login/register logic.
2. `controllers/footprintController.test.js`: Validates summary calculations and footprint tracking.
3. `controllers/goalController.test.js`: Tests monthly goal creations and updates.
4. `controllers/challengeController.test.js`: Tests weekly Gemini generation fallbacks.
5. `controllers/badgeController.test.js`: Evaluates badge achievements (beginner, green warrior, carbon hero).
6. `controllers/ocrController.test.js`: Checks multer uploads and error flows.
7. `services/geminiService.test.js`: Tests simulated fallbacks for AI requests.
8. `utils/dbMock.test.js`: Verifies mock database CRUD queries.
9. `utils/emissionFactors.test.js`: Asserts carbon multipliers values math.
10. `routes/auth.routes.test.js`: Tests API health check status and routing logic.
