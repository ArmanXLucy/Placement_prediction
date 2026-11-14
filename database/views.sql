USE placement_db;

DROP VIEW IF EXISTS v_job_match;
DROP VIEW IF EXISTS v_placement_stats;
DROP VIEW IF EXISTS v_eligible_jobs;

-- ------------------------------------------------------------
-- v_eligible_jobs: every (student, active job) pair where the
-- student satisfies the CGPA / backlog eligibility rules.
-- ------------------------------------------------------------
CREATE VIEW v_eligible_jobs AS
SELECT
    s.id            AS student_id,
    j.id            AS job_id,
    j.company_id,
    j.title,
    j.package_lpa,
    j.location,
    j.min_cgpa,
    j.max_backlogs,
    j.deadline,
    j.status
FROM students s
JOIN jobs j
    ON j.status = 'active'
   AND s.cgpa >= j.min_cgpa
   AND s.backlogs <= j.max_backlogs;

-- ------------------------------------------------------------
-- v_job_match: skill-match percentage for every eligible pair.
--   matched_skills / missing_skills are comma separated lists.
-- ------------------------------------------------------------
CREATE VIEW v_job_match AS
SELECT
    e.student_id,
    e.job_id,
    COUNT(DISTINCT js.skill_id) AS required_count,
    COUNT(DISTINCT ss.skill_id) AS matched_count,
    COALESCE(
        GROUP_CONCAT(DISTINCT CASE WHEN ss.skill_id IS NOT NULL THEN sk.name END
                     ORDER BY sk.name SEPARATOR ', '),
        ''
    ) AS matched_skills,
    COALESCE(
        GROUP_CONCAT(DISTINCT CASE WHEN ss.skill_id IS NULL THEN req.name END
                     ORDER BY req.name SEPARATOR ', '),
        ''
    ) AS missing_skills,
    ROUND(
        COUNT(DISTINCT ss.skill_id) / NULLIF(COUNT(DISTINCT js.skill_id), 0) * 100,
        2
    ) AS match_percent
FROM v_eligible_jobs e
LEFT JOIN job_skills js ON js.job_id = e.job_id
LEFT JOIN skills req ON req.id = js.skill_id
LEFT JOIN student_skills ss
       ON ss.student_id = e.student_id
      AND ss.skill_id = js.skill_id
LEFT JOIN skills sk ON sk.id = ss.skill_id
GROUP BY e.student_id, e.job_id;

-- ------------------------------------------------------------
-- v_placement_stats: branch-wise placement summary
-- ------------------------------------------------------------
CREATE VIEW v_placement_stats AS
SELECT
    s.branch,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN s.is_placed = 1 THEN s.id END) AS placed_count,
    COUNT(DISTINCT CASE WHEN s.is_placed = 0 THEN s.id END) AS unplaced_count,
    ROUND(
        COUNT(DISTINCT CASE WHEN s.is_placed = 1 THEN s.id END)
        / NULLIF(COUNT(DISTINCT s.id), 0) * 100,
        2
    ) AS placement_rate,
    ROUND(AVG(s.cgpa), 2) AS avg_cgpa,
    ROUND(AVG(placed_job.package_lpa), 2) AS avg_package
FROM students s
LEFT JOIN (
    SELECT a.student_id, MAX(j.package_lpa) AS package_lpa
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.status = 'selected'
    GROUP BY a.student_id
) placed_job ON placed_job.student_id = s.id
GROUP BY s.branch;
