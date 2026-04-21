# 🎓 Smart Facial Attendance System

A full-stack facial recognition attendance system built with React, Spring Boot, Python (FastAPI), and MySQL.

---

## 🚀 Running with Docker (Recommended — Zero Setup Required)

The only thing your recipient needs installed is **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

### Step 1: Get the project
```bash
git clone <your-repo-url>
cd "new mp 2 ag"
```
Or just share the project folder as a ZIP.

### Step 2: Run everything
```bash
docker-compose up --build
```

> ⏳ **First build takes 15–25 minutes** because the Python `face_recognition` library compiles `dlib` from source. Subsequent runs start in ~30 seconds.

### Step 3: Open the app
| Service | URL |
|---|---|
| **Frontend (main app)** | http://localhost |
| **Backend API** | http://localhost:8080 |
| **AI Service** | http://localhost:8001 |
| **MySQL** | localhost:**3307** (to avoid conflicts with any local MySQL) |

### Step 4: Stop everything
```bash
docker-compose down
```
> To also **delete the database data**: `docker-compose down -v`

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Docker Network                    │
│                                                      │
│  ┌─────────────┐     /api/*      ┌────────────────┐  │
│  │  Frontend   │ ─────────────▶ │    Backend     │  │
│  │  (Nginx:80) │                │ (Spring:8080)  │  │
│  └─────────────┘                └───────┬────────┘  │
│                                         │            │
│                              ┌──────────┴──────────┐ │
│                              │                     │ │
│                    ┌─────────▼──────┐  ┌──────────▼┐│
│                    │   AI Service   │  │   MySQL   ││
│                    │ (Python:8001)  │  │  (3306)   ││
│                    └────────────────┘  └───────────┘│
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Running Without Docker (Local Dev)

Requirements:
- Java 21 + Maven
- Node.js 20+
- Python 3.11 + pip
- MySQL 8.0 running locally

Then just run `start-system.bat`.

---

## 📁 Project Structure

```
├── ai-service/            # Python FastAPI — face encoding & matching
├── attendance-backend/    # Spring Boot — REST API & business logic
├── attendance-frontend/   # React + Vite — UI
├── docker-compose.yml     # Orchestrates all services
└── start-system.bat       # Local dev launcher (Windows)
```

---

## ⚙️ Environment / Config

All sensitive config (DB password, JWT secret) lives in `docker-compose.yml`.  
Spring Boot's environment variable binding automatically overrides `application.properties` values at runtime — no code changes needed for Docker vs local dev.
