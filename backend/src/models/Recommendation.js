const pool = require('../config/database');
const { splitSkills } = require('../utils/helpers');

const Recommendation = {
  /**
   * Recompute recommendations from the sp_recommend_jobs stored procedure
   * and persist the latest result for the student.
   */
  async refresh(studentId) {
    const [groups] = await pool.query('CALL sp_recommend_jobs(?)', [studentId]);
    const jobs = groups[0] || [];

    if (jobs.length) {
      const values = jobs.map((job) => [
        studentId,
        job.id,
        job.match_percent ?? 0,
        JSON.stringify(splitSkills(job.matched_skills)),
        JSON.stringify(splitSkills(job.missing_skills))
      ]);
      await pool.query(
        `INSERT INTO recommendations
           (student_id, job_id, match_percent, matched_skills, missing_skills)
         VALUES ?
         ON DUPLICATE KEY UPDATE
           match_percent = VALUES(match_percent),
           matched_skills = VALUES(matched_skills),
           missing_skills = VALUES(missing_skills),
           recommended_at = CURRENT_TIMESTAMP`,
        [values]
      );
    }

    return jobs.map((job) => ({
      ...job,
      matched_skills: splitSkills(job.matched_skills),
      missing_skills: splitSkills(job.missing_skills),
      match_percent: Number(job.match_percent || 0)
    }));
  },

  async forStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT r.job_id AS id, r.match_percent, r.matched_skills, r.missing_skills,
              r.recommended_at,
              j.title, j.description, j.package_lpa, j.location,
              j.min_cgpa, j.max_backlogs, j.deadline, j.status,
              c.name AS company_name,
              EXISTS(
                SELECT 1 FROM applications a
                 WHERE a.student_id = r.student_id AND a.job_id = r.job_id
              ) AS applied
         FROM recommendations r
         JOIN jobs j ON j.id = r.job_id
         LEFT JOIN companies c ON c.id = j.company_id
        WHERE r.student_id = ?
        ORDER BY r.match_percent DESC, j.package_lpa DESC`,
      [studentId]
    );

    return rows.map((row) => ({
      ...row,
      applied: Boolean(row.applied),
      matched_skills: Array.isArray(row.matched_skills)
        ? row.matched_skills
        : splitSkills(row.matched_skills),
      missing_skills: Array.isArray(row.missing_skills)
        ? row.missing_skills
        : splitSkills(row.missing_skills)
    }));
  }
};

module.exports = Recommendation;
