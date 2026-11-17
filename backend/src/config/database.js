const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const isServerless = Boolean(process.env.VERCEL);

// Hosted MySQL providers (Aiven, TiDB Cloud, Railway, PlanetScale, ...)
// usually require TLS. Set DB_SSL=true in the deployment environment.
const useSSL = /^(1|true|require|required)$/i.test(String(process.env.DB_SSL || ''));

const poolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'placement_db',
  waitForConnections: true,
  // Serverless functions are reused across invocations, so keep the pool small.
  connectionLimit: Number(process.env.DB_POOL_SIZE || (isServerless ? 3 : 10)),
  maxIdle: Number(process.env.DB_POOL_SIZE || (isServerless ? 3 : 10)),
  idleTimeout: 60000,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
  enableKeepAlive: true
};

if (useSSL) {
  poolOptions.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolOptions);

module.exports = pool;
