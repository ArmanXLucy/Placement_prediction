const pool = require('../config/database');

const JOB_FIELDS = [
  'company_id',
  'title',
  'description',
  'package_lpa',
  'location',
  'min_cgpa',
  'max_backlogs',
  'deadline',
  'status'
];

const Job = {
  async list({ search = '', location = '', status = '', minPackage = 0, studentId = 0 } = {}) {
    const where = [];
    const params = [studentId, studentId];

    if (search) {
      where.push('(j.title LIKE ? OR c.name LIKE ? OR j.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (location) {
      where.push('j.location = ?');
      params.push(location);
    }
    if (status) {
      where.push('j.status = ?');
      params.push(status);
    }
    if (minPackage) {
      where.push('j.package_lpa >= ?');
      params.push(Number(minPackage));
    }

    const [rows] = await pool.query(
      `SELECT j.id, j.title, j.description, j.package_lpa, j.location,
              j.min_cgpa, j.max_backlogs, j.deadline, j.status, j.created_at,
              j.company_id, c.name AS company_name, c.website AS company_website,
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count,
              COALESCE(
                (SELECT GROUP_CONCAT(sk.name ORDER BY sk.name SEPARATOR ', ')
                   FROM job_skills js JOIN skills sk ON sk.id = js.skill_id
                  WHERE js.job_id = j.id),
                ''
              ) AS skills_csv,
              m.match_percent,
              m.matched_skills,
              m.missing_skills,
              EXISTS(
                SELECT 1 FROM applications a2
                 WHERE a2.job_id = j.id AND a2.student_id = ?
              ) AS applied
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company_id
         LEFT JOIN v_job_match m
                ON m.job_id = j.id AND m.student_id = ?
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY j.status = 'active' DESC, j.deadline IS NULL, j.deadline ASC, j.package_lpa DESC`,
      params
    );

    return rows.map((row) => ({
      ...row,
      applied: Boolean(row.applied),
      skills: row.skills_csv ? row.skills_csv.split(', ') : []
    }));
  },

  async findById(id, studentId = 0) {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.description AS company_description,
              c.website AS company_website,
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company_id
        WHERE j.id = ?`,
      [id]
    );
    const job = rows[0];
    if (!job) return null;

    const [skillRows] = await pool.query(
      `SELECT sk.id, sk.name, sk.category, js.is_mandatory,
              ss.proficiency,
              CASE WHEN ss.skill_id IS NULL THEN 0 ELSE 1 END AS has_skill
         FROM job_skills js
         JOIN skills sk ON sk.id = js.skill_id
         LEFT JOIN student_skills ss
                ON ss.skill_id = sk.id AND ss.student_id = ?
        WHERE js.job_id = ?
        ORDER BY js.is_mandatory DESC, sk.name`,
      [studentId, id]
    );

    let match = null;
    if (studentId) {
      const [matchRows] = await pool.query(
        'SELECT * FROM v_job_match WHERE student_id = ? AND job_id = ?',
        [studentId, id]
      );
      match = matchRows[0] || null;
    }

    const [appRows] = studentId
      ? await pool.query(
          'SELECT id, status, applied_at FROM applications WHERE student_id = ? AND job_id = ?',
          [studentId, id]
        )
      : [[]];

    return {
      ...job,
      skills: skillRows.map((s) => ({
        ...s,
        is_mandatory: Boolean(s.is_mandatory),
        has_skill: Boolean(s.has_skill)
      })),
      match,
      application: appRows[0] || null
    };
  },

  async create(conn, data, skills = []) {
    const [result] = await conn.query(
      `INSERT INTO jobs
         (company_id, title, description, package_lpa, location,
          min_cgpa, max_backlogs, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.title,
        data.description || null,
        data.package_lpa ?? null,
        data.location || null,
        data.min_cgpa ?? null,
        data.max_backlogs ?? 0,
        data.deadline || null,
        data.status || 'active'
      ]
    );
    const jobId = result.insertId;
    await this.setSkills(conn, jobId, skills);
    return jobId;
  },

  async update(conn, id, data, skills) {
    const fields = JOB_FIELDS.filter((f) => data[f] !== undefined);
    if (fields.length) {
      const assignments = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) => (data[f] === '' ? null : data[f]));
      await conn.query(`UPDATE jobs SET ${assignments} WHERE id = ?`, [...values, id]);
    }
    if (Array.isArray(skills)) {
      await this.setSkills(conn, id, skills);
    }
  },

  async setSkills(conn, jobId, skills) {
    await conn.query('DELETE FROM job_skills WHERE job_id = ?', [jobId]);
    if (!skills.length) return;
    const values = skills.map((s) => [
      jobId,
      Number(s.skill_id ?? s.skillId ?? s.id),
      Boolean(s.is_mandatory ?? s.isMandatory)
    ]);
    await conn.query(
      'INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES ?',
      [values]
    );
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async locations() {
    const [rows] = await pool.query(
      'SELECT DISTINCT location FROM jobs WHERE location IS NOT NULL ORDER BY location'
    );
    return rows.map((r) => r.location);
  }
};

module.exports = Job;
