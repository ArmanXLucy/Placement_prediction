/**
 * Small helper so controllers can `throw` and let the error
 * middleware produce a consistent JSON response.
 */
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = ApiError;
