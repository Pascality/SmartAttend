#  SmartAttend

A full-stack facial recognition attendance system built with **React**, **Spring Boot**, **Python (FastAPI)**, and **MySQL**.

---

##  Setup & Running (Windows)

### 1. Requirements
*   **Java 21** + **Maven**
*   **Node.js 20+** 
*   **Python 3.11**
*   **MySQL 8.0** (Create a database named `smart_attendance`)

### 2. Configuration
Copy the example environment file and fill in your database credentials:
```bash
copy .env.example .env
```

### 3. One-Click Start
Just run the batch file to launch all services (AI, Backend, and Frontend):
```bash
start-system.bat
```

### 4. Access the App
*   **Frontend UI:** [http://localhost:5173](http://localhost:5173)
*   **Backend API:** [http://localhost:8080](http://localhost:8080)
*   **AI Service:** [http://localhost:8001](http://localhost:8001)

---

##  Project Structure
*   `ai-service/`: Python service for face encoding and matching.
*   `attendance-backend/`: Spring Boot REST API and business logic.
*   `attendance-frontend/`: Vite-powered React dashboard.
*   `start-system.bat`: Windows automation script to start all components.
