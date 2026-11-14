const ApiError = require('./ApiError');

/** Wrap async route handlers so rejected promises reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Run a function inside a transaction and commit/rollback automatically. */
async function withTransaction(pool, fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Convert a comma separated skill list from SQL into an array. */
function splitSkills(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function requireFields(body, fields) {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
}

module.exports = { asyncHandler, withTransaction, splitSkills, requireFields };
