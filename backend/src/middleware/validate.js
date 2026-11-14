const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(
      new ApiError(
        400,
        'Validation failed',
        result.array().map((e) => ({ field: e.path, message: e.msg }))
      )
    );
  }
  return next();
}

module.exports = validate;
