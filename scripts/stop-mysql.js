/**
 * Gracefully stops the bundled MySQL 8 server.
 * Usage: npm run db:stop
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MYSQL_HOME = process.env.MYSQL_HOME || path.join(ROOT, '.tools', 'mysql');
const MYSQLADMIN = path.join(
  MYSQL_HOME,
  'bin',
  process.platform === 'win32' ? 'mysqladmin.exe' : 'mysqladmin'
);
const ENV_FILE = path.join(ROOT, 'backend', '.env');

function readEnv() {
  const env = {};
  if (!fs.existsSync(ENV_FILE)) return env;
  fs.readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    });
  return env;
}

const env = readEnv();
const user = process.env.DB_USER || env.DB_USER || 'root';
const password = process.env.DB_PASSWORD ?? env.DB_PASSWORD ?? '';
const host = process.env.DB_HOST || env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || env.DB_PORT || '3306';

if (!fs.existsSync(MYSQLADMIN)) {
  console.error(`[db] Could not find mysqladmin at ${MYSQLADMIN}`);
  process.exitCode = 1;
} else {
  const args = ['-h', host, '-P', String(port), '-u', user];
  if (password) args.push(`-p${password}`);
  args.push('shutdown');

  const result = spawnSync(MYSQLADMIN, args, { stdio: 'inherit' });
  if (result.status === 0) {
    console.log(`[db] MySQL on port ${port} has been shut down.`);
  } else {
    console.error('[db] Could not shut down MySQL. Is it running?');
    process.exitCode = result.status || 1;
  }
}
