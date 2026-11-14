const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const User = require('../models/User');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const { asyncHandler, withTransaction } = require('../utils/helpers');
const { signToken } = require('../utils/jwt');

function publicUser(user, student) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    studentId: student ? student.id : null,
    student: student || null
  };
}

const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    branch,
    cgpa,
    backlogs,
    projects_count,
    internships_count,
    certifications_count,
    graduation_year
  } = req.body;

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findByEmail(normalizedEmail);
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const hashed = await bcrypt.hash(password, 10);

  const result = await withTransaction(pool, async (conn) => {
    const userId = await User.create(conn, {
      email: normalizedEmail,
      password: hashed,
      role: 'student'
    });
    const studentId = await Student.create(conn, userId, {
      first_name,
      last_name,
      branch,
      cgpa,
      backlogs,
      projects_count,
      internships_count,
      certifications_count,
      graduation_year
    });
    return { userId, studentId };
  });

  const student = await Student.findById(result.studentId);
  const token = signToken({
    id: result.userId,
    role: 'student',
    studentId: student.id
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: result.userId,
      email: normalizedEmail,
      role: 'student',
      studentId: student.id,
      student
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();
  const user = await User.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const matches = await bcrypt.compare(req.body.password, user.password);
  if (!matches) throw new ApiError(401, 'Invalid email or password');

  const student = user.role === 'student' ? await Student.findByUserId(user.id) : null;

  const token = signToken({
    id: user.id,
    role: user.role,
    studentId: student ? student.id : null
  });

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: publicUser(user, student)
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  const student = user.role === 'student' ? await Student.findByUserId(user.id) : null;
  res.json({ success: true, user: publicUser(user, student) });
});

module.exports = { register, login, me };
