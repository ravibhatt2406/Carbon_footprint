# EcoLens AI — Gamified Carbon Footprint Tracker 🌍🔋

**EcoLens AI** is an interactive, full-stack web application designed to help users calculate, track, and actively reduce their carbon footprint. Powered by **Gemini AI**, it delivers personalized recommendations, parses receipts and utility bills using vision capabilities, and dynamically generates gamified weekly challenges. The project supports both real cloud integration (Firebase, Gemini API) and a robust simulation mode for offline/local testing.

---

## 🚀 Key Features

*   **📊 Interactive Carbon Footprint Calculator**
    *   Estimates carbon emissions across four key categories: **Transportation**, **Electricity**, **Diet & Food**, and **Shopping & Consumables**.
    *   Saves calculated footprint logs for historical tracking.
*   **🧾 Smart Receipt & Utility Bill Parsing (OCR)**
    *   Upload images of grocery receipts or PDF/image utility bills (e.g., electricity bills).
    *   Uses **Gemini Vision (gemini-1.5-flash)** to extract consumption metrics and estimate real carbon impact automatically.
*   **💡 Gemini-Powered Actionable Advice**
    *   Analyzes footprint breakdowns to identify the user's highest emission sources.
    *   Generates a friendly summary, personalized carbon-reduction tips, and specific "quick wins" with direct numerical impact.
*   **🏆 Weekly Eco Challenges**
    *   Provides three dynamic weekly challenges with difficulty tiers: Easy, Medium, and Hard.
    *   Rewards users with experience points (XP) upon completion.
*   **🏅 Goals & Badges (Gamification)**
    *   Users can set custom carbon-reduction goals and update their progress.
    *   Unlock badges (such as "Eco Beginner") to track green milestones.
*   **📈 Visual Analytics Dashboard**
    *   Visualizes monthly emissions, historical logs, and source distribution using beautiful **Recharts** charts.
*   **🧪 Local Simulation Fallback (Offline Mode)**
    *   No API keys? No problem. The backend automatically switches to **Simulation Mode** if `GEMINI_API_KEY` or `FIREBASE_PROJECT_ID` are missing, running entirely off a local JSON file (`db.json`) and simulated AI generators.

---

## 🛠️ Technology Stack

### Frontend
*   **React** (Vite template, ES Modules)
*   **Tailwind CSS** (Utility-first styling)
*   **Recharts** (Interactive data visualization)
*   **Lucide React** (Modern, clean icon pack)
*   **React Router DOM** (Single-page app routing)

### Backend
*   **Node.js & Express** (Server & routing middleware)
*   **Google Gen AI SDK** (`@google/generative-ai` with `gemini-1.5-flash`)
*   **Firebase Admin SDK** (For user authentication & Firestore database storage)
*   **Multer** (Handling file uploads for receipt OCR)
*   **JSON Web Tokens (JWT) & BcryptJS** (Secure local fallback authentication)
*   **Nodemon** (Backend hot reloading in development)

---

## 📁 Directory Structure

```text
prompt war/                # Root Workspace Directory
├── backend/               # Express API Backend
│   ├── config/            # Database configurations & Firebase setups
│   ├── controllers/       # Route handlers (auth, challenges, footprints, goals, OCR)
│   ├── middleware/        # Request authentication middleware
│   ├── routes/            # REST API endpoints mapping
│   ├── services/          # Gemini AI services & OCR integration
│   ├── utils/             # Helper utilities & prompt templates
│   ├── db.json            # Local JSON database for Simulation Mode
│   ├── package.json       # Backend dependencies & npm scripts
│   └── .env.example       # Example env configuration for the backend
│
└── frontend/              # React + Vite Frontend Client
    ├── public/            # Public assets
    ├── src/               # React application code
    │   ├── components/    # Reusable UI components (Navbar, Layout, ProtectedRoute)
    │   ├── context/       # Authentication Context provider
    │   ├── pages/         # Application pages (Dashboard, Calculator, ReceiptAnalysis, Challenges)
    │   ├── utils/         # Frontend utilities & helpers
    │   ├── App.jsx        # Routing configuration
    │   ├── main.jsx       # App entry point
    │   └── index.css      # Core styles & Tailwind imports
    ├── package.json       # Frontend dependencies & npm scripts
    └── .env.example       # Example env configuration for the frontend
```

---

## ⚙️ Environment Configuration

Both components require configurations. You can copy the template files and fill in your keys:

### 1. Backend Setup (`/backend/.env`)
```bash
# Port to run the Express backend server
PORT=5000

# Secret key for JWT verification in simulation mode
JWT_SECRET=ecolens_secret_key_123

# Gemini API Key (obtain from Google AI Studio)
# If left blank, the backend will auto-simulate advice, challenges, and OCR parsing
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Project ID (for Firestore / Admin SDK initialization)
# If left blank, the backend will auto-simulate database collections using db.json
FIREBASE_PROJECT_ID=your_firebase_project_id_here

# Firebase Service Account Credentials JSON (Single Line String or path to credentials.json)
# Optional. Required if running Firestore outside of authenticated Google Cloud environments.
FIREBASE_SERVICE_ACCOUNT=your_service_account_credentials_json_or_path
```

### 2. Frontend Setup (`/frontend/.env`)
```bash
# URL to connect to the Express Backend API
VITE_API_URL=http://localhost:5000/api

# Firebase Web Client Credentials
# If left blank, the frontend automatically falls back to simulated JWT API routes
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🚀 Running the Application Locally

Follow these steps to spin up the local development servers.

### Step 1: Start the Backend API
1. Open a terminal and navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Run the backend server in development mode (with Nodemon):
   ```bash
   npm run dev
   ```
   *The backend will boot up on `http://localhost:5000`.*
   *Look at the logs to confirm whether it is running in **Production Mode (Firebase/Gemini)** or **Simulation Mode (Local Fallback)**.*

### Step 2: Start the Frontend React Client
1. Open a separate terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local server URL printed in the console (usually `http://localhost:5173`).

---

## 🛡️ API Endpoints

All requests under `/api/footprint-logs`, `/api/goals`, `/api/challenges`, `/api/badges`, and `/api/ocr` require a valid JWT header (`Authorization: Bearer <token>`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user account |
| **POST** | `/api/auth/login` | Login and retrieve authentication token |
| **GET** | `/api/auth/profile` | Retrieve the authenticated user's profile info |
| **POST** | `/api/footprint-logs` | Submit monthly inputs, calculate emissions, and request AI advice |
| **GET** | `/api/footprint-logs/history` | Retrieve historical carbon logs for the user |
| **GET** | `/api/footprint-logs/summary` | Get summary distribution data |
| **GET** | `/api/goals` | Retrieve user's carbon goals |
| **POST** | `/api/goals` | Define/create a new carbon footprint reduction goal |
| **PUT** | `/api/goals/:id` | Update current progress towards a specific goal |
| **GET** | `/api/challenges` | Get weekly personalized eco-challenges generated by Gemini |
| **POST** | `/api/challenges/:id/complete` | Complete a challenge and claim the XP reward |
| **GET** | `/api/badges` | List badges unlocked by the user |
| **POST** | `/api/ocr/parse` | Upload and parse a receipt/bill image/PDF via Gemini Vision |

---

## 📝 License
This project is for educational and tracking purposes. Feel free to clone, modify, and expand upon it!
