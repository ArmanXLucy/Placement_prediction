const Recommendation = require('../models/Recommendation');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/helpers');

const mine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const student = await Student.findById(req.user.studentId);
  if (!student) throw new ApiError(404, 'Student profile not found');

  const jobs = await Recommendation.refresh(req.user.studentId);
  res.json({
    success: true,
    count: Math.min(jobs.length, limit),
    recommendations: jobs.slice(0, limit)
  });
});

const saved = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const recommendations = await Recommendation.forStudent(req.user.studentId);
  res.json({ success: true, recommendations });
});

const forStudent = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.studentId);
  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, 'Student not found');
  const jobs = await Recommendation.refresh(studentId);
  res.json({ success: true, recommendations: jobs });
});

module.exports = { mine, saved, forStudent };
