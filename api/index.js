/**
 * Vercel serverless entry point.
 *
 * The Express app is exported (not started) so Vercel can invoke it as a
 * Node.js function for every request that matches /api/*.
 */
const app = require('../backend/src/server');

module.exports = app;
