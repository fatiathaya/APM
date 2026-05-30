/**
 * Impor data CSV RS Hermina ke tabel patient_records.
 * Jalankan: npm run db:seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const CSV_PATH = path.join(__dirname, '..', 'alzheimers_hermina.csv');

const INSERT_SQL = `
    INSERT INTO patient_records (
        age, gender, bmi, smoking, alcohol_consumption, physical_activity,
        diet_quality, sleep_quality, family_history_alzheimers, cardiovascular_disease,
        diabetes, depression, head_injury, hypertension, systolic_bp, diastolic_bp,
        cholesterol_total, mmse, functional_assessment, memory_complaints,
        behavioral_problems, adl, diagnosis, source, is_learned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'hermina', 1)
`;

function parseCsvLine(line) {
    return line.split(',').map((value) => value.trim());
}

async function seedHerminaData() {
    if (!fs.existsSync(CSV_PATH)) {
        throw new Error(`File CSV tidak ditemukan: ${CSV_PATH}`);
    }

    const content = fs.readFileSync(CSV_PATH, 'utf8').trim();
    const lines = content.split(/\r?\n/).slice(1);

    const connection = await pool.getConnection();
    let inserted = 0;
    let skipped = 0;

    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            "SELECT COUNT(*) AS total FROM patient_records WHERE source = 'hermina'"
        );

        if (existing[0].total > 0) {
            console.log(`Data Hermina sudah ada (${existing[0].total} baris). Lewati seed.`);
            await connection.rollback();
            return;
        }

        for (const line of lines) {
            if (!line) continue;

            const values = parseCsvLine(line);
            if (values.length < 23) {
                skipped += 1;
                continue;
            }

            const row = values.map((value, index) => {
                if (index === 0) return Math.round(parseFloat(value));
                if ([1, 3, 8, 9, 10, 11, 12, 13, 19, 20, 22].includes(index)) {
                    return parseInt(value, 10);
                }
                return parseFloat(value);
            });

            await connection.execute(INSERT_SQL, row);
            inserted += 1;
        }

        await connection.execute(
            `UPDATE learning_state
             SET rows_learned = ?, total_samples = ?
             WHERE id = 1`,
            [inserted, inserted]
        );

        await connection.commit();
        console.log(`Seed selesai: ${inserted} baris ditambahkan, ${skipped} baris dilewati.`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
        await pool.end();
    }
}

seedHerminaData().catch((error) => {
    console.error('Gagal seed data Hermina:', error.message);
    process.exit(1);
});
