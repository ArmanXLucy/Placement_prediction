-- 1. Find students who have applied to but havent been selected for any jobs
SELECT s.id, s.first_name, s.last_name, s.branch, s.cgpa, COUNT(a.id) AS total_applications,
       SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) AS selected_count
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.first_name, s.last_name, s.branch, s.cgpa
HAVING selected_count = 0;

-- 2. Find jobs with the highest match percentages
SELECT j.id, j.title, c.name AS company, j.package_lpa, j.location,
       ROUND(AVG(m.match_percent), 2) AS avg_match_percent,
       COUNT(a.id) AS total_applicants
FROM jobs j
JOIN companies c ON j.company_id = c.id
LEFT JOIN applications a ON j.id = a.job_id AND a.status IN ('applied', 'shortlisted', 'interviewed')
LEFT JOIN v_job_match m ON a.student_id = m.student_id AND a.job_id = m.job_id
GROUP BY j.id, j.title, c.name, j.package_lpa, j.location
ORDER BY avg_match_percent DESC
LIMIT 10;

-- 3. Branch-wise placement statistics
SELECT s.branch,
       COUNT(s.id) AS total_students,
       SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS placed_count,
       SUM(CASE WHEN s.is_placed = 0 THEN 1 ELSE 0 END) AS unplaced_count,
       ROUND(
           SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(s.id) * 100,
           2
       ) AS placement_rate,
       AVG(s.cgpa) AS avg_cgpa
FROM students s
GROUP BY s.branch
ORDER BY placement_rate DESC;

-- 4. Skills analysis: most in-demand skills across all jobs
SELECT s.name, s.category, COUNT(js.job_id) AS jobs_requiring_this_skill
FROM skills s
JOIN job_skills js ON s.id = js.skill_id
GROUP BY s.id, s.name, s.category
ORDER BY jobs_requiring_this_skill DESC
LIMIT 15;

-- 5. Students with the highest number of skills
SELECT s.id, s.first_name, s.last_name, s.branch, s.cgpa,
       COUNT(ss.skill_id) AS total_skills,
       MAX(ss.proficiency) AS max_proficiency
FROM students s
JOIN student_skills ss ON s.id = ss.student_id
GROUP BY s.id, s.first_name, s.last_name, s.branch, s.cgpa
ORDER BY total_skills DESC
LIMIT 10;

-- 6. Application status distribution
SELECT status, COUNT(*) AS count,
       ROUND(COUNT(*) / (SELECT COUNT(*) FROM applications) * 100, 2) AS percentage
FROM applications
GROUP BY status
ORDER BY count DESC;

-- 7. Jobs with highest package salaries
SELECT j.id, j.title, c.name AS company, j.package_lpa, j.location,
       j.min_cgpa, j.max_backlogs
FROM jobs j
JOIN companies c ON j.company_id = c.id
ORDER BY j.package_lpa DESC
LIMIT 10;

-- 8. Students who have backlogs exceeding job requirements
SELECT s.id, s.first_name, s.last_name, s.branch, s.cgpa, s.backlogs,
       j.title AS job_title, j.min_cgpa, j.max_backlogs
FROM students s
CROSS JOIN jobs j
WHERE s.backlogs > j.max_backlogs
  AND s.cgpa >= j.min_cgpa
ORDER BY s.backlogs - j.max_backlogs DESC
LIMIT 10;

-- 9. Placement history analysis: factors affecting placement
SELECT ph.skills_count, ph.projects_count, ph.internships_count, ph.certifications_count,
       ph.backlogs, ph.is_placed,
       ROUND(AVG(ph.cgpa), 2) AS avg_cgpa_for_group,
       COUNT(ph.id) AS student_count
FROM placement_history ph
GROUP BY ph.skills_count, ph.projects_count, ph.internships_count,
       ph.certifications_count, ph.backlogs, ph.is_placed
ORDER BY ph.is_placed DESC;

-- 10. Find recommended jobs for a specific student (using the procedure)
CALL sp_recommend_jobs(1);

-- 11. Students who applied to jobs in a specific location
SELECT DISTINCT s.id, s.first_name, s.last_name, s.branch
FROM students s
JOIN applications a ON s.id = a.student_id
JOIN jobs j ON a.job_id = j.id
WHERE j.location = 'Delhi'
ORDER BY s.branch;

-- 12. Average package by branch and placement status
SELECT s.branch,
       CASE WHEN s.is_placed = 1 THEN 'Placed' ELSE 'Unplaced' END AS status,
       AVG(j.package_lpa) AS avg_package,
       COUNT(a.id) AS total_applications
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
LEFT JOIN jobs j ON a.job_id = j.id
GROUP BY s.branch, s.is_placed
ORDER BY s.branch, status;

-- 13. Skills that are mandatory vs optional in jobs
SELECT js.is_mandatory, s.name, s.category, COUNT(DISTINCT js.job_id) AS num_jobs
FROM job_skills js
JOIN skills s ON js.skill_id = s.id
GROUP BY js.is_mandatory, s.id, s.name, s.category
ORDER BY js.is_mandatory ASC, num_jobs DESC;

-- 14. Students eligible for a specific job (based on CGPA and backlogs)
SELECT s.id, s.first_name, s.last_name, s.branch, s.cgpa, s.backlogs
FROM students s
WHERE s.cgpa >= 8.0 AND s.backlogs <= 2
ORDER BY s.cgpa DESC;

-- 15. Monthly application trends
SELECT DATE_FORMAT(a.applied_at, '%Y-%m') AS month, COUNT(*) AS applications
FROM applications a
GROUP BY month
ORDER BY month DESC
LIMIT 12;
