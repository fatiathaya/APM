@echo off
echo ========================================
echo   Starting Python Flask API
echo ========================================
echo.
echo Installing/Checking dependencies...
python -m pip install --quiet flask flask-cors joblib numpy scikit-learn xgboost
echo.
echo Starting API on port 5000...
echo.
python predict_api.py
