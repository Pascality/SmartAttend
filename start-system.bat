@echo off
echo ===================================================
echo     Starting Smart Facial Attendance System
echo ===================================================
echo.

:: Load environment variables from .env file
if exist .env (
    echo Loading environment variables from .env ...
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            if not "%%a"=="" set "%%a=%%b"
        )
    )
    setlocal enabledelayedexpansion
    echo Done.
) else (
    echo WARNING: .env file not found! Copy .env.example to .env first.
    echo Run: copy .env.example .env
    pause
    exit /b 1
)
echo.

echo [1/3] Starting Python AI Service (Port 8001)...
cd ai-service
start "Smart Attendance - AI Service" cmd /k ".\\venv\\Scripts\\activate & uvicorn main:app --host 0.0.0.0 --port 8001"
cd ..

echo [2/3] Starting Java Spring Boot Backend (Port 8080)...
cd attendance-backend
start "Smart Attendance - Backend API" cmd /k ".\\mvnw.cmd spring-boot:run"
cd ..

echo [3/3] Starting React Frontend (Port 5173)...
cd attendance-frontend
start "Smart Attendance - Frontend UI" cmd /k "npm run dev"
cd ..

echo.
echo ===================================================
echo All services have been launched in separate windows!
echo Please wait about 15 seconds for Spring Boot to fully start.
echo.
echo Access your app at: http://localhost:5173
echo ===================================================
pause
