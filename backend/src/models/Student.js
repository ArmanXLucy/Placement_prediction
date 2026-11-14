const pool = require('../config/database');

const PROFILE_FIELDS = [
  'first_name',
  'last_name',
  'branch',
  'cgpa',
  'backlogs',
  'projects_count',
  'internships_count',
  'certifications_count',
  'graduation_year',
  'resume_url'
];

const Student = {
  async create(conn, userId, data) {
    const [result] = await conn.query(
      `INSERT INTO students
         (user_id, first_name, last_name, branch, cgpa, backlogs,
          projects_count, internships_count, certifications_count, graduation_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.first_name,
        data.last_name,
        data.branch || null,
        data.cgpa ?? null,
        data.backlogs ?? 0,
        data.projects_count ?? 0,
        data.internships_count ?? 0,
        data.certifications_count ?? 0,
        data.graduation_year || null
      ]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT s.*, u.email, u.role
         FROM students s
         JOIN users u ON u.id = s.user_id
        WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, u.email
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
        WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async list({ search = '', branch = '' } = {}) {
    const params = [];
    const where = [];
    if (search) {
      where.push('(s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (branch) {
      where.push('s.branch = ?');
      params.push(branch);
    }
    const [rows] = await pool.query(
      `SELECT s.*, u.email,
              (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id) AS applications
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY s.cgpa DESC, s.id ASC`,
      params
    );
    return rows;
  },

  async update(id, data) {
    const fields = PROFILE_FIELDS.filter((f) => data[f] !== undefined);
    if (!fields.length) return this.findById(id);
    const assignments = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (data[f] === '' ? null : data[f]));
    await pool.query(`UPDATE students SET ${assignments} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async getSkills(studentId) {
    const [rows] = await pool.query(
      `SELECT sk.id, sk.name, sk.category, ss.proficiency
         FROM student_skills ss
         JOIN skills sk ON sk.id = ss.skill_id
        WHERE ss.student_id = ?
        ORDER BY sk.name`,
      [studentId]
    );
    return rows;
  },

  async replaceSkills(conn, studentId, skills) {
    await conn.query('DELETE FROM student_skills WHERE student_id = ?', [studentId]);
    if (!skills.length) return;
    const values = skills.map((s) => [
      studentId,
      Number(s.skill_id ?? s.skillId ?? s.id),
      Math.min(5, Math.max(1, Number(s.proficiency ?? 3)))
    ]);
    await conn.query(
      'INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES ?',
      [values]
    );
  },

  async stats(studentId) {
    const [rows] = await pool.query('CALL sp_student_stats(?)', [studentId]);
    return rows[0][0] || {};
  }
};

module.exports = Student;
