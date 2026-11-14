/**
 * One-shot project setup:
 *   1. create database + schema + views + triggers + procedures
 *   2. seed demo data
 *   3. train the placement prediction model
 *
 * MySQL must already be running (use `npm run db:start`).
 * Usage: npm run setup
 */
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'backend');

function runScript(script) {
  console.log(`\n=== npm run ${script} ===`);
  let result;
  if (process.platform === 'win32') {
    result = spawnSync(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', `npm run ${script}`],
      { cwd: BACKEND, stdio: 'inherit' }
    );
  } else {
    result = spawnSync('npm', ['run', script], {
      cwd: BACKEND,
      stdio: 'inherit'
    });
  }

  if (result.status !== 0) {
    console.error(`\n[setup] Step "${script}" failed.`);
    process.exit(result.status || 1);
  }
}

console.log('PlacementIQ setup');
console.log('Make sure MySQL is running: npm run db:start');
console.log(`Backend folder: ${BACKEND}`);

runScript('db:setup');
runScript('seed');
runScript('train');

console.log('\n[setup] Everything is ready.');
console.log('[setup] Start the backend:  npm run backend');
console.log('[setup] Start the frontend: npm run frontend');
console.log('[setup] Demo logins: student@demo.com / Student@123');
console.log('                   admin@demo.com   / Admin@123');
