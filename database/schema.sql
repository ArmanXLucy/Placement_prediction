-- ============================================================
-- AI-Based Placement Prediction & Job Recommendation System
-- MySQL 8 schema
-- Run with: mysql -u root -p < schema.sql
-- (or use: cd backend && npm run db:setup)
-- ============================================================

CREATE DATABASE IF NOT EXISTS placement_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE placement_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS application_log;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS placement_history;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Users: authentication + role
-- ------------------------------------------------------------
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Students: profile information (1:1 with users)
-- ------------------------------------------------------------
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    branch VARCHAR(100),
    cgpa DECIMAL(4,2) CHECK (cgpa >= 0 AND cgpa <= 10),
    backlogs INT DEFAULT 0 CHECK (backlogs >= 0),
    projects_count INT DEFAULT 0 CHECK (projects_count >= 0),
    internships_count INT DEFAULT 0 CHECK (internships_count >= 0),
    certifications_count INT DEFAULT 0 CHECK (certifications_count >= 0),
    graduation_year YEAR,
    resume_url VARCHAR(500),
    is_placed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Skills dictionary
-- ------------------------------------------------------------
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Student <-> Skills (M:N with proficiency 1..5)
-- ------------------------------------------------------------
CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency TINYINT CHECK (proficiency >= 1 AND proficiency <= 5),
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id)
        REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Companies
-- ------------------------------------------------------------
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    website VARCHAR(255)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Jobs
-- ------------------------------------------------------------
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    package_lpa DECIMAL(8,2) CHECK (package_lpa >= 0),
    location VARCHAR(100),
    min_cgpa DECIMAL(4,2) CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
    max_backlogs INT DEFAULT 0,
    deadline DATETIME,
    status ENUM('active', 'closed', 'filled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id)
        REFERENCES companies(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Job <-> Skills (M:N, mandatory flag)
-- ------------------------------------------------------------
CREATE TABLE job_skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (job_id, skill_id),
    CONSTRAINT fk_js_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id)
        REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Applications (student applies to job)
-- ------------------------------------------------------------
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('applied','shortlisted','interviewed','selected','rejected')
        DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_application (student_id, job_id),
    CONSTRAINT fk_app_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Audit log written by the applications trigger
-- ------------------------------------------------------------
CREATE TABLE application_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Historical placement data used to train the ML model
-- ------------------------------------------------------------
CREATE TABLE placement_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    cgpa DECIMAL(4,2),
    skills_count INT,
    projects_count INT,
    internships_count INT,
    certifications_count INT,
    backlogs INT,
    is_placed TINYINT(1),
    CONSTRAINT fk_ph_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Prediction results
-- ------------------------------------------------------------
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    probability DECIMAL(5,2),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Persisted job recommendations
-- ------------------------------------------------------------
CREATE TABLE recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    match_percent DECIMAL(5,2),
    matched_skills JSON,
    missing_skills JSON,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_rec (student_id, job_id),
    CONSTRAINT fk_rec_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_students_placed ON students(is_placed);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_placement_history_cgpa ON placement_history(cgpa);
CREATE INDEX idx_placement_history_placed ON placement_history(is_placed);
CREATE INDEX idx_predictions_student ON predictions(student_id);
