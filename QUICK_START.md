# 🚀 Quick Start Guide - NeuroCare AI

## First Time Setup (5 minutes)

### Step 1: Install Node.js Dependencies
```cmd
npm install
```
✅ This installs Express, EJS, axios, and other Node.js packages.

### Step 2: Install Python Dependencies
```cmd
pip install -r requirements.txt
```
✅ This installs Flask, XGBoost, scikit-learn, and other Python packages.

---

## Running the Application

### Option A: Automatic Start (Easiest) ⭐
Double-click `start.bat` or run:
```cmd
start.bat
```
This will:
1. Start Python API (port 5000)
2. Start Node.js server (port 3000)
3. Open browser automatically

### Option B: Manual Start
**Terminal 1:**
```cmd
python predict_api.py
```
Wait for: `✓ Model berhasil dimuat!`

**Terminal 2:**
```cmd
npm start
```
Wait for: `Server is running on port 3000`

**Browser:**
```
http://localhost:3000
```

---

## Testing the System

### Quick Test
1. Open http://localhost:3000/predict
2. Fill the form (use default values)
3. Click "Analyze Profile"
4. See results!

### API Test
```cmd
python test_api.py
```
Runs 5 automated tests to verify everything works.

---

## Common Issues

### ❌ "Module not found" error
**Solution:**
```cmd
npm install
pip install -r requirements.txt
```

### ❌ "Port already in use"
**Solution:** Close other applications using ports 3000 or 5000

### ❌ "Model not found"
**Solution:** Ensure `model_alzheimer_final (1).pkl` is in the project folder

### ❌ "Connection refused"
**Solution:** Start Python API first, then Node.js server

---

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Web App | http://localhost:3000 | Main application |
| Prediction Form | http://localhost:3000/predict | Input form |
| API Health | http://localhost:5000/health | Check API status |
| API Features | http://localhost:5000/features | List required features |

---

## File Checklist

Before running, ensure these files exist:
- ✅ `model_alzheimer_final (1).pkl` (ML model)
- ✅ `server.js` (Node.js server)
- ✅ `predict_api.py` (Python API)
- ✅ `package.json` (Node dependencies)
- ✅ `requirements.txt` (Python dependencies)
- ✅ `views/predict.ejs` (Form page)
- ✅ `views/result.ejs` (Results page)

---

## Need Help?

1. **Read**: `README.md` for detailed documentation
2. **Check**: `verify_integration.md` for verification steps
3. **Review**: `INTEGRATION_SUMMARY.md` for technical details
4. **Test**: Run `python test_api.py` to diagnose issues

---

## 🎯 That's It!

Your Alzheimer's prediction system is ready to use!

**Quick Command:**
```cmd
start.bat
```

Then open http://localhost:3000 in your browser.
