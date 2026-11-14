const pool = require('../config/database');
const Job = require('../models/Job');
const Company = require('../models/Company');
const ApiError = require('../utils/ApiError');
const { asyncHandler, withTransaction } = require('../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const studentId = req.user?.studentId || 0;
  const jobs = await Job.list({
    search: req.query.search || '',
    location: req.query.location || '',
    status: req.query.status || '',
    minPackage: req.query.minPackage || 0,
    studentId
  });
  const locations = await Job.locations();
  res.json({ success: true, jobs, locations });
});

const detail = asyncHandler(async (req, res) => {
  const studentId = req.user?.studentId || 0;
  const job = await Job.findById(Number(req.params.id), studentId);
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, job });
});

function normalizeSkills(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const result = [];
  input.forEach((entry) => {
    const rawId = entry.skill_id ?? entry.skillId ?? entry.id;
    const skillId = Number(rawId);
    if (!Number.isInteger(skillId)) return;
    if (seen.has(skillId)) return;
    seen.add(skillId);
    result.push({
      skill_id: skillId,
      is_mandatory: Boolean(entry.is_mandatory ?? entry.isMandatory)
    });
  });
  return result;
}

const create = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body.title) throw new ApiError(400, 'Job title is required');

  const jobId = await withTransaction(pool, async (conn) => {
    let companyId = body.company_id ? Number(body.company_id) : null;
    if (!companyId) {
      if (!body.company_name) {
        throw new ApiError(400, 'company_id or company_name is required');
      }
      companyId = await Company.create(conn, {
        name: body.company_name,
        description: body.company_description,
        website: body.company_website
      });
    }
    return Job.create(
      conn,
      { ...body, company_id: companyId },
      normalizeSkills(body.skills)
    );
  });

  const job = await Job.findById(jobId);
  res.status(201).json({ success: true, message: 'Job created', job });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await Job.findById(id);
  if (!existing) throw new ApiError(404, 'Job not found');

  await withTransaction(pool, (conn) =>
    Job.update(conn, id, req.body, req.body.skills !== undefined
      ? normalizeSkills(req.body.skills)
      : undefined)
  );

  const job = await Job.findById(id);
  res.json({ success: true, message: 'Job updated', job });
});

const remove = asyncHandler(async (req, res) => {
  const removed = await Job.remove(Number(req.params.id));
  if (!removed) throw new ApiError(404, 'Job not found');
  res.json({ success: true, message: 'Job deleted' });
});

const companies = asyncHandler(async (req, res) => {
  const listResult = await Company.list();
  res.json({ success: true, companies: listResult });
});

module.exports = { list, detail, create, update, remove, companies };
