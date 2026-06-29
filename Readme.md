<div align="center">

<img src="https://img.shields.io/badge/Resume-Match_AI-d00e58?style=for-the-badge&logo=sparkles&logoColor=white" alt="Resume Match AI" height="40"/>

<br/>
<br/>

**An intelligent full-stack platform that bridges the gap between candidate profiles and job requirements.**  
Upload your resume, paste a job description, and let Gemini AI build your entire interview strategy in seconds.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)

</div>

---

## ✨ What it does

Resume Match AI takes three inputs — your **resume PDF**, a **job description**, and an optional **self-description** — and produces a complete, personalized interview package:

| Output | Description |
|---|---|
| 🎯 **Match Score** | 0–100 score showing how well your profile fits the role |
| 💻 **Technical Questions** | Role-specific questions with interviewer intent + model answers |
| 🧠 **Behavioral Questions** | STAR-format questions tailored to your background |
| 📊 **Skill Gaps** | Identified gaps rated by severity (low / medium / high) |
| 🗓️ **Preparation Roadmap** | Day-by-day study plan to close those gaps before the interview |
| 📄 **AI Resume PDF** | ATS-friendly resume auto-generated and tailored for the specific role |

---

## 🚀 Features

- **AI-Powered Report Generation** — Gemini AI (`gemini-2.0-flash-lite`) analyses your profile against the job description and structures the entire output as validated JSON via Zod schemas.
- **PDF Resume Parser** — `pdf2json` extracts plain text from uploaded resume PDFs server-side, no client-side processing needed.
- **PDF Resume Generator** — Puppeteer renders an AI-generated HTML resume to a print-perfect A4 PDF, returned as a downloadable attachment.
- **Secure JWT Authentication** — HTTP-only cookie JWTs with a MongoDB-backed token blacklist and automatic TTL expiry (24 h) via a MongoDB TTL index.
- **Light & Dark Theme** — Persisted in `localStorage`, toggled from any page, with smooth CSS variable transitions.
- **Interview History** — All generated reports are saved and accessible from the History page with match scores and skill gap previews.
- **Strict 4-Layer Frontend Architecture** — UI → Hook → Context (State) → API service. Every layer has a single responsibility.
- **Production-Ready Error Handling** — Global Express error handler, 404 handler, inline error states on all forms, and rate-limit detection for Gemini quota errors.
- **Mock AI Mode** — Set `MOCK_AI=true` in `.env` to run the entire app with deterministic sample data — no API key needed for development.

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM — `"type": "module"`) |
| Framework | Express.js 5 |
| Database | MongoDB + Mongoose 9 |
| AI | Google Gemini AI SDK (`@google/genai`) |
| Schema Validation | Zod + `zod-to-json-schema` |
| PDF Parsing | `pdf2json` |
| PDF Generation | Puppeteer (headless Chromium) |
| Auth | `jsonwebtoken` + `bcryptjs` |
| File Upload | Multer (in-memory storage) |
| Config | `dotenv` |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router 8 |
| HTTP Client | Axios |
| Styling | SCSS (CSS custom properties for theming) |
| Theme | Custom `ThemeContext` + `localStorage` persistence |

---

## 📁 Project Structure

```
Resume-Match-AI/
├── Backend/
│   ├── server.js                    # Entry point — connects DB, starts server
│   └── src/
│       ├── app.js                   # Express app, middleware, global error handler
│       ├── config/
│       │   └── database.js          # Mongoose connection
│       ├── controllers/
│       │   ├── auth.controller.js   # Register, Login, Logout, GetMe
│       │   └── interview.controller.js  # Generate report, fetch reports, generate PDF
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification + blacklist check
│       │   └── file.middleware.js   # Multer in-memory upload (5 MB limit)
│       ├── models/
│       │   ├── user.model.js        # User schema (username, email, password)
│       │   ├── blacklist.model.js   # Token blacklist with 24 h TTL index
│       │   └── interviewReport.model.js  # Full report schema
│       ├── routes/
│       │   ├── auth.routes.js       # /api/auth/*
│       │   └── interview.routes.js  # /api/interview/*
│       └── service/
│           └── ai.service.js        # Gemini AI calls + Puppeteer PDF generation
│
└── Frontend/
    ├── index.html
    ├── vite.config.js               # Dev proxy → localhost:3000
    └── src/
        ├── main.jsx
        ├── App.jsx                  # Provider tree: Theme → Auth → Interview → Router
        ├── app.routes.jsx           # All route definitions
        ├── style.scss               # Global CSS variables (light + dark themes)
        ├── styles/
        │   └── button.scss
        └── features/
            ├── auth/
            │   ├── auth.context.jsx       # Session restore on mount
            │   ├── hooks/useAuth.js       # Login, Register, Logout actions
            │   ├── services/auth.api.js   # Axios calls to /api/auth/*
            │   ├── components/Protected.jsx  # Route guard
            │   └── pages/
            │       ├── Login.jsx
            │       ├── Register.jsx
            │       └── Settings.jsx
            ├── interview/
            │   ├── interview.context.jsx
            │   ├── hooks/useInterview.js  # All interview data actions
            │   ├── services/interview.api.js
            │   └── pages/
            │       ├── Home.jsx       # Report generation form
            │       ├── Interview.jsx  # Report viewer (questions, roadmap, score)
            │       └── History.jsx    # All past reports
            ├── common/
            │   └── components/Header.jsx  # Sticky nav with theme toggle + profile menu
            └── theme/
                └── ThemeContext.jsx
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Google Gemini API key — [get one free at Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Resume-Match-AI.git
cd Resume-Match-AI
```

### 2. Set up the Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/resume-match-ai

# JWT — use a long random string in production
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# Optional — override the default model
GEMINI_MODEL=gemini-2.0-flash-lite

# Set to "true" to skip all Gemini calls and use sample data
MOCK_AI=false

# Optional — restrict CORS to your frontend origin in production
# CLIENT_ORIGIN=https://your-domain.com

NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Server starts on **http://localhost:3000**

### 3. Set up the Frontend

```bash
cd ../Frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:5173** — Vite proxies all `/api/*` requests to port 3000 automatically.

---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create a new account |
| `POST` | `/login` | ❌ | Login and receive a JWT cookie |
| `GET` | `/logout` | ❌ | Invalidate the current token |
| `GET` | `/get-me` | ✅ | Get the authenticated user's profile |

### Interview — `/api/interview`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | ✅ | Generate a new interview report (multipart/form-data) |
| `GET` | `/` | ✅ | Get all reports for the current user (lightweight list) |
| `GET` | `/report/:id` | ✅ | Get a full report by ID |
| `POST` | `/resume/pdf/:id` | ✅ | Generate and download a tailored resume PDF |

#### `POST /api/interview/` — Request Body (multipart/form-data)

| Field | Type | Required | Description |
|---|---|---|---|
| `jobDescription` | `string` | ✅ | Full text of the target job posting |
| `resume` | `file` (PDF) | ⬜ | Resume PDF (max 5 MB) |
| `selfDescription` | `string` | ⬜ | Free-text description if no resume |

> At least one of `resume` or `selfDescription` must be provided but for best result provide both of them.

---

## 🧪 Development — Mock AI Mode

To develop without consuming Gemini API quota, set `MOCK_AI=true` in your `.env`. All AI calls are bypassed and deterministic sample data is returned instantly.

```env
MOCK_AI=true
```

---

## 🔒 Security Notes

- Passwords are hashed with `bcryptjs` (salt rounds: 10) — never stored in plain text.
- JWT tokens are stored in `httpOnly` cookies — inaccessible to JavaScript, prevents XSS token theft.
- Logged-out tokens are stored in a MongoDB blacklist with a **24-hour TTL index** — the collection self-cleans automatically.
- All protected routes validate both token authenticity and blacklist status on every request.
- Resume PDF generation is scoped to the owning user — users cannot access each other's reports.

---

## 👨‍💻 Author

**Harsh Patel**

<div>
<a href="https://github.com/your-username">
  <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"/>
</a>
</div>

---

<div align="center">
  <sub>Built with ☕, React, Node.js, and a little bit of AI magic.</sub>
</div>
