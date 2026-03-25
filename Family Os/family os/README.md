# Family OS (MVP)

Mobile-first family chores app where parents assign chores, kids submit proof, AI can review, and points power rewards.

## Stack
- Frontend: Vite + React (JSX), React Router, Firebase Auth/Firestore/Storage
- Backend: Node.js + Express for secure OpenAI calls

## Monorepo Layout
```
family-os/
  frontend/
  backend/
  README.md
```

## Setup
### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` based on values below:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5001
VITE_DEMO_MODE=true
```

### 2) Backend
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` from `backend/.env.example`:
```
PORT=5001
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

## Notes
- AI results are advisory only. Parent approval remains the final decision.
- If `OPENAI_API_KEY` is missing, the backend returns a mock AI response.
- Demo mode: if Firebase config is missing or `VITE_DEMO_MODE=true`, the app runs entirely in-memory with demo parent/child data and persists to `localStorage`.
- See `frontend/src/utils/demoData.js` for UI demo placeholders.
- TODOs are included where production hardening is needed.
