const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Map common MySQL errors to useful HTTP responses.
  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That record already exists';
  } else if (err.code === 'ER_SIGNAL_EXCEPTION') {
    status = 400;
    message = err.sqlMessage || message;
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'Referenced record does not exist';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 409;
    message = 'Record is still referenced by other data';
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Database is not reachable. Start MySQL and try again.';
  }

  if (status >= 500) {
    console.error('[API ERROR]', err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFound, ApiError };
