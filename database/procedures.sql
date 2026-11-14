USE placement_db;

DROP PROCEDURE IF EXISTS sp_recommend_jobs;
DROP PROCEDURE IF EXISTS sp_student_stats;

DELIMITER //

-- ------------------------------------------------------------
-- Recommended active jobs for a student, ordered by skill match
-- then package. Only eligible jobs are returned by v_job_match.
-- ------------------------------------------------------------
CREATE PROCEDURE sp_recommend_jobs(IN p_student_id INT)
BEGIN
    SELECT
        j.id,
        j.title,
        j.company_id,
        c.name AS company_name,
        j.package_lpa,
        j.location,
        j.min_cgpa,
        j.max_backlogs,
        j.deadline,
        j.status,
        m.match_percent,
        m.required_count,
        m.matched_count,
        m.matched_skills,
        m.missing_skills
    FROM v_job_match m
    JOIN jobs j ON j.id = m.job_id
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE m.student_id = p_student_id
      AND j.status = 'active'
    ORDER BY m.match_percent DESC, j.package_lpa DESC;
END//

-- ------------------------------------------------------------
-- Small aggregate used by the student dashboard.
-- ------------------------------------------------------------
CREATE PROCEDURE sp_student_stats(IN p_student_id INT)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM applications
          WHERE student_id = p_student_id) AS total_applications,
        (SELECT COUNT(*) FROM applications
          WHERE student_id = p_student_id AND status = 'selected') AS selected_count,
        (SELECT COUNT(*) FROM student_skills
          WHERE student_id = p_student_id) AS skill_count,
        (SELECT COUNT(*) FROM v_job_match
          WHERE student_id = p_student_id) AS eligible_jobs,
        (SELECT ROUND(probability, 2) FROM predictions
          WHERE student_id = p_student_id
          ORDER BY predicted_at DESC, id DESC LIMIT 1) AS placement_probability;
END//

DELIMITER ;
