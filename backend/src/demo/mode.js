/**
 * Demo mode switches the API to an in-memory dataset so the deployed app
 * works without MySQL.
 *
 * Rules:
 *   DEMO_MODE=true   -> demo (any environment)
 *   DEMO_MODE=false  -> real database
 *   unset on Vercel  -> demo
 *   unset locally    -> real database (backend/.env)
 */
const value = String(process.env.DEMO_MODE || '').trim().toLowerCase();

let enabled = Boolean(process.env.VERCEL);
if (['1', 'true', 'yes', 'on'].includes(value)) enabled = true;
if (['0', 'false', 'no', 'off'].includes(value)) enabled = false;

module.exports = { demoEnabled: enabled };
