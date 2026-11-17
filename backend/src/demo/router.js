/**
 * In-memory demo API. Mounted instead of the MySQL-backed routes when demo
 * mode is active, so the app is fully usable without a database.
 */
const express = require('express');
const bcrypt = require('bcryptjs');

const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/helpers');
const { signToken } = require('../utils/jwt');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const { toFeatureVector, predictProbability } = require('../ml/logisticRegression');
const { ensureModel } = require('../ml/train');
const store = require('./store');

const router = express.Router();
const wrap = asyncHandler;

const BRANCHES = ['CSE', 'IT', 'AIML', 'DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const STATUSES = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'];
const FEATURE_LABELS = {
  cgpa: 'CGPA',
  skills_count: 'Number of skills',
  projects_count: 'Projects',
  internships_count: 'Internships',
  certifications_count: 'Certifications',
  backlogs: 'Backlogs'
};

function authUser(req) {
  return req.user;
}

function requireStudent(req) {
  if (!req.user.studentId) throw new ApiError(404, 'No student profile for this account');
  const student = store.studentById.get(req.user.studentId);
  if (!student) throw new ApiError(404, 'Student profile not found');
  return student;
}

function loginResponse(user) {
  const publicUser = store.publicUser(user);
  const token = signToken({
    id: user.id,
    role: user.role,
    studentId: user.studentId || null
  });
  return {
    success: true,
    message: 'Logged in successfully',
    token,
    user: publicUser
  };
}

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
  if (!tips.length) tips.push('Your profile is strong — keep applying and practise interviews.');
  return tips.slice(0, 4);
}

async function buildPrediction(student) {
  const skills = store.skillsFor(student.id);
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
  const level = percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low';
  const record = {
    id: store.nextId('prediction'),
    student_id: student.id,
    probability: percent,
    predicted_at: store.now()
  };
  store.predictions.push(record);
  return {
    probability: percent,
    chance: Number(ratio.toFixed(4)),
    level,
    student_id: student.id,
    predicted_at: record.predicted_at,
    contributions,
    advice: adviceFor(student, contributions),
    model: {
      algorithm: model.algorithm,
      trained_at: model.trained_at,
      metrics: model.metrics
    }
  };
}

/* ------------------------------- auth ---------------------------------- */

router.post(
  '/auth/login',
  wrap(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = store.users.find((u) => u.email === email);
    if (!user || !bcrypt.compareSync(String(req.body.password || ''), user.password)) {
      throw new ApiError(401, 'Invalid email or password');
    }
    res.json(loginResponse(user));
  })
);

router.post(
  '/auth/register',
  wrap(async (req, res) => {
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
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new ApiError(400, 'A valid email is required');
    }
    if (String(password || '').length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }
    if (!String(first_name || '').trim() || !String(last_name || '').trim()) {
      throw new ApiError(400, 'First name and last name are required');
    }
    if (store.users.some((u) => u.email === normalizedEmail)) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const user = {
      id: store.nextId('user'),
      email: normalizedEmail,
      password: bcrypt.hashSync(password, 10),
      role: 'student',
      studentId: null
    };
    const student = {
      id: store.nextId('student'),
      user_id: user.id,
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      branch: BRANCHES.includes(branch) ? branch : branch || null,
      cgpa: cgpa ?? null,
      backlogs: Number(backlogs) || 0,
      projects_count: Number(projects_count) || 0,
      internships_count: Number(internships_count) || 0,
      certifications_count: Number(certifications_count) || 0,
      graduation_year: graduation_year || null,
      resume_url: '',
      is_placed: 0,
      placed_company: null
    };
    user.studentId = student.id;
    store.users.push(user);
    store.students.push(student);
    store.studentById.set(student.id, student);
    store.userById.set(user.id, user);
    store.studentSkills.set(student.id, []);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: signToken({ id: user.id, role: 'student', studentId: student.id }),
      user: store.publicUser(user)
    });
  })
);

router.get(
  '/auth/me',
  requireAuth,
  wrap(async (req, res) => {
    const user = store.userById.get(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, user: store.publicUser(user) });
  })
);

/* ------------------------------ catalog -------------------------------- */

router.get(
  '/skills',
  wrap(async (req, res) => {
    res.json({
      success: true,
      skills: store.skills.map((skill) => ({
        ...skill,
        jobs_count: store.jobs.filter((job) =>
          job.skills.some(([id]) => id === skill.id)
        ).length
      })),
      categories: store.categories
    });
  })
);

router.get(
  '/companies',
  wrap(async (req, res) => {
    res.json({
      success: true,
      companies: store.companies.map((company) => ({
        ...company,
        jobs_count: store.jobs.filter((j) => j.company_id === company.id).length
      }))
    });
  })
);

/* ----------------------------- students -------------------------------- */

router.get(
  '/students/me',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    res.json({
      success: true,
      student: store.studentWithUser(student),
      skills: store.skillsFor(student.id),
      stats: store.studentStats(student.id)
    });
  })
);

router.put(
  '/students/me',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    const body = req.body;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

    ['first_name', 'last_name', 'branch', 'resume_url'].forEach((field) => {
      if (body[field] !== undefined) student[field] = String(body[field]).trim();
    });
    if (!student.first_name || !student.last_name) {
      throw new ApiError(400, 'First name and last name cannot be empty');
    }
    if (body.cgpa !== undefined && body.cgpa !== null && body.cgpa !== '') {
      student.cgpa = Number(clamp(body.cgpa, 0, 10).toFixed(2));
    }
    if (body.backlogs !== undefined) student.backlogs = Math.round(clamp(body.backlogs, 0, 30));
    ['projects_count', 'internships_count', 'certifications_count'].forEach((field) => {
      if (body[field] !== undefined) {
        student[field] = Math.round(clamp(body[field], 0, 100));
      }
    });
    if (body.graduation_year !== undefined && body.graduation_year !== null && body.graduation_year !== '') {
      const year = Number(body.graduation_year);
      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        throw new ApiError(400, 'Graduation year must be between 2000 and 2100');
      }
      student.graduation_year = year;
    }
    res.json({
      success: true,
      message: 'Profile updated',
      student: store.studentWithUser(student)
    });
  })
);

router.put(
  '/students/me/skills',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    if (!Array.isArray(req.body.skills)) throw new ApiError(400, 'skills must be an array');
    const seen = new Set();
    const cleaned = [];
    for (const entry of req.body.skills) {
      const skillId = Number(entry.skill_id ?? entry.skillId ?? entry.id);
      if (!Number.isInteger(skillId) || !store.skillById.has(skillId)) {
        throw new ApiError(400, 'One or more selected skills do not exist');
      }
      if (seen.has(skillId)) continue;
      seen.add(skillId);
      cleaned.push({
        skill_id: skillId,
        proficiency: Math.min(5, Math.max(1, Number(entry.proficiency) || 3))
      });
    }
    store.studentSkills.set(student.id, cleaned);
    res.json({
      success: true,
      message: 'Skills updated',
      skills: store.skillsFor(student.id)
    });
  })
);

router.get(
  '/students',
  requireAuth,
  requireRole('admin'),
  wrap(async (req, res) => {
    const search = String(req.query.search || '').toLowerCase();
    const branch = String(req.query.branch || '');
    const rows = store.students
      .map((student) => ({
        ...store.studentWithUser(student),
        applications: store.applications.filter((a) => a.student_id === student.id).length
      }))
      .filter((student) => {
        const text = `${student.first_name} ${student.last_name} ${student.email}`.toLowerCase();
        return (!search || text.includes(search)) && (!branch || student.branch === branch);
      })
      .sort((a, b) => Number(b.cgpa) - Number(a.cgpa));
    res.json({ success: true, students: rows });
  })
);

router.get(
  '/students/:id',
  requireAuth,
  requireRole('admin'),
  wrap(async (req, res) => {
    const student = store.studentById.get(Number(req.params.id));
    if (!student) throw new ApiError(404, 'Student not found');
    res.json({
      success: true,
      student: store.studentWithUser(student),
      skills: store.skillsFor(student.id),
      stats: store.studentStats(student.id)
    });
  })
);

/* -------------------------------- jobs --------------------------------- */

router.get(
  '/jobs/companies',
  optionalAuth,
  wrap(async (req, res) => {
    res.json({
      success: true,
      companies: store.companies.map((company) => ({
        ...company,
        jobs_count: store.jobs.filter((j) => j.company_id === company.id).length
      }))
    });
  })
);

router.get(
  '/jobs',
  optionalAuth,
  wrap(async (req, res) => {
    const studentId = req.user?.studentId || 0;
    const search = String(req.query.search || '').toLowerCase();
    const location = String(req.query.location || '');
    const status = String(req.query.status || '');
    const minPackage = Number(req.query.minPackage) || 0;

    const rows = store.jobs
      .filter((job) => {
        const company = store.companyById.get(job.company_id);
        const text = `${job.title} ${job.description} ${company ? company.name : ''}`.toLowerCase();
        return (
          (!search || text.includes(search)) &&
          (!location || job.location === location) &&
          (!status || job.status === status) &&
          (!minPackage || Number(job.package_lpa) >= minPackage)
        );
      })
      .sort((a, b) => {
        const activeDiff = (b.status === 'active' ? 1 : 0) - (a.status === 'active' ? 1 : 0);
        if (activeDiff) return activeDiff;
        const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (deadlineA !== deadlineB) return deadlineA - deadlineB;
        return Number(b.package_lpa) - Number(a.package_lpa);
      })
      .map((job) => store.jobListItem(job, studentId));

    res.json({
      success: true,
      jobs: rows,
      locations: [...new Set(store.jobs.map((j) => j.location).filter(Boolean))].sort()
    });
  })
);

router.get(
  '/jobs/:id',
  optionalAuth,
  wrap(async (req, res) => {
    const job = store.jobById.get(Number(req.params.id));
    if (!job) throw new ApiError(404, 'Job not found');
    res.json({ success: true, job: store.jobDetail(job, req.user?.studentId || 0) });
  })
);

/* ---------------------------- applications ----------------------------- */

function applicationView(application) {
  const job = store.jobById.get(application.job_id);
  const company = job ? store.companyById.get(job.company_id) : null;
  const student = store.studentById.get(application.student_id);
  const user = student ? store.userById.get(student.user_id) : null;
  return {
    id: application.id,
    status: application.status,
    applied_at: application.applied_at,
    updated_at: application.updated_at,
    student_id: application.student_id,
    first_name: student ? student.first_name : '',
    last_name: student ? student.last_name : '',
    branch: student ? student.branch : '',
    cgpa: student ? student.cgpa : null,
    student_email: user ? user.email : null,
    job_id: application.job_id,
    title: job ? job.title : '',
    package_lpa: job ? job.package_lpa : null,
    location: job ? job.location : '',
    deadline: job ? job.deadline : null,
    job_status: job ? job.status : null,
    company_name: company ? company.name : null
  };
}

function refreshPlacement(studentId) {
  const student = store.studentById.get(studentId);
  if (!student) return;
  const selected = store.applications
    .filter((a) => a.student_id === studentId && a.status === 'selected')
    .map((a) => store.jobById.get(a.job_id))
    .filter(Boolean);
  student.is_placed = selected.length ? 1 : 0;
  const company = selected.length ? store.companyById.get(selected[0].company_id) : null;
  student.placed_company = company ? company.name : null;
}

router.get(
  '/applications',
  requireAuth,
  wrap(async (req, res) => {
    if (req.user.role === 'admin') {
      const status = String(req.query.status || '');
      const search = String(req.query.search || '').toLowerCase();
      const rows = store.applications
        .map(applicationView)
        .filter((app) => {
          const text = `${app.first_name} ${app.last_name} ${app.title} ${app.company_name || ''}`.toLowerCase();
          return (!status || app.status === status) && (!search || text.includes(search));
        })
        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      return res.json({ success: true, applications: rows });
    }
    const student = requireStudent(req);
    const rows = store.applications
      .filter((a) => a.student_id === student.id)
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
      .map(applicationView);
    res.json({ success: true, applications: rows });
  })
);

router.post(
  '/applications',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    const job = store.jobById.get(Number(req.body.job_id));
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'active') throw new ApiError(400, 'This job is not accepting applications');
    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new ApiError(400, 'The application deadline has passed');
    }
    if (!store.isEligible(student, job)) {
      throw new ApiError(400, 'You are not eligible for this job');
    }
    if (store.appliedTo(student.id, job.id)) {
      throw new ApiError(409, 'You have already applied to this job');
    }
    const company = store.companyById.get(job.company_id);
    const application = {
      id: store.nextId('application'),
      student_id: student.id,
      job_id: job.id,
      status: 'applied',
      applied_at: store.now(),
      updated_at: store.now()
    };
    store.applications.push(application);
    res.status(201).json({
      success: true,
      message: `Application submitted to ${company ? company.name : 'the company'}`,
      application: applicationView(application)
    });
  })
);

router.patch(
  '/applications/:id/status',
  requireAuth,
  requireRole('admin'),
  wrap(async (req, res) => {
    const status = String(req.body.status || '');
    if (!STATUSES.includes(status)) {
      throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }
    const application = store.applications.find((a) => a.id === Number(req.params.id));
    if (!application) throw new ApiError(404, 'Application not found');
    application.status = status;
    application.updated_at = store.now();
    refreshPlacement(application.student_id);
    res.json({
      success: true,
      message: `Application marked as ${status}`,
      application: applicationView(application)
    });
  })
);

router.delete(
  '/applications/:id',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    const index = store.applications.findIndex((a) => a.id === Number(req.params.id));
    if (index === -1) throw new ApiError(404, 'Application not found');
    const application = store.applications[index];
    if (application.student_id !== student.id) {
      throw new ApiError(403, 'You can only withdraw your own applications');
    }
    if (application.status !== 'applied') {
      throw new ApiError(400, 'Only applications still in "applied" state can be withdrawn');
    }
    store.applications.splice(index, 1);
    res.json({ success: true, message: 'Application withdrawn' });
  })
);

/* --------------------------- recommendations --------------------------- */

router.get(
  '/recommendations/me',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const recommendations = store.recommendationsFor(student.id);
    res.json({
      success: true,
      count: Math.min(recommendations.length, limit),
      recommendations: recommendations.slice(0, limit)
    });
  })
);

router.get(
  '/recommendations/me/saved',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    res.json({
      success: true,
      recommendations: store.recommendationsFor(student.id)
    });
  })
);

router.get(
  '/recommendations/student/:studentId',
  requireAuth,
  requireRole('admin'),
  wrap(async (req, res) => {
    const student = store.studentById.get(Number(req.params.studentId));
    if (!student) throw new ApiError(404, 'Student not found');
    res.json({
      success: true,
      recommendations: store.recommendationsFor(student.id)
    });
  })
);

/* ------------------------------ predictions ---------------------------- */

function predictionHistory(studentId) {
  return store.predictions
    .filter((p) => p.student_id === studentId)
    .sort((a, b) => new Date(b.predicted_at) - new Date(a.predicted_at));
}

router.get(
  '/predictions/me',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    const history = predictionHistory(student.id);
    res.json({
      success: true,
      latest: history[0] || null,
      history: history.slice(0, 10)
    });
  })
);

router.post(
  '/predictions/me',
  requireAuth,
  wrap(async (req, res) => {
    const student = requireStudent(req);
    res.json({ success: true, prediction: await buildPrediction(student) });
  })
);

router.get(
  '/predictions/student/:studentId',
  requireAuth,
  requireRole('admin'),
  wrap(async (req, res) => {
    const student = store.studentById.get(Number(req.params.studentId));
    if (!student) throw new ApiError(404, 'Student not found');
    const history = predictionHistory(student.id);
    res.json({ success: true, latest: history[0] || null, history: history.slice(0, 10) });
  })
);

/* ------------------------------ analytics ------------------------------ */

router.get(
  '/analytics/dashboard',
  requireAuth,
  wrap(async (req, res) => {
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: store.adminSummary() });
    }
    const student = requireStudent(req);
    const recentApplications = store.applications
      .filter((a) => a.student_id === student.id)
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
      .slice(0, 5)
      .map(applicationView)
      .map((app) => ({
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        title: app.title,
        company_name: app.company_name,
        package_lpa: app.package_lpa
      }));
    const history = predictionHistory(student.id);
    res.json({
      success: true,
      data: {
        role: 'student',
        student: store.studentWithUser(student),
        skills: store.skillsFor(student.id),
        stats: store.studentStats(student.id),
        statusCounts: store.statusCounts(student.id),
        latestPrediction: history[0] || null,
        recentApplications
      }
    });
  })
);

module.exports = router;
