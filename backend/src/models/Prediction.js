const pool = require('../config/database');

const Prediction = {
  async create(studentId, probability) {
    const [result] = await pool.query(
      'INSERT INTO predictions (student_id, probability) VALUES (?, ?)',
      [studentId, probability]
    );
    return result.insertId;
  },

  async latest(studentId) {
    const [rows] = await pool.query(
      `SELECT id, probability, predicted_at
         FROM predictions
        WHERE student_id = ?
        ORDER BY predicted_at DESC, id DESC
        LIMIT 1`,
      [studentId]
    );
    return rows[0] || null;
  },

  async history(studentId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT id, probability, predicted_at
         FROM predictions
        WHERE student_id = ?
        ORDER BY predicted_at DESC, id DESC
        LIMIT ?`,
      [studentId, Number(limit)]
    );
    return rows;
  }
};

module.exports = Prediction;
