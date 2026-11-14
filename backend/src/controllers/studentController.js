const pool = require('../config/database');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const { asyncHandler, withTransaction } = require('../utils/helpers');

function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.min(max, Math.max(min, n));
}

const getMe = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const student = await Student.findById(req.user.studentId);
  if (!student) throw new ApiError(404, 'Student profile not found');

  const [skills, stats] = await Promise.all([
    Student.getSkills(student.id),
    Student.stats(student.id)
  ]);

  res.json({ success: true, student, skills, stats });
});

const updateMe = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');

  const body = {};
  const allowed = [
    'first_name',
    'last_name',
    'branch',
    'resume_url'
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) body[field] = String(req.body[field]).trim();
  });

  if (req.body.cgpa !== undefined) {
    const cgpa = clampNumber(req.body.cgpa, 0, 10);
    if (cgpa === null) throw new ApiError(400, 'CGPA must be a number between 0 and 10');
    body.cgpa = cgpa;
  }
  if (req.body.backlogs !== undefined) {
    const backlogs = clampNumber(req.body.backlogs, 0, 30);
    if (backlogs === null) throw new ApiError(400, 'Backlogs must be a number');
    body.backlogs = Math.round(backlogs);
  }
  ['projects_count', 'internships_count', 'certifications_count'].forEach((field) => {
    if (req.body[field] !== undefined) {
      const value = clampNumber(req.body[field], 0, 100);
      if (value === null) throw new ApiError(400, `${field} must be a number`);
      body[field] = Math.round(value);
    }
  });
  if (req.body.graduation_year !== undefined) {
    const year = Number(req.body.graduation_year);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new ApiError(400, 'Graduation year must be between 2000 and 2100');
    }
    body.graduation_year = year;
  }

  if (body.first_name !== undefined && !body.first_name) {
    throw new ApiError(400, 'First name cannot be empty');
  }
  if (body.last_name !== undefined && !body.last_name) {
    throw new ApiError(400, 'Last name cannot be empty');
  }

  const student = await Student.update(req.user.studentId, body);
  res.json({ success: true, message: 'Profile updated', student });
});

const setSkills = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const { skills } = req.body;
  if (!Array.isArray(skills)) throw new ApiError(400, 'skills must be an array');

  const cleaned = [];
  const seen = new Set();
  for (const entry of skills) {
    const rawId = entry.skill_id ?? entry.skillId ?? entry.id;
    const skillId = Number(rawId);
    if (!Number.isInteger(skillId) || skillId <= 0) {
      throw new ApiError(400, 'Each skill needs a valid skill id');
    }
    if (seen.has(skillId)) continue;
    seen.add(skillId);
    cleaned.push({
      skill_id: skillId,
      proficiency: Math.min(5, Math.max(1, Number(entry.proficiency) || 3))
    });
  }

  if (cleaned.length) {
    const ids = cleaned.map((s) => s.skill_id);
    const [rows] = await pool.query(
      'SELECT id FROM skills WHERE id IN (?)',
      [ids]
    );
    if (rows.length !== ids.length) {
      throw new ApiError(400, 'One or more selected skills do not exist');
    }
  }

  await withTransaction(pool, (conn) =>
    Student.replaceSkills(conn, req.user.studentId, cleaned)
  );

  const updated = await Student.getSkills(req.user.studentId);
  res.json({ success: true, message: 'Skills updated', skills: updated });
});

const list = asyncHandler(async (req, res) => {
  const students = await Student.list({
    search: req.query.search || '',
    branch: req.query.branch || ''
  });
  res.json({ success: true, students });
});

const getById = asyncHandler(async (req, res) => {
  const student = await Student.findById(Number(req.params.id));
  if (!student) throw new ApiError(404, 'Student not found');
  const [skills, stats] = await Promise.all([
    Student.getSkills(student.id),
    Student.stats(student.id)
  ]);
  res.json({ success: true, student, skills, stats });
});

module.exports = { getMe, updateMe, setSkills, list, getById };
