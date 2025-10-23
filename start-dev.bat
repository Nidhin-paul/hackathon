@echo off
echo ========================================
echo Emergency Contact Hub - Development
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Server...
start cmd /k "npm run dev"
echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
