const pool = require('../config/database');
const Application = require('../models/Application');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/helpers');

const STATUSES = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'];

const list = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const applications = await Application.listAll({
      status: req.query.status || '',
      search: req.query.search || ''
    });
    return res.json({ success: true, applications });
  }

  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const applications = await Application.listForStudent(req.user.studentId);
  return res.json({ success: true, applications });
});

const create = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(403, 'Only students can apply to jobs');
  const jobId = Number(req.body.job_id);

  const [jobRows] = await pool.query(
    `SELECT j.*, c.name AS company_name
       FROM jobs j LEFT JOIN companies c ON c.id = j.company_id
      WHERE j.id = ?`,
    [jobId]
  );
  const job = jobRows[0];
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.status !== 'active') throw new ApiError(400, 'This job is not accepting applications');
  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw new ApiError(400, 'The application deadline has passed');
  }

  const student = await Student.findById(req.user.studentId);
  if (!student) throw new ApiError(404, 'Student profile not found');
  if (Number(student.cgpa) < Number(job.min_cgpa)) {
    throw new ApiError(
      400,
      `Your CGPA (${student.cgpa}) is below the required minimum (${job.min_cgpa})`
    );
  }
  if (Number(student.backlogs) > Number(job.max_backlogs)) {
    throw new ApiError(
      400,
      `This job allows at most ${job.max_backlogs} backlog(s); you have ${student.backlogs}`
    );
  }

  const [existing] = await pool.query(
    'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
    [req.user.studentId, jobId]
  );
  if (existing.length) throw new ApiError(409, 'You have already applied to this job');

  let applicationId;
  try {
    applicationId = await Application.create(req.user.studentId, jobId);
  } catch (err) {
    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      throw new ApiError(400, err.sqlMessage || 'You are not eligible for this job');
    }
    throw err;
  }

  const application = await Application.findById(applicationId);
  res.status(201).json({
    success: true,
    message: `Application submitted to ${job.company_name || 'the company'}`,
    application
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '');
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }

  const existing = await Application.findById(Number(req.params.id));
  if (!existing) throw new ApiError(404, 'Application not found');

  const application = await Application.updateStatus(existing.id, status);
  res.json({ success: true, message: `Application marked as ${status}`, application });
});

const withdraw = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(403, 'Only students can withdraw applications');
  const application = await Application.findById(Number(req.params.id));
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.student_id !== req.user.studentId) {
    throw new ApiError(403, 'You can only withdraw your own applications');
  }
  if (application.status !== 'applied') {
    throw new ApiError(400, 'Only applications still in "applied" state can be withdrawn');
  }

  await pool.query('DELETE FROM applications WHERE id = ?', [application.id]);
  res.json({ success: true, message: 'Application withdrawn' });
});

module.exports = { list, create, updateStatus, withdraw, STATUSES };
