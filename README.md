# NeuroCare AI - Alzheimer's Prediction System

## Overview
Web application for Alzheimer's disease risk prediction using XGBoost machine learning model. The system consists of:
- **Frontend**: Node.js/Express web server with EJS templates
- **Backend**: Flask Python API serving the XGBoost model
- **Model**: Trained XGBoost classifier with 22 clinical features

## System Architecture
```
User Browser → Node.js Server (Port 3000) → Python Flask API (Port 5000) → XGBoost Model
```

## Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

## Installation

### 1. Install Node.js Dependencies
```cmd
npm install
```

### 2. Install Python Dependencies
```cmd
pip install -r requirements.txt
```

## Running the Application

### Option 1: Manual Startup (Two Terminals)

**Terminal 1 - Start Python API:**
```cmd
python predict_api.py
```
Expected output:
```
🚀 Starting Flask API on port 5000...
✓ Model berhasil dimuat!
✓ Fitur yang dibutuhkan: ['Age', 'Gender', 'BMI', ...]
```

**Terminal 2 - Start Node.js Server:**
```cmd
npm start
```
Expected output:
```
Server is running on port 3000
```

### Option 2: Quick Start Script

Create `start.bat` file:
```batch
@echo off
echo Starting NeuroCare AI System...
echo.
echo Starting Python API on port 5000...
start cmd /k "python predict_api.py"
timeout /t 3 /nobreak >nul
echo Starting Node.js Server on port 3000...
start cmd /k "npm start"
echo.
echo Both servers are starting...
echo Python API: http://localhost:5000
echo Web Application: http://localhost:3000
```

Then run:
```cmd
start.bat
```

## Accessing the Application

1. **Web Interface**: http://localhost:3000
2. **Python API Health Check**: http://localhost:5000/health
3. **API Features List**: http://localhost:5000/features

## Model Features (22 Required Inputs)

The XGBoost model requires exactly 22 features in this order:

1. **Age** (50-90 years)
2. **Gender** (0=Female, 1=Male)
3. **BMI** (15.0-40.0)
4. **Smoking** (0=No, 1=Yes)
5. **AlcoholConsumption** (0-1 scale)
6. **PhysicalActivity** (0-10 hours/week)
7. **DietQuality** (1-10 scale)
8. **SleepQuality** (1-10 scale)
9. **FamilyHistoryAlzheimers** (0=No, 1=Yes)
10. **CardiovascularDisease** (0=No, 1=Yes)
11. **Diabetes** (0=No, 1=Yes)
12. **Depression** (0=No, 1=Yes)
13. **HeadInjury** (0=No, 1=Yes)
14. **Hypertension** (0=No, 1=Yes)
15. **SystolicBP** (90-180 mmHg)
16. **DiastolicBP** (60-120 mmHg)
17. **CholesterolTotal** (150-300 mg/dL)
18. **MMSE** (0-30 score)
19. **FunctionalAssessment** (0-10 scale)
20. **MemoryComplaints** (0=No, 1=Yes)
21. **BehavioralProblems** (0=No, 1=Yes)
22. **ADL** (0-10 scale)

## API Endpoints

### Python Flask API (Port 5000)

#### GET /health
Health check endpoint
```json
{
  "status": "healthy",
  "model_loaded": true,
  "features": ["Age", "Gender", ...]
}
```

#### GET /features
Get list of required features
```json
{
  "success": true,
  "features": ["Age", "Gender", ...],
  "total_features": 22
}
```

#### POST /predict
Make prediction
**Request:**
```json
{
  "Age": 65,
  "Gender": 0,
  "BMI": 23.5,
  "Smoking": 0,
  "AlcoholConsumption": 0,
  "PhysicalActivity": 5.0,
  "DietQuality": 6.0,
  "SleepQuality": 7.0,
  "FamilyHistoryAlzheimers": 0,
  "CardiovascularDisease": 0,
  "Diabetes": 0,
  "Depression": 0,
  "HeadInjury": 0,
  "Hypertension": 0,
  "SystolicBP": 120,
  "DiastolicBP": 80,
  "CholesterolTotal": 200,
  "MMSE": 27,
  "FunctionalAssessment": 7.8,
  "MemoryComplaints": 0,
  "BehavioralProblems": 0,
  "ADL": 8.5
}
```

**Response:**
```json
{
  "success": true,
  "prediction": 0,
  "probability": 0.234,
  "probability_percentage": 23.4,
  "is_high_risk": false,
  "status_text": "Low Risk Alzheimer"
}
```

## Troubleshooting

### Python API Not Starting
- **Error**: `ModuleNotFoundError: No module named 'flask'`
  - **Solution**: Run `pip install -r requirements.txt`

- **Error**: `FileNotFoundError: model_alzheimer_final (1).pkl`
  - **Solution**: Ensure the model file is in the project root directory

### Node.js Server Errors
- **Error**: `Cannot find module 'axios'`
  - **Solution**: Run `npm install`

- **Error**: `ECONNREFUSED localhost:5000`
  - **Solution**: Make sure Python API is running first

### Port Already in Use
- **Error**: `Port 3000 is already in use`
  - **Solution**: Change port in server.js or kill the process using the port

- **Error**: `Port 5000 is already in use`
  - **Solution**: Change port in predict_api.py or kill the process

## Development

### Run in Development Mode
```cmd
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Build Tailwind CSS
```cmd
npm run build:css
```

### Watch Tailwind CSS (Development)
```cmd
npm run watch:css
```

## Project Structure
```
APM/
├── views/
│   ├── index.ejs          # Home page
│   ├── predict.ejs        # Prediction form (22 inputs)
│   ├── result.ejs         # Results display
│   └── error.ejs          # Error page
├── public/
│   ├── css/
│   │   └── style.css      # Compiled Tailwind CSS
│   ├── js/
│   │   └── main.js        # Frontend JavaScript
│   └── images/
├── server.js              # Node.js Express server
├── predict_api.py         # Flask Python API
├── model_alzheimer_final (1).pkl  # XGBoost model
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Testing the Integration

1. **Start both servers** (Python API + Node.js)
2. **Open browser**: http://localhost:3000
3. **Navigate to**: Prediction page
4. **Fill the form** with test data
5. **Submit** and verify results display correctly

### Test Data Example
- Age: 70
- Gender: Male
- BMI: 25.0
- MMSE: 24
- All other fields: Use default values

Expected: Risk percentage and status displayed on result page

## Security Notes
- Input validation is performed on both client and server side
- API timeout set to 10 seconds
- No data is permanently stored
- All processing is done locally

## Credits
- **Institution**: Universitas Andalas
- **Faculty**: Fakultas Teknologi Informasi
- **Team**: Kelompok APM
- **Year**: 2026

## License
Educational project for academic purposes.
