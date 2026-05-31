const { pool } = require('./db');

const INSERT_PATIENT_SQL = `
    INSERT INTO patient_records (
        age, gender, bmi, smoking, alcohol_consumption, physical_activity,
        diet_quality, sleep_quality, family_history_alzheimers, cardiovascular_disease,
        diabetes, depression, head_injury, hypertension, systolic_bp, diastolic_bp,
        cholesterol_total, mmse, functional_assessment, memory_complaints,
        behavioral_problems, adl, diagnosis, source, is_learned
    ) VALUES (
        :age, :gender, :bmi, :smoking, :alcohol_consumption, :physical_activity,
        :diet_quality, :sleep_quality, :family_history_alzheimers, :cardiovascular_disease,
        :diabetes, :depression, :head_injury, :hypertension, :systolic_bp, :diastolic_bp,
        :cholesterol_total, :mmse, :functional_assessment, :memory_complaints,
        :behavioral_problems, :adl, :diagnosis, :source, :is_learned
    )
`;

const INSERT_PREDICTION_SQL = `
    INSERT INTO prediction_logs (
        patient_record_id, model_prediction, probability,
        probability_percentage, is_high_risk, status_text
    ) VALUES (
        :patient_record_id, :model_prediction, :probability,
        :probability_percentage, :is_high_risk, :status_text
    )
`;

function mapFormToPatientRecord(formData, options = {}) {
    const {
        diagnosis = null,
        source = 'web_form',
        isLearned = 0
    } = options;

    return {
        age: formData.age,
        gender: formData.gender,
        bmi: formData.bmi,
        smoking: formData.smoking,
        alcohol_consumption: formData.alcoholConsumption,
        physical_activity: formData.physicalActivity,
        diet_quality: formData.dietQuality,
        sleep_quality: formData.sleepQuality,
        family_history_alzheimers: formData.familyHistoryAlzheimers,
        cardiovascular_disease: formData.cardiovascularDisease,
        diabetes: formData.diabetes,
        depression: formData.depression,
        head_injury: formData.headInjury,
        hypertension: formData.hypertension,
        systolic_bp: formData.systolicBP,
        diastolic_bp: formData.diastolicBP,
        cholesterol_total: formData.cholesterolTotal,
        mmse: formData.mmse,
        functional_assessment: formData.functionalAssessment,
        memory_complaints: formData.memoryComplaints,
        behavioral_problems: formData.behavioralProblems,
        adl: formData.adl,
        diagnosis,
        source,
        is_learned: isLearned
    };
}

async function savePatientRecord(formData, options = {}) {
    const payload = mapFormToPatientRecord(formData, options);
    const [result] = await pool.execute(INSERT_PATIENT_SQL, payload);
    return result.insertId;
}

async function savePredictionLog(patientRecordId, predictionResult) {
    const [result] = await pool.execute(INSERT_PREDICTION_SQL, {
        patient_record_id: patientRecordId,
        model_prediction: predictionResult.prediction,
        probability: predictionResult.probability,
        probability_percentage: predictionResult.probability_percentage,
        is_high_risk: predictionResult.is_high_risk ? 1 : 0,
        status_text: predictionResult.status_text
    });
    return result.insertId;
}

async function savePredictionSession(formData, predictionResult, options = {}) {
    const patientRecordId = await savePatientRecord(formData, options);
    const predictionLogId = await savePredictionLog(patientRecordId, predictionResult);
    return { patientRecordId, predictionLogId };
}

async function getDatasetStats() {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total_patients,
            SUM(CASE WHEN source = 'hermina' THEN 1 ELSE 0 END) AS hermina_samples,
            SUM(CASE WHEN source = 'web_form' THEN 1 ELSE 0 END) AS web_form_samples,
            SUM(CASE WHEN diagnosis = 1 THEN 1 ELSE 0 END) AS alzheimer_cases,
            SUM(CASE WHEN diagnosis = 0 THEN 1 ELSE 0 END) AS non_alzheimer_cases
        FROM patient_records
    `);
    const [predictions] = await pool.query('SELECT COUNT(*) AS total_predictions FROM prediction_logs');
    const [learning] = await pool.query('SELECT rows_learned, total_samples, last_updated FROM learning_state WHERE id = 1');

    return {
        ...rows[0],
        total_predictions: predictions[0].total_predictions,
        learning_state: learning[0] || null
    };
}

async function updateLearningState(rowsLearned, totalSamples) {
    await pool.execute(
        `UPDATE learning_state
         SET rows_learned = :rows_learned, total_samples = :total_samples
         WHERE id = 1`,
        { rows_learned: rowsLearned, total_samples: totalSamples }
    );
}

async function getUnlearnedPatientRecords(limit = 100) {
    const [rows] = await pool.query(
        `SELECT * FROM patient_records
         WHERE diagnosis IS NOT NULL AND is_learned = 0
         ORDER BY id ASC
         LIMIT ?`,
        [limit]
    );
    return rows;
}

async function markRecordsAsLearned(ids) {
    if (!ids.length) return;
    const placeholders = ids.map(() => '?').join(', ');
    await pool.query(
        `UPDATE patient_records SET is_learned = 1 WHERE id IN (${placeholders})`,
        ids
    );
}

async function getPatientRecords({ page = 1, limit = 15, source = 'all' } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];

    if (source !== 'all') {
        whereClause = 'WHERE source = ?';
        params.push(source);
    }

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total FROM patient_records ${whereClause}`,
        params
    );

    const [rows] = await pool.query(
        `SELECT id, age, gender, bmi, mmse, adl, diagnosis, source, is_learned, created_at
         FROM patient_records ${whereClause}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return { rows, total: countRows[0].total };
}

async function getPredictionLogs({ page = 1, limit = 15 } = {}) {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM prediction_logs');

    const [rows] = await pool.query(
        `SELECT pl.id, pl.patient_record_id, pl.model_prediction, pl.probability_percentage,
                pl.is_high_risk, pl.status_text, pl.created_at,
                pr.age, pr.gender, pr.mmse, pr.adl
         FROM prediction_logs pl
         LEFT JOIN patient_records pr ON pr.id = pl.patient_record_id
         ORDER BY pl.id DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );

    return { rows, total: countRows[0].total };
}

async function getPredictionSummary() {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total_predictions,
            COALESCE(SUM(CASE WHEN is_high_risk = 1 THEN 1 ELSE 0 END), 0) AS high_risk_count,
            COALESCE(SUM(CASE WHEN is_high_risk = 0 THEN 1 ELSE 0 END), 0) AS low_risk_count
        FROM prediction_logs
    `);
    return rows[0];
}

async function getPredictionLogById(id) {
    const [rows] = await pool.query(
        `SELECT pl.id, pl.patient_record_id, pl.model_prediction, pl.probability,
                pl.probability_percentage, pl.is_high_risk, pl.status_text, pl.created_at,
                pr.age, pr.gender, pr.bmi, pr.smoking, pr.alcohol_consumption,
                pr.physical_activity, pr.diet_quality, pr.sleep_quality,
                pr.family_history_alzheimers, pr.cardiovascular_disease,
                pr.diabetes, pr.depression, pr.head_injury, pr.hypertension,
                pr.systolic_bp, pr.diastolic_bp, pr.cholesterol_total,
                pr.mmse, pr.functional_assessment, pr.memory_complaints,
                pr.behavioral_problems, pr.adl
         FROM prediction_logs pl
         LEFT JOIN patient_records pr ON pr.id = pl.patient_record_id
         WHERE pl.id = ?`,
        [id]
    );
    return rows[0] || null;
}

function mapRecordToResultView(record) {
    if (!record || record.age == null) {
        return null;
    }

    const isHighRisk = !!record.is_high_risk;
    const probability = Number(record.probability);
    const probability_percentage = Number(record.probability_percentage);
    const circumference = 596.9;
    const dashoffset = circumference * (1 - probability);

    return {
        age: record.age,
        gender: record.gender,
        bmi: record.bmi,
        physicalActivity: record.physical_activity,
        sleepQuality: record.sleep_quality,
        dietQuality: record.diet_quality,
        smoking: record.smoking,
        alcohol: record.alcohol_consumption,
        diabetes: record.diabetes,
        hypertension: record.hypertension,
        cardiovascular: record.cardiovascular_disease,
        depression: record.depression,
        headInjury: record.head_injury,
        familyHistory: record.family_history_alzheimers,
        systolicBP: record.systolic_bp,
        diastolicBP: record.diastolic_bp,
        cholesterolTotal: record.cholesterol_total,
        mmse: record.mmse,
        adl: record.adl,
        functionalAssessment: record.functional_assessment,
        memoryComplaints: record.memory_complaints,
        behavioralProblems: record.behavioral_problems,
        probability,
        probability_percentage,
        isHighRisk,
        statusText: record.status_text,
        themeColor: isHighRisk ? 'var(--danger)' : 'var(--success)',
        themeBg: isHighRisk ? 'var(--danger-light)' : 'var(--success-light)',
        badgeClass: isHighRisk ? 'result-badge-high' : 'result-badge-low',
        circumference,
        dashoffset,
        modelPrediction: record.model_prediction,
        fromHistory: true,
        historyId: record.id,
        predictedAt: record.created_at
    };
}

module.exports = {
    savePatientRecord,
    savePredictionLog,
    savePredictionSession,
    getDatasetStats,
    getPatientRecords,
    getPredictionLogs,
    getPredictionSummary,
    getPredictionLogById,
    mapRecordToResultView,
    updateLearningState,
    getUnlearnedPatientRecords,
    markRecordsAsLearned,
    mapFormToPatientRecord
};
