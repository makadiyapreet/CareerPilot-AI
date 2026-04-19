# 🚀 CareerPilot AI — Complete Setup & Run Guide

> **Authors:** Preet Makadiya & Om Kathiriya  
> **Last Updated:** April 2026

---

## 📋 Table of Contents

1. [Prerequisites](#1--prerequisites)
2. [Clone the Repository](#2--clone-the-repository)
3. [Backend Setup (Python/FastAPI)](#3--backend-setup-pythonfastapi)
4. [Frontend Setup (React/Vite)](#4--frontend-setup-reactvite)
5. [Start the Project](#5--start-the-project)
6. [Stop the Project](#6--stop-the-project)
7. [Quick Start / Stop Commands](#7--quick-start--stop-commands)
8. [Verify Everything Works](#8--verify-everything-works)
9. [Common Issues & Fixes](#9--common-issues--fixes)
10. [Project URLs](#10--project-urls)
11. [Docker Setup (Optional)](#11--docker-setup-optional)

---

## 1. 📦 Prerequisites

Make sure these are installed on your system:

| Tool       | Minimum Version | Check Command          | Install Link                                      |
| ---------- | --------------- | ---------------------- | ------------------------------------------------- |
| **Python** | 3.10+           | `python3 --version`    | [python.org](https://www.python.org/downloads/)    |
| **Node.js**| 18.0+           | `node --version`       | [nodejs.org](https://nodejs.org/)                  |
| **npm**    | 9.0+            | `npm --version`        | Comes with Node.js                                 |
| **Git**    | Any             | `git --version`        | [git-scm.com](https://git-scm.com/)               |

### macOS Users — Important PATH Note

If `node` or `npm` commands say "command not found", your PATH may not include `/usr/local/bin`. Fix it by running:

```bash
# Add to your ~/.zshrc (one-time fix)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 2. 📂 Clone the Repository

```bash
git clone https://github.com/PreetMakadworiya/CareerPilot_AI.git
cd CareerPilot_AI
```

---

## 3. 🐍 Backend Setup (Python/FastAPI)

### Step 3.1 — Create a Virtual Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv
```

### Step 3.2 — Activate the Virtual Environment

```bash
# macOS / Linux
source venv/bin/activate

# Windows (Command Prompt)
venv\Scripts\activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

> ✅ You should see `(venv)` at the beginning of your terminal prompt.

### Step 3.3 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 3.4 — Download NLTK Data (Required for AI features)

```bash
python -c "
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')
print('✅ All NLTK data downloaded successfully!')
"
```

### Step 3.5 — Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Now edit `.env` and set your values:

```env
# Generate a secure secret key (run this command):
#   python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_generated_secret_key_here

# Email Configuration (for OTP verification)
# Use a Gmail App Password: https://myaccount.google.com/apppasswords
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM_EMAIL=your_email@gmail.com
```

> 💡 **Tip:** If you don't configure email, OTPs will be printed to the backend terminal console instead — useful for development!

### Step 3.6 — Verify Backend Setup

```bash
# Make sure venv is activated, then:
python -c "from main import app; print('✅ Backend setup is correct!')"
```

**Go back to the project root:**

```bash
cd ..
```

---

## 4. ⚛️ Frontend Setup (React/Vite)

### Step 4.1 — Install Node.js Dependencies

```bash
cd frontend

npm install
```

### Step 4.2 — Verify Frontend Setup

```bash
npx vite build
```

> ✅ Should say "✓ built in X.XXs" with no errors.

**Go back to the project root:**

```bash
cd ..
```

---

## 5. ▶️ Start the Project

You need **two separate terminal windows/tabs** — one for backend, one for frontend.

### Terminal 1 — Start Backend

```bash
cd backend
source venv/bin/activate          # macOS/Linux
# OR: venv\Scripts\activate       # Windows

uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
Database tables created successfully!
```

### Terminal 2 — Start Frontend

```bash
cd frontend

npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### 🎉 Done! Open your browser:

| Service      | URL                           |
| ------------ | ----------------------------- |
| **Frontend** | http://localhost:3000          |
| **Backend**  | http://localhost:8000          |
| **API Docs** | http://localhost:8000/docs     |
| **ReDoc**    | http://localhost:8000/redoc    |

---

## 6. ⏹️ Stop the Project

### Stop Backend (Terminal 1)

Press `Ctrl + C` in the backend terminal.

Then deactivate the virtual environment:

```bash
deactivate
```

### Stop Frontend (Terminal 2)

Press `Ctrl + C` in the frontend terminal.

### Kill All Running Servers (Emergency)

If ports are stuck or servers won't stop:

```bash
# Kill backend (port 8000)
lsof -ti:8000 | xargs kill -9 2>/dev/null; echo "Backend stopped"

# Kill frontend (port 3000)
lsof -ti:3000 | xargs kill -9 2>/dev/null; echo "Frontend stopped"
```

---

## 7. ⚡ Quick Start / Stop Commands

### One-Command Start (copy-paste into two terminals)

**Terminal 1 (Backend):**
```bash
cd /path/to/CareerPilot_AI/backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd /path/to/CareerPilot_AI/frontend && npm run dev
```

### One-Command Stop All

```bash
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
echo "✅ All servers stopped"
```

---

## 8. ✅ Verify Everything Works

### Test Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Test API Root

```bash
curl http://localhost:8000/
# Expected: {"message":"CareerBoost AI API is running","version":"1.0.0","docs":"/docs"}
```

### Test Frontend

Open http://localhost:3000 in your browser.  
You should see the CareerBoost AI landing page.

### Full Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] `curl http://localhost:8000/health` returns `{"status":"healthy"}`
- [ ] Landing page loads at http://localhost:3000
- [ ] Can sign up a new account
- [ ] Can log in with the account
- [ ] Dashboard loads after login
- [ ] API docs accessible at http://localhost:8000/docs

---

## 9. 🔧 Common Issues & Fixes

### ❌ `command not found: node` or `command not found: npm`

**Cause:** Node.js is not in your PATH.

**Fix (macOS):**
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Fix (Windows):** Reinstall Node.js from [nodejs.org](https://nodejs.org/) and check "Add to PATH" during installation.

---

### ❌ `command not found: uvicorn`

**Cause:** Virtual environment is not activated.

**Fix:**
```bash
cd backend
source venv/bin/activate      # macOS/Linux
# OR: venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

### ❌ `ModuleNotFoundError: No module named 'xxx'`

**Cause:** Dependencies not installed or wrong virtual environment.

**Fix:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

### ❌ `Address already in use` (port 8000 or 3000)

**Cause:** Another process is using the port.

**Fix:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

### ❌ `NLTK data not found` errors at runtime

**Cause:** NLTK corpora not downloaded.

**Fix:**
```bash
cd backend
source venv/bin/activate
python -c "
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')
"
```

---

### ❌ Frontend shows blank page or errors

**Cause:** Dependencies not installed or stale build.

**Fix:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

### ❌ CORS errors in browser console

**Cause:** Backend not running or frontend URL not in allowed origins.

**Fix:**
1. Make sure backend is running on port 8000
2. Check `backend/.env` — the `ALLOWED_ORIGINS` should include your frontend URL:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
   ```

---

### ❌ Email/OTP not sending

**Cause:** SMTP not configured or Gmail App Password not set.

**Fix:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate an "App Password" for Mail
3. Update `backend/.env`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   SMTP_FROM_EMAIL=your_email@gmail.com
   ```

> 💡 If not configured, OTP codes print in the backend terminal output.

---

### ❌ Database errors

**Cause:** Corrupted SQLite database.

**Fix:**
```bash
cd backend
rm careerboost.db
# Restart the backend — tables will be auto-created
uvicorn main:app --reload --port 8000
```

---

## 10. 🌐 Project URLs

| Service               | URL                                  |
| --------------------- | ------------------------------------ |
| Frontend (Landing)    | http://localhost:3000                 |
| Frontend (Login)      | http://localhost:3000/login           |
| Frontend (Signup)     | http://localhost:3000/signup          |
| Frontend (Dashboard)  | http://localhost:3000/dashboard       |
| Backend API           | http://localhost:8000                 |
| Swagger API Docs      | http://localhost:8000/docs            |
| ReDoc API Docs        | http://localhost:8000/redoc           |
| Health Check          | http://localhost:8000/health          |

---

## 11. 🐳 Docker Setup (Optional)

If you prefer to run everything via Docker:

```bash
# From the project root
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

| Service      | URL                           |
| ------------ | ----------------------------- |
| Frontend     | http://localhost               |
| Backend API  | http://localhost:8000          |
| API Docs     | http://localhost:8000/docs     |

---

## 📝 Developer Notes

### Project Structure

```
CareerPilot_AI/
├── backend/          ← FastAPI (Python) — Port 8000
│   ├── main.py       ← Entry point
│   ├── app/          ← Routes, models, services
│   ├── .env          ← Environment variables (DO NOT commit)
│   └── venv/         ← Python virtual environment
│
├── frontend/         ← React + Vite — Port 3000
│   ├── src/          ← Components, pages, services
│   └── package.json  ← Node.js dependencies
│
├── ai_ml/            ← AI/ML modules (resume analysis, etc.)
│
├── SETUP_GUIDE.md    ← This file
└── README.md         ← Project overview
```

### Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS + Lucide Icons
- **Backend:** FastAPI + SQLAlchemy + SQLite + JWT Auth
- **AI/ML:** NLTK + scikit-learn + pandas + PyMuPDF

---

**Happy Coding! 🎉**
