/**
 * Creates the database and applies schema.sql, views.sql,
 * triggers.sql and procedures.sql.
 *
 * Usage: npm run db:setup
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_DIR = path.join(__dirname, '../../database');
const FILES = ['schema.sql', 'views.sql', 'triggers.sql', 'procedures.sql'];

/**
 * Split a SQL file into statements, honouring `DELIMITER //` blocks
 * used by triggers and stored procedures.
 */
function splitStatements(sql) {
  const lines = sql.split(/\r?\n/);
  const statements = [];
  let delimiter = ';';
  let buffer = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const delimiterMatch = trimmed.match(/^DELIMITER\s+(\S+)$/i);
    if (delimiterMatch) {
      delimiter = delimiterMatch[1];
      continue;
    }

    buffer += `${line}\n`;

    if (buffer.trimEnd().endsWith(delimiter)) {
      let statement = buffer.trimEnd();
      statement = statement.slice(0, -delimiter.length).trim();
      if (statement) statements.push(statement);
      buffer = '';
    }
  }

  const rest = buffer.trim();
  if (rest) statements.push(rest);
  return statements;
}

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`[db] Connecting to MySQL at ${host}:${port} as ${user}`);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: false
  });

  try {
    for (const file of FILES) {
      const filePath = path.join(DB_DIR, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing SQL file: ${filePath}`);
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = splitStatements(sql);
      console.log(`[db] Applying ${file} (${statements.length} statements)`);
      for (const statement of statements) {
        await connection.query(statement);
      }
    }
    console.log('[db] Database is ready: placement_db');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('[db] Setup failed:', err.message);
  process.exitCode = 1;
});
