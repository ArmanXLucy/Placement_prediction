const pool = require('../config/database');

const Skill = {
  async list() {
    const [rows] = await pool.query(
      `SELECT sk.id, sk.name, sk.category,
              (SELECT COUNT(*) FROM job_skills js WHERE js.skill_id = sk.id) AS jobs_count
         FROM skills sk
        ORDER BY sk.category, sk.name`
    );
    return rows;
  },

  async categories() {
    const [rows] = await pool.query(
      'SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category'
    );
    return rows.map((r) => r.category);
  }
};

module.exports = Skill;
