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
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#️-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Mock AI Mode](#-mock-ai-mode)
- [Security](#-security)
- [Author](#-author)

---

## 🧠 Overview

**Resume Match AI** accepts three inputs and returns a complete interview preparation package:

| Input | Description |
|---|---|
| 📄 Resume PDF | Your existing resume — text is extracted server-side via `pdf2json` |
| 📝 Job Description | The full job posting you're targeting |
| 💬 Self Description | Optional free-text summary of your background |

**What you get back:**

| Output | Description |
|---|---|
| 🎯 **Match Score** | 0–100 score of how well your profile fits the role |
| 💻 **Technical Questions** | Role-specific questions with interviewer intent and model answers |
| 🧠 **Behavioral Questions** | STAR-format questions tailored to your background |
| 📊 **Skill Gaps** | Gaps identified and rated by severity — low / medium / high |
| 🗓️ **Preparation Roadmap** | Day-by-day study plan to close those gaps before the interview |
| 📄 **AI Resume PDF** | ATS-optimized resume generated from your data, tailored to the role |

---

## 🚀 Features

**AI & Document Processing**
- Gemini `gemini-2.5-flash` generates structured interview reports and resume content validated against Zod schemas
- `pdf2json` extracts plain text from resume PDFs entirely server-side — no client-side processing
- Resume generation uses a **structured data → HTML template** architecture: AI returns clean JSON, a fixed template handles layout, Puppeteer converts to A4 PDF
- Zod + `zod-to-json-schema` enforces strict response contracts from the AI, preventing hallucination in the output structure

**Authentication & Security**
- JWT stored in `httpOnly` cookies — invisible to JavaScript, prevents XSS token theft
- Logged-out tokens are stored in a MongoDB blacklist with a **24-hour TTL index** — the collection self-cleans automatically, matching JWT expiry
- bcrypt with salt rounds 10 for password hashing
- All report endpoints are user-scoped — users cannot access each other's data

**Frontend Architecture**
- Strict 4-layer pattern: **UI → Hook → Context (State) → API Service**
- Light and dark theme with CSS custom properties, persisted in `localStorage` and toggled from any page
- Proper error states on all forms with API error message propagation
- Route guard (`Protected`) that restores session from cookie on app load

**Developer Experience**
- `MOCK_AI=true` bypasses all Gemini calls and returns deterministic sample data instantly — no API key needed for local development
- ESM throughout (`"type": "module"`) with a dedicated `env.js` loader that ensures `dotenv.config()` runs before any module reads `process.env`
- Global Express error handler and 404 handler
- TTL index on the token blacklist — no manual cleanup needed

---

## 🛠️ Tech Stack

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js 18+ — ESM (`"type": "module"`) |
| Framework | Express.js 5 |
| Database | MongoDB + Mongoose 9 |
| AI SDK | `@google/genai` — Google Gemini AI |
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
| HTTP Client | Axios — with `withCredentials: true` for cookie auth |
| Styling | SCSS — CSS custom properties for light/dark theming |
| State | React Context API — Auth + Interview + Theme providers |

---

## 📁 Project Structure

```
Resume-Match-AI/
│
├── Backend/
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
└── Frontend/
    ├── index.html
    ├── vite.config.js                   # Dev proxy /api → localhost:3000
    └── src/
        ├── main.jsx
        ├── App.jsx                      # Provider tree: Theme → Auth → Interview → Router
        ├── app.routes.jsx               # All client-side routes
        ├── style.scss                   # CSS custom properties — light + dark themes
        ├── styles/
        │   └── button.scss
        └── features/
            ├── auth/
            │   ├── auth.context.jsx          # Session restore on mount via /api/auth/get-me
            │   ├── hooks/useAuth.js           # Login, Register, Logout — errors re-thrown
            │   ├── services/auth.api.js       # Axios calls to /api/auth/*
            │   ├── components/Protected.jsx   # Route guard — redirects to /login if unauth
            │   └── pages/
            │       ├── Login.jsx              # Email + password login with inline errors
            │       ├── Register.jsx           # Registration with inline errors
            │       └── Settings.jsx           # Account info page
            ├── interview/
            │   ├── interview.context.jsx      # Shared report + reports + loading state
            │   ├── hooks/useInterview.js      # Generate, fetch, download actions
            │   ├── services/interview.api.js  # Axios calls to /api/interview/*
            │   └── pages/
            │       ├── Home.jsx               # Generation form — upload + job description
            │       ├── Interview.jsx          # Report viewer — questions, roadmap, score
            │       └── History.jsx            # All past reports grid
            ├── common/
            │   └── components/
            │       ├── Header.jsx             # Sticky nav — theme toggle + profile menu
            │       └── header.scss
            └── theme/
                └── ThemeContext.jsx           # isDark state + localStorage persistence
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local instance or [Atlas](https://www.mongodb.com/atlas) free tier
- **Gemini API key** — [get one free at Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone

```bash
git clone https://github.com/HarshPatel5940/Resume-Match-AI.git
cd Resume-Match-AI
```

### 2. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env` — see [Environment Variables](#-environment-variables) below.

```bash
npm run dev
# Server → http://localhost:3000
```

### 3. Frontend

```bash
cd ../Frontend
npm install
npm run dev
# App → http://localhost:5173
```

Vite proxies all `/api/*` requests to `localhost:3000` automatically — no CORS issues in development.

---

## 🔧 Environment Variables

Create a `.env` file inside the `Backend/` directory:

```env
# ── Database ────────────────────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/resume-match-ai

# ── Auth ────────────────────────────────────────────────────────────────────
# Use a long random string — openssl rand -hex 64
JWT_SECRET=your_super_secret_jwt_key_here

# ── Google Gemini AI ─────────────────────────────────────────────────────────
# Get your key at https://aistudio.google.com/apikey
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# Model to use — gemini-2.5-flash recommended
GEMINI_MODEL=gemini-2.5-flash

# Set to "true" to skip all Gemini calls (uses mock data — no API key needed)
MOCK_AI=false

# ── Server ───────────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── CORS (production only) ───────────────────────────────────────────────────
# CLIENT_ORIGIN=https://your-deployed-frontend.com
```

---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create new account — `{ username, email, password }` |
| `POST` | `/login` | ❌ | Login — `{ email, password }` — sets JWT cookie |
| `GET` | `/logout` | ❌ | Invalidates token — adds to blacklist, clears cookie |
| `GET` | `/get-me` | ✅ | Returns current user profile |

### Interview — `/api/interview`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/` | ✅ | Generate interview report — `multipart/form-data` |
| `GET` | `/` | ✅ | List all reports for current user (lightweight) |
| `GET` | `/report/:id` | ✅ | Get full report by ID |
| `POST` | `/resume/pdf/:id` | ✅ | Generate + download tailored resume PDF |

#### `POST /api/interview/` — multipart/form-data

| Field | Type | Required | Notes |
|---|---|---|---|
| `jobDescription` | `string` | ✅ | Full text of the target job posting |
| `resume` | `file` (PDF, ≤ 5 MB) | ⬜ | Uploaded resume — text extracted via `pdf2json` |
| `selfDescription` | `string` | ⬜ | Free-text background summary |

> At least one of `resume` or `selfDescription` must be provided. For best results, provide both.

---

## 🧪 Mock AI Mode

Set `MOCK_AI=true` in `Backend/.env` to bypass all Gemini API calls. The entire app runs with deterministic sample data — useful for UI development and testing without consuming API quota.

```env
MOCK_AI=true
```

The mock responses match the real response schema exactly, so the UI behaves identically.

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Password storage | `bcryptjs` — hashed with salt rounds 10, never stored plain |
| Session tokens | `httpOnly` cookies — inaccessible to JavaScript, mitigates XSS |
| Token invalidation | MongoDB blacklist with 24-hour TTL index — auto-expires with JWT |
| Data isolation | All report queries are scoped to `req.user.id` — cross-user access impossible |
| Input limits | JSON body capped at 1 MB, file uploads capped at 5 MB via Multer |
| Error responses | No stack traces exposed in production responses |

---

## 👨‍💻 Author

**Harsh Patel**

[![GitHub](https://img.shields.io/badge/GitHub-HarshPatel5940-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/HarshPatel5940)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Harsh_Patel-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/harshpatel5940)
[![LeetCode](https://img.shields.io/badge/LeetCode-HarshPatel-FFA116?style=flat-square&logo=leetcode&logoColor=white)](https://leetcode.com/HarshPatel5940)

---

<div align="center">
  <sub>Built with ☕, React, Node.js, and a little bit of AI magic.</sub>
</div>
