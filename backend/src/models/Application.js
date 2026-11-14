const pool = require('../config/database');

const Application = {
  async listForStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, a.updated_at,
              j.id AS job_id, j.title, j.package_lpa, j.location,
              j.deadline, j.status AS job_status,
              c.name AS company_name
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         LEFT JOIN companies c ON c.id = j.company_id
        WHERE a.student_id = ?
        ORDER BY a.applied_at DESC`,
      [studentId]
    );
    return rows;
  },

  async listAll({ status = '', search = '' } = {}) {
    const where = [];
    const params = [];
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }
    if (search) {
      where.push(
        '(s.first_name LIKE ? OR s.last_name LIKE ? OR j.title LIKE ? OR c.name LIKE ?)'
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, a.updated_at,
              s.id AS student_id, s.first_name, s.last_name, s.branch, s.cgpa,
              u.email AS student_email,
              j.id AS job_id, j.title, j.package_lpa, j.location,
              c.name AS company_name
         FROM applications a
         JOIN students s ON s.id = a.student_id
         LEFT JOIN users u ON u.id = s.user_id
         JOIN jobs j ON j.id = a.job_id
         LEFT JOIN companies c ON c.id = j.company_id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY a.applied_at DESC
        LIMIT 500`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, s.first_name, s.last_name, j.title, j.min_cgpa, j.max_backlogs
         FROM applications a
         JOIN students s ON s.id = a.student_id
         JOIN jobs j ON j.id = a.job_id
        WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(studentId, jobId) {
    const [result] = await pool.query(
      'INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, ?)',
      [studentId, jobId, 'applied']
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async statusCounts(studentId = null) {
    const params = [];
    let where = '';
    if (studentId) {
      where = 'WHERE student_id = ?';
      params.push(studentId);
    }
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM applications ${where} GROUP BY status`,
      params
    );
    return rows;
  }
};

module.exports = Application;
