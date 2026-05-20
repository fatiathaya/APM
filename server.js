const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Python API URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

// Set EJS view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Prediction form route
app.get('/predict', (req, res) => {
    res.render('predict');
});

// Redirect GET requests on result to predict
app.get('/result', (req, res) => {
    res.redirect('/predict');
});

// Handle prediction submission
app.post('/result', async (req, res) => {
    try {
        // Helper to safely parse numbers without overriding falsy 0 values
        const parseOptionalInt = (val, defaultVal) => {
            if (val === undefined || val === null || val === '') return defaultVal;
            const parsed = parseInt(val);
            return isNaN(parsed) ? defaultVal : parsed;
        };

        const parseOptionalFloat = (val, defaultVal) => {
            if (val === undefined || val === null || val === '') return defaultVal;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? defaultVal : parsed;
        };

        // Retrieve and sanitize inputs - sesuai dengan 22 fitur model
        const age = parseOptionalInt(req.body.age, 65);
        const gender = parseOptionalInt(req.body.gender, 0);
        const bmi = parseOptionalFloat(req.body.bmi, 23.5);
        const smoking = parseOptionalInt(req.body.smoking, 0);
        const alcoholConsumption = parseOptionalFloat(req.body.alcohol, 0);
        const physicalActivity = parseOptionalFloat(req.body.physicalActivity, 5.0);
        const dietQuality = parseOptionalFloat(req.body.dietQuality, 6.0);
        const sleepQuality = parseOptionalFloat(req.body.sleepQuality, 7.0);
        const familyHistoryAlzheimers = parseOptionalInt(req.body.familyHistory, 0);
        const cardiovascularDisease = parseOptionalInt(req.body.cardiovascular, 0);
        const diabetes = parseOptionalInt(req.body.diabetes, 0);
        const depression = parseOptionalInt(req.body.depression, 0);
        const headInjury = parseOptionalInt(req.body.headInjury, 0);
        const hypertension = parseOptionalInt(req.body.hypertension, 0);
        const systolicBP = parseOptionalInt(req.body.systolicBP, 120);
        const diastolicBP = parseOptionalInt(req.body.diastolicBP, 80);
        const cholesterolTotal = parseOptionalFloat(req.body.cholesterolTotal, 200);
        const mmse = parseOptionalInt(req.body.mmse, 27);
        const functionalAssessment = parseOptionalFloat(req.body.functionalAssessment, 7.8);
        const memoryComplaints = parseOptionalInt(req.body.memoryComplaints, 0);
        const behavioralProblems = parseOptionalInt(req.body.behavioralProblems, 0);
        const adl = parseOptionalFloat(req.body.adl, 8.5);

        // Prepare data untuk Python API (sesuai urutan fitur model)
        const predictionData = {
            Age: age,
            Gender: gender,
            BMI: bmi,
            Smoking: smoking,
            AlcoholConsumption: alcoholConsumption,
            PhysicalActivity: physicalActivity,
            DietQuality: dietQuality,
            SleepQuality: sleepQuality,
            FamilyHistoryAlzheimers: familyHistoryAlzheimers,
            CardiovascularDisease: cardiovascularDisease,
            Diabetes: diabetes,
            Depression: depression,
            HeadInjury: headInjury,
            Hypertension: hypertension,
            SystolicBP: systolicBP,
            DiastolicBP: diastolicBP,
            CholesterolTotal: cholesterolTotal,
            MMSE: mmse,
            FunctionalAssessment: functionalAssessment,
            MemoryComplaints: memoryComplaints,
            BehavioralProblems: behavioralProblems,
            ADL: adl
        };

        // Call Python API untuk prediksi
        const response = await axios.post(`${PYTHON_API_URL}/predict`, predictionData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        const predictionResult = response.data;

        if (!predictionResult.success) {
            throw new Error(predictionResult.error || 'Prediction failed');
        }

        // Extract hasil prediksi
        const probability = predictionResult.probability;
        const probability_percentage = predictionResult.probability_percentage;
        const isHighRisk = predictionResult.is_high_risk;
        const statusText = predictionResult.status_text;

        // SVG Gauge circumference setup (2 * pi * 95)
        const circumference = 596.9;
        const dashoffset = circumference * (1 - probability);

        // Render result page dengan data prediksi
        res.render('result', {
            age,
            gender,
            bmi,
            physicalActivity,
            sleepQuality,
            dietQuality,
            smoking,
            alcohol: alcoholConsumption,
            diabetes,
            hypertension,
            cardiovascular: cardiovascularDisease,
            depression,
            headInjury,
            familyHistory: familyHistoryAlzheimers,
            systolicBP,
            diastolicBP,
            cholesterolTotal,
            mmse,
            adl,
            functionalAssessment,
            memoryComplaints,
            behavioralProblems,
            probability,
            probability_percentage,
            isHighRisk,
            statusText,
            themeColor: isHighRisk ? "var(--danger)" : "var(--success)",
            themeBg: isHighRisk ? "var(--danger-light)" : "var(--success-light)",
            badgeClass: isHighRisk ? "result-badge-high" : "result-badge-low",
            circumference,
            dashoffset,
            modelPrediction: predictionResult.prediction
        });

    } catch (error) {
        console.error('Prediction error:', error.message);
        
        // Jika Python API tidak tersedia, tampilkan error page
        res.status(500).render('error', {
            error: 'Prediction service unavailable',
            message: error.message,
            details: 'Please make sure the Python API is running on port 5000'
        });
    }
});

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
