const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function readUser(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Reject the request when there is no valid JWT. */
function requireAuth(req, res, next) {
  const user = readUser(req);
  if (!user) return next(new ApiError(401, 'Authentication required'));
  req.user = user;
  return next();
}

/** Attach req.user when a token is present, but never reject. */
function optionalAuth(req, res, next) {
  req.user = readUser(req);
  next();
}

/** Require one of the given roles, e.g. requireRole('admin'). */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to do that'));
    }
    return next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
