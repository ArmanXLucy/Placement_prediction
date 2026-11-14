const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/helpers');
const {
  toFeatureVector,
  predictProbability
} = require('../ml/logisticRegression');
const { ensureModel } = require('../ml/train');

const FEATURE_LABELS = {
  cgpa: 'CGPA',
  skills_count: 'Number of skills',
  projects_count: 'Projects',
  internships_count: 'Internships',
  certifications_count: 'Certifications',
  backlogs: 'Backlogs'
};

function adviceFor(student, contributions) {
  const tips = [];
  const byFeature = Object.fromEntries(
    contributions.map((c) => [c.feature, c.contribution])
  );

  if (Number(student.cgpa) < 7) tips.push('Raise your CGPA above 7.0 — it is the strongest eligibility filter.');
  if (Number(student.backlogs) > 0) tips.push('Clear active backlogs; several companies require zero backlogs.');
  if (Number(student.internships_count) === 0) tips.push('Complete at least one internship to boost your placement chances.');
  if (Number(student.projects_count) < 2) tips.push('Build 2–3 portfolio projects that demonstrate real skills.');
  if (Number(student.certifications_count) === 0) tips.push('Add a relevant certification (cloud, data, or development).');
  if (byFeature.skills_count <= 0) tips.push('Add more in-demand technical skills to your profile.');

  if (!tips.length) {
    tips.push('Your profile is strong — keep applying and practise interviews.');
  }
  return tips.slice(0, 4);
}

const predictMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');

  const student = await Student.findById(req.user.studentId);
  if (!student) throw new ApiError(404, 'Student profile not found');
  const skills = await Student.getSkills(student.id);

  const model = await ensureModel();
  const vector = toFeatureVector(student, skills.length);
  const ratio = predictProbability(model, vector);
  const percent = Number((ratio * 100).toFixed(2));

  const normalized = vector.map((v, i) => (v - model.means[i]) / model.stds[i]);
  const contributions = model.features
    .map((feature, i) => ({
      feature,
      label: FEATURE_LABELS[feature] || feature,
      value: vector[i],
      contribution: Number((normalized[i] * model.weights[i]).toFixed(3))
    }))
    .sort((a, b) => b.contribution - a.contribution);

  const risk = percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low';

  await Prediction.create(student.id, percent);

  res.json({
    success: true,
    prediction: {
      probability: percent,
      chance: Number(ratio.toFixed(4)),
      level: risk,
      student_id: student.id,
      predicted_at: new Date().toISOString(),
      contributions,
      advice: adviceFor(student, contributions),
      model: {
        algorithm: model.algorithm,
        trained_at: model.trained_at,
        metrics: model.metrics
      }
    }
  });
});

const mine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const [latest, history] = await Promise.all([
    Prediction.latest(req.user.studentId),
    Prediction.history(req.user.studentId, 10)
  ]);
  res.json({ success: true, latest, history });
});

const forStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(Number(req.params.studentId));
  if (!student) throw new ApiError(404, 'Student not found');
  const [latest, history] = await Promise.all([
    Prediction.latest(student.id),
    Prediction.history(student.id, 10)
  ]);
  res.json({ success: true, latest, history });
});

module.exports = { predictMine, mine, forStudent };
