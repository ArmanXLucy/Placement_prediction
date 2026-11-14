const pool = require('../config/database');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Prediction = require('../models/Prediction');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/helpers');

async function studentSummary(studentId) {
  const [student, skills, stats, statusCounts, latestPrediction] = await Promise.all([
    Student.findById(studentId),
    Student.getSkills(studentId),
    Student.stats(studentId),
    Application.statusCounts(studentId),
    Prediction.latest(studentId)
  ]);
  if (!student) throw new ApiError(404, 'Student profile not found');

  const [recentApplications] = await pool.query(
    `SELECT a.id, a.status, a.applied_at, j.title, c.name AS company_name, j.package_lpa
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN companies c ON c.id = j.company_id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
      LIMIT 5`,
    [studentId]
  );

  return {
    role: 'student',
    student,
    skills,
    stats,
    statusCounts,
    latestPrediction,
    recentApplications
  };
}

async function adminSummary() {
  const [
    [studentRows],
    [jobRows],
    [applicationRows],
    [companyRows],
    [branchStats],
    [topSkills],
    [statusDistribution],
    [monthlyApplications],
    [topCompanies],
    [recentApplications],
    [packageStats]
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS total_students,
              SUM(CASE WHEN is_placed = 1 THEN 1 ELSE 0 END) AS placed_students
         FROM students`
    ),
    pool.query(
      `SELECT COUNT(*) AS total_jobs,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_jobs
         FROM jobs`
    ),
    pool.query(
      `SELECT COUNT(*) AS total_applications,
              SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END) AS selected_applications
         FROM applications`
    ),
    pool.query('SELECT COUNT(*) AS total_companies FROM companies'),
    pool.query('SELECT * FROM v_placement_stats ORDER BY placement_rate DESC'),
    pool.query(
      `SELECT sk.name, sk.category,
              COUNT(DISTINCT js.job_id) AS jobs_count,
              COUNT(DISTINCT ss.student_id) AS students_count
         FROM skills sk
         LEFT JOIN job_skills js ON js.skill_id = sk.id
         LEFT JOIN student_skills ss ON ss.skill_id = sk.id
        GROUP BY sk.id, sk.name, sk.category
        ORDER BY jobs_count DESC, students_count DESC
        LIMIT 10`
    ),
    pool.query(
      `SELECT status, COUNT(*) AS count
         FROM applications
        GROUP BY status
        ORDER BY count DESC`
    ),
    pool.query(
      `SELECT DATE_FORMAT(applied_at, '%Y-%m') AS month, COUNT(*) AS applications
         FROM applications
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6`
    ),
    pool.query(
      `SELECT c.name, COUNT(a.id) AS applications,
              COUNT(DISTINCT a.student_id) AS applicants
         FROM companies c
         LEFT JOIN jobs j ON j.company_id = c.id
         LEFT JOIN applications a ON a.job_id = j.id
        GROUP BY c.id, c.name
        ORDER BY applications DESC, applicants DESC
        LIMIT 8`
    ),
    pool.query(
      `SELECT a.id, a.status, a.applied_at,
              s.first_name, s.last_name, s.branch,
              j.title, c.name AS company_name
         FROM applications a
         JOIN students s ON s.id = a.student_id
         JOIN jobs j ON j.id = a.job_id
         LEFT JOIN companies c ON c.id = j.company_id
        ORDER BY a.applied_at DESC
        LIMIT 10`
    ),
    pool.query(
      `SELECT ROUND(AVG(package_lpa), 2) AS avg_package,
              MAX(package_lpa) AS max_package,
              MIN(package_lpa) AS min_package
         FROM jobs
        WHERE package_lpa IS NOT NULL`
    )
  ]);

  const totals = {
    ...studentRows[0],
    ...jobRows[0],
    ...applicationRows[0],
    ...companyRows[0],
    ...packageStats[0]
  };
  const totalStudents = Number(totals.total_students) || 0;
  const placedStudents = Number(totals.placed_students) || 0;
  const placementRate = totalStudents
    ? Number(((placedStudents / totalStudents) * 100).toFixed(2))
    : 0;

  return {
    role: 'admin',
    totals: { ...totals, placement_rate: placementRate },
    branchStats,
    topSkills,
    statusDistribution,
    monthlyApplications: monthlyApplications.reverse(),
    topCompanies,
    recentApplications
  };
}

const dashboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ success: true, data: await adminSummary() });
  }
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  return res.json({ success: true, data: await studentSummary(req.user.studentId) });
});

module.exports = { dashboard };
