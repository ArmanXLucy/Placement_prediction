const pool = require('../config/database');

const Company = {
  async list() {
    const [rows] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id) AS jobs_count
         FROM companies c
        ORDER BY c.name`
    );
    return rows;
  },

  async create(conn, { name, description, website }) {
    const executor = conn || pool;
    const [result] = await executor.query(
      'INSERT INTO companies (name, description, website) VALUES (?, ?, ?)',
      [name, description || null, website || null]
    );
    return result.insertId;
  }
};

module.exports = Company;
