const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('./config/database');
const apiRoutes = require('./routes');
const { demoEnabled } = require('./demo/mode');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.get('/api/health', async (req, res) => {
  if (demoEnabled) {
    return res.json({ success: true, status: 'ok', database: 'demo', mode: 'in-memory' });
  }
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      database: 'disconnected',
      message: err.message
    });
  }
});

app.use('/api', demoEnabled ? require('./demo/router') : apiRoutes);
app.use('/api', notFound);

// Serve the built React app when it exists (npm run build in frontend).
const distDir = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

function start() {
  const server = app.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
    if (demoEnabled) console.log('[server] Demo mode: in-memory data, MySQL is not used');
  });

  if (demoEnabled) return server;

  pool
    .query('SELECT 1')
    .then(() => console.log('[server] MySQL connection OK'))
    .catch((err) => {
      console.warn('[server] MySQL is not reachable yet:', err.message);
      console.warn('[server] Start MySQL, then run: npm run db:setup && npm run seed');
    });

  function shutdown(signal) {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
  }

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  return server;
}

if (require.main === module) start();

module.exports = app;
module.exports.start = start;
