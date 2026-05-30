-- ============================================================
-- NeuroCare AI - Database MySQL (XAMPP)
-- Cara import:
--   1. Buka XAMPP -> Start Apache & MySQL
--   2. Jalankan database\setup_db.bat
--   ATAU buka http://localhost/phpmyadmin -> Import file ini
-- ============================================================

CREATE DATABASE IF NOT EXISTS neurocare_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE neurocare_ai;

-- Data pasien / sampel training (RS Hermina + form web)
CREATE TABLE IF NOT EXISTS patient_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  age INT NOT NULL,
  gender TINYINT NOT NULL COMMENT '0=Female, 1=Male',
  bmi DECIMAL(6,2) NOT NULL,
  smoking TINYINT NOT NULL DEFAULT 0,
  alcohol_consumption DECIMAL(6,2) NOT NULL DEFAULT 0,
  physical_activity DECIMAL(6,2) NOT NULL DEFAULT 0,
  diet_quality DECIMAL(6,2) NOT NULL DEFAULT 0,
  sleep_quality DECIMAL(6,2) NOT NULL DEFAULT 0,
  family_history_alzheimers TINYINT NOT NULL DEFAULT 0,
  cardiovascular_disease TINYINT NOT NULL DEFAULT 0,
  diabetes TINYINT NOT NULL DEFAULT 0,
  depression TINYINT NOT NULL DEFAULT 0,
  head_injury TINYINT NOT NULL DEFAULT 0,
  hypertension TINYINT NOT NULL DEFAULT 0,
  systolic_bp INT NOT NULL,
  diastolic_bp INT NOT NULL,
  cholesterol_total DECIMAL(8,2) NOT NULL,
  mmse DECIMAL(8,4) NOT NULL,
  functional_assessment DECIMAL(8,4) NOT NULL,
  memory_complaints TINYINT NOT NULL DEFAULT 0,
  behavioral_problems TINYINT NOT NULL DEFAULT 0,
  adl DECIMAL(8,4) NOT NULL,
  diagnosis TINYINT NULL COMMENT '0=Tidak Alzheimer, 1=Alzheimer, NULL=belum dikonfirmasi',
  source ENUM('hermina', 'web_form') NOT NULL DEFAULT 'web_form',
  is_learned TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=sudah dipakai model belajar',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_patient_diagnosis (diagnosis),
  INDEX idx_patient_source (source),
  INDEX idx_patient_created (created_at)
) ENGINE=InnoDB;

-- Log setiap prediksi dari aplikasi web
CREATE TABLE IF NOT EXISTS prediction_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_record_id INT NULL,
  model_prediction TINYINT NOT NULL COMMENT '0=Low, 1=High Alzheimer',
  probability DECIMAL(8,6) NOT NULL,
  probability_percentage DECIMAL(5,1) NOT NULL,
  is_high_risk TINYINT(1) NOT NULL,
  status_text VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prediction_patient
    FOREIGN KEY (patient_record_id) REFERENCES patient_records(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  INDEX idx_prediction_created (created_at)
) ENGINE=InnoDB;

-- Status pembelajaran model (continuous learning)
CREATE TABLE IF NOT EXISTS learning_state (
  id TINYINT PRIMARY KEY DEFAULT 1,
  rows_learned INT NOT NULL DEFAULT 0,
  total_samples INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO learning_state (id, rows_learned, total_samples)
VALUES (1, 0, 0)
ON DUPLICATE KEY UPDATE id = id;
