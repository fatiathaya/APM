@echo off
echo ========================================
echo   NeuroCare AI - Alzheimer Prediction
echo   Starting Application Servers...
echo ========================================
echo.

echo [1/2] Starting Python Flask API (Port 5000)...
start "Python API - Port 5000" cmd /k "python predict_api.py"

echo [2/2] Waiting 3 seconds for API to initialize...
timeout /t 3 /nobreak >nul

echo [2/2] Starting Node.js Express Server (Port 3000)...
start "Node.js Server - Port 3000" cmd /k "npm start"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo   Python API:       http://localhost:5000
echo   Web Application:  http://localhost:3000
echo.
echo   Press any key to open the application in browser...
pause >nul

start http://localhost:3000

echo.
echo Application opened in browser.
echo To stop servers, close their terminal windows.
echo.
