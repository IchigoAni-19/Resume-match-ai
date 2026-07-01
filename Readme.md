<div align="center">

<img src="https://img.shields.io/badge/Resume-Match_AI-d00e58?style=for-the-badge&logo=sparkles&logoColor=white" alt="Resume Match AI" height="42"/>

<br/>
<br/>

<p>
  <strong>An intelligent full-stack platform that bridges the gap between candidate profiles and job requirements.</strong><br/>
  Upload your resume, paste a job description, and let Gemini AI generate your entire interview strategy — questions, skill gaps, roadmap, and a tailored ATS-ready resume PDF.
</p>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js_5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://resume-match-ai-lyart.vercel.app)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Getting Started (Local)](#️-getting-started-local)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Mock AI Mode](#-mock-ai-mode)
- [Security](#-security)
- [Author](#-author)

---

## 🧠 Overview

**Resume Match AI** accepts three inputs and returns a complete interview preparation package.

> 🌐 **[Try it live →](https://resume-match-ai-lyart.vercel.app)**

| Input | Description |
|---|---|
| 📄 Resume PDF | Your existing resume — text extracted server-side via `pdf2json` |
| 📝 Job Description | The full job posting you are targeting |
| 💬 Self Description | Optional free-text summary of your background |

**What you get back:**

| Output | Description |
|---|---|
| 🎯 **Match Score** | 0–100 score of how well your profile fits the role |
| 💻 **Technical Questions** | Role-specific questions with interviewer intent and model answers |
| 🧠 **Behavioral Questions** | STAR-format questions tailored to your background |
| 📊 **Skill Gaps** | Identified gaps rated by severity — low / medium / high |
| 🗓️ **Preparation Roadmap** | Day-by-day study plan to close those gaps before the interview |
| 📄 **AI Resume PDF** | ATS-optimized resume generated from your data, tailored to the role |

---

## 🚀 Features

**AI & Document Processing**
- Gemini `gemini-2.5-flash` generates structured interview reports and resume content, with all AI output validated against Zod schemas
- `pdf2json` extracts plain text from uploaded resume PDFs entirely server-side — no client-side processing
- Resume generation uses a **structured data → HTML template** pattern: AI returns clean JSON, a fixed template handles layout, Puppeteer converts to a print-perfect A4 PDF
- `zod-to-json-schema` provides strict response contracts to the Gemini API, preventing hallucinated structure

**Authentication & Security**
- JWT stored in `httpOnly` cookies — invisible to JavaScript, mitigates XSS token theft
- Cross-origin cookies correctly configured with `SameSite=None; Secure=true` in production (Vercel → Render)
- Logged-out tokens are stored in a MongoDB blacklist with a **24-hour TTL index** — self-cleaning, matching JWT expiry
- bcrypt (salt rounds 10) for password hashing
- All report endpoints are scoped to the authenticated user — cross-user data access is impossible

**Frontend Architecture**
- Strict 4-layer pattern: **UI → Hook → Context (State) → API Service**
- Light and dark theme with CSS custom properties, persisted in `localStorage`, toggled from any page
- Proper inline error states on all forms with API error message propagation
- Route guard (`Protected`) that restores session from cookie on app load before rendering any protected route

**Developer Experience**
- `MOCK_AI=true` bypasses all Gemini calls and returns deterministic sample data — no API key needed for local development
- ESM throughout (`"type": "module"`) with a dedicated `env.js` loader ensuring `dotenv.config()` runs before any module reads `process.env`
- Global Express error handler and 404 handler
- Vite dev proxy eliminates CORS friction in local development

---

## 🛠️ Tech Stack

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js 18+ — ESM (`"type": "module"`) |
| Framework | Express.js 5 |
| Database | MongoDB + Mongoose 9 |
| AI SDK | `@google/genai` — Google Gemini 2.5 Flash |
| Schema Validation | Zod + `zod-to-json-schema` |
| PDF Parsing | `pdf2json` — server-side resume text extraction |
| PDF Generation | Puppeteer (headless Chromium) |
| Authentication | `jsonwebtoken` + `bcryptjs` |
| File Upload | Multer — in-memory storage, 5 MB limit |
| Config | `dotenv` |

### Frontend

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router 8 |
| HTTP Client | Axios — `withCredentials: true` for cross-origin cookie auth |
| Styling | SCSS — CSS custom properties for light/dark theming |
| State | React Context API — Auth + Interview + Theme providers |

---

## 📁 Project Structure

```
Resume-Match-AI/
│
├── backend/
│   ├── server.js                        # Entry — loads env, connects DB, starts server
│   └── src/
│       ├── app.js                       # Express setup, CORS, middleware, error handlers
│       ├── config/
│       │   ├── env.js                   # dotenv loader — must be first import in server.js
│       │   └── database.js              # Mongoose connection
│       ├── controllers/
│       │   ├── auth.controller.js       # Register, Login, Logout, GetMe
│       │   └── interview.controller.js  # Generate report, fetch reports, generate PDF
│       ├── middleware/
│       │   ├── auth.middleware.js       # JWT verification + blacklist check
│       │   └── file.middleware.js       # Multer in-memory upload (5 MB limit)
│       ├── models/
│       │   ├── user.model.js            # User — username, email, hashed password
│       │   ├── blacklist.model.js       # Invalidated tokens — TTL index: 24 h
│       │   └── interviewReport.model.js # Full report — questions, gaps, plan, score
│       ├── routes/
│       │   ├── auth.routes.js           # /api/auth/*
│       │   └── interview.routes.js      # /api/interview/*
│       ├── service/
│       │   └── ai.service.js            # Gemini AI calls + Puppeteer PDF generation
│       └── templates/
│           └── resume.html              # Static resume layout — AI injects content here
│
└── frontend/
    ├── index.html
    ├── vite.config.js                   # Dev proxy /api → localhost:3000
    └── src/
        ├── main.jsx
        ├── App.jsx                      # Provider tree: Theme → Auth → Interview → Router
        ├── app.routes.jsx               # All client-side routes
        ├── style.scss                   # CSS custom properties — light + dark themes
        └── features/
            ├── auth/
            │   ├── auth.context.jsx          # Session restore on mount
            │   ├── hooks/useAuth.js           # Login, Register, Logout — errors re-thrown
            │   ├── services/auth.api.js       # Axios calls to /api/auth/*
            │   ├── components/Protected.jsx   # Route guard — redirects to /login if unauth
            │   └── pages/
            │       ├── Login.jsx
            │       ├── Register.jsx
            │       └── Settings.jsx
            ├── interview/
            │   ├── interview.context.jsx
            │   ├── hooks/useInterview.js      # Generate, fetch, download actions
            │   ├── services/interview.api.js
            │   └── pages/
            │       ├── Home.jsx               # Generation form — upload + job description
            │       ├── Interview.jsx          # Report viewer — questions, roadmap, score
            │       └── History.jsx            # All past reports grid
            ├── common/
            │   └── components/Header.jsx      # Sticky nav — theme toggle + profile menu
            └── theme/
                └── ThemeContext.jsx
```

---

## ☁️ Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Frontend Deployment |
| Backend | Render | Backend Deployment |

### Required env vars on Render

```
NODE_ENV=production
CLIENT_ORIGIN=
MONGO_URI=...
JWT_SECRET=...
GOOGLE_GENAI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
MOCK_AI=false
```


> **Note on cross-origin cookies:** The backend sets `SameSite=None; Secure=true` in production so cookies are sent correctly from Vercel to Render. This requires `NODE_ENV=production` and `CLIENT_ORIGIN` to be set exactly — do not omit either.

---

## ⚙️ Getting Started (Local)

### Prerequisites

- Node.js ≥ 18
- MongoDB — local or [Atlas](https://www.mongodb.com/atlas) free tier
- Gemini API key — [get one free at Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone

```bash
git clone https://github.com/your_username/Resume-Match-AI.git
cd Resume-Match-AI
```

### 2. Backend

```bash
cd backend
npm install
# create backend/.env — see Environment Variables section
npm run dev
# → http://localhost:3000
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

Vite proxies all `/api/*` requests to `localhost:3000` in dev — no CORS config needed locally.

---

## 🔧 Environment Variables

Create `backend/.env`:

```env
# Database
MONGO_URI=mongodb uri string for database connection

# Auth — use a long random string (openssl rand -hex 64)
JWT_SECRET=your_super_secret_jwt_key_here

# Gemini AI — get key at ' https://aistudio.google.com/apikey '
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Set "true" to bypass all Gemini calls (mock data, no quota used)
MOCK_AI=false

# Server
PORT=3000
NODE_ENV=development   # set to "production" on Render

# CORS — required in production (your Vercel URL)
# CLIENT_ORIGIN=https://your-app.vercel.app
```

---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create account — `{ username, email, password }` |
| `POST` | `/login` | ❌ | Login — `{ email, password }` — sets JWT cookie |
| `GET` | `/logout` | ❌ | Blacklists token, clears cookie |
| `GET` | `/get-me` | ✅ | Returns current authenticated user |

### Interview — `/api/interview`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | ✅ | Generate interview report — `multipart/form-data` |
| `GET` | `/` | ✅ | List all reports for current user (lightweight) |
| `GET` | `/report/:id` | ✅ | Get full report by ID |
| `POST` | `/resume/pdf/:id` | ✅ | Generate and download tailored resume PDF |

#### `POST /api/interview/` — `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `jobDescription` | `string` | ✅ | Full text of the target job posting |
| `resume` | `file` PDF ≤ 5 MB | ⬜ | Uploaded resume — text extracted server-side |
| `selfDescription` | `string` | ⬜ | Free-text background summary |

> At least one of `resume` or `selfDescription` must be provided. For best results, provide both.

---

## 🧪 Mock AI Mode

Set `MOCK_AI=true` to bypass all Gemini API calls. The entire app runs with deterministic sample data — useful for UI work and testing without consuming quota.

```env
MOCK_AI=true
```

Mock responses are schema-validated and match the real response shape exactly, so the UI behaves identically to production.

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Password storage | `bcryptjs` — salt rounds 10, never stored plain |
| Session tokens | `httpOnly` cookies — inaccessible to JavaScript, mitigates XSS |
| Cross-origin cookies | `SameSite=None; Secure=true` in production for Vercel → Render |
| Token invalidation | MongoDB blacklist — 24 h TTL index, auto-expires with JWT |
| Data isolation | All queries scoped to `req.user.id` — cross-user access impossible |
| Input limits | JSON body: 1 MB cap, file uploads: 5 MB cap via Multer |
| Error responses | No stack traces in production responses |

---

## 👨‍💻 Author

<div align="center">

### Harsh Patel  
<sub>GitHub: <strong>@IchigoAni-19</strong></sub>

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-IchigoAni--19-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/IchigoAni-19)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Harsh_Patel-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/harsh-patel-bb5598268/)

---

<div align="center">
  <sub>Built with ☕, React, Node.js, and a little bit of AI magic.</sub>
</div>
