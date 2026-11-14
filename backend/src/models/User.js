const pool = require('../config/database');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(conn, { email, password, role = 'student' }) {
    const [result] = await conn.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, role]
    );
    return result.insertId;
  }
};

module.exports = User;
