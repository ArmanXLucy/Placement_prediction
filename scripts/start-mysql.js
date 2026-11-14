/**
 * Starts the bundled MySQL 8 server (or $MYSQL_HOME) in the background.
 * Usage: npm run db:start
 */
const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MYSQL_HOME = process.env.MYSQL_HOME || path.join(ROOT, '.tools', 'mysql');
const MYSQLD = path.join(
  MYSQL_HOME,
  'bin',
  process.platform === 'win32' ? 'mysqld.exe' : 'mysqld'
);
const MY_INI = path.join(MYSQL_HOME, 'my.ini');
const LOG_FILE = path.join(ROOT, '.tools', 'mysqld.log');
const PORT = Number(process.env.DB_PORT || 3306);

function portOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: PORT });
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

async function main() {
  if (await portOpen()) {
    console.log(`[db] MySQL is already listening on port ${PORT}.`);
    return;
  }

  if (!fs.existsSync(MYSQLD)) {
    console.error(`[db] Could not find mysqld at ${MYSQLD}`);
    console.error('[db] Install MySQL 8 or set MYSQL_HOME to your MySQL folder.');
    process.exitCode = 1;
    return;
  }

  const out = fs.openSync(LOG_FILE, 'a');
  const args = ['--console'];
  if (fs.existsSync(MY_INI)) args.unshift(`--defaults-file=${MY_INI}`);

  console.log(`[db] Starting MySQL from ${MYSQLD} ...`);
  const child = spawn(MYSQLD, args, {
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true
  });
  child.unref();

  for (let i = 0; i < 45; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await portOpen()) {
      console.log(`[db] MySQL is ready on port ${PORT}.`);
      console.log(`[db] Log file: ${LOG_FILE}`);
      return;
    }
  }

  console.error('[db] MySQL did not start within 45 seconds.');
  console.error(`[db] Check the log: ${LOG_FILE}`);
  process.exitCode = 1;
}

main();
