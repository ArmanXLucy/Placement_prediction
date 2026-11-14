/**
 * Seeds placement_db with demo users, students, skills, companies,
 * jobs, applications and placement history (ML training data).
 *
 * Usage: npm run seed
 */
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Akash', 'Ananya', 'Ankit', 'Arjun', 'Avni', 'Bhavya',
  'Chirag', 'Dhruv', 'Diya', 'Esha', 'Gaurav', 'Harsh', 'Ishaan', 'Isha',
  'Kabir', 'Karan', 'Kavya', 'Kritika', 'Laksh', 'Manav', 'Meera', 'Mihir',
  'Naina', 'Neel', 'Nikhil', 'Ojas', 'Pari', 'Pranav', 'Priya', 'Rahul',
  'Riya', 'Rohan', 'Saanvi', 'Sahil', 'Sara', 'Shiv', 'Sneha', 'Tanvi',
  'Tara', 'Uday', 'Ved', 'Vihaan', 'Vikram', 'Yash', 'Zara', 'Aman',
  'Devanshi', 'Kunal'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Singh',
  'Mehta', 'Joshi', 'Kulkarni', 'Desai', 'Bose', 'Chatterjee', 'Rao', 'Das',
  'Malhotra', 'Kapoor', 'Agarwal', 'Bansal', 'Chopra', 'Dutta', 'Ghosh',
  'Jain', 'Khanna', 'Mishra', 'Pillai', 'Saxena', 'Shah', 'Sinha'
];

const BRANCHES = ['CSE', 'IT', 'AIML', 'DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

const SKILLS = [
  ['JavaScript', 'Programming'],
  ['TypeScript', 'Programming'],
  ['Python', 'Programming'],
  ['Java', 'Programming'],
  ['Kotlin', 'Mobile'],
  ['C++', 'Programming'],
  ['C#', 'Programming'],
  ['Go', 'Programming'],
  ['Rust', 'Programming'],
  ['React', 'Frontend'],
  ['Vue.js', 'Frontend'],
  ['Angular', 'Frontend'],
  ['HTML', 'Frontend'],
  ['CSS', 'Frontend'],
  ['Tailwind CSS', 'Frontend'],
  ['Node.js', 'Backend'],
  ['Express', 'Backend'],
  ['Django', 'Backend'],
  ['Flask', 'Backend'],
  ['Spring Boot', 'Backend'],
  ['.NET', 'Backend'],
  ['REST API', 'Backend'],
  ['GraphQL', 'Backend'],
  ['Microservices', 'Backend'],
  ['SQL', 'Database'],
  ['MySQL', 'Database'],
  ['PostgreSQL', 'Database'],
  ['MongoDB', 'Database'],
  ['Redis', 'Database'],
  ['Docker', 'DevOps'],
  ['Kubernetes', 'DevOps'],
  ['AWS', 'Cloud'],
  ['Azure', 'Cloud'],
  ['GCP', 'Cloud'],
  ['Terraform', 'DevOps'],
  ['CI/CD', 'DevOps'],
  ['Linux', 'DevOps'],
  ['Git', 'Tools'],
  ['Jest', 'Testing'],
  ['Cypress', 'Testing'],
  ['Machine Learning', 'Data'],
  ['TensorFlow', 'Data'],
  ['PyTorch', 'Data'],
  ['Pandas', 'Data'],
  ['NumPy', 'Data'],
  ['Data Analysis', 'Data'],
  ['System Design', 'Architecture'],
  ['Agile', 'Process'],
  ['Scrum', 'Process'],
  ['Communication', 'Soft Skills']
];

const COMPANIES = [
  ['Google', 'Global technology company known for search, cloud and AI.', 'https://google.com'],
  ['Microsoft', 'Software, cloud and productivity platform company.', 'https://microsoft.com'],
  ['Amazon', 'E-commerce and cloud computing leader.', 'https://amazon.com'],
  ['Meta', 'Social technology and AI company.', 'https://meta.com'],
  ['Apple', 'Consumer electronics and software company.', 'https://apple.com'],
  ['Netflix', 'Streaming entertainment service.', 'https://netflix.com'],
  ['Uber', 'Mobility and delivery platform.', 'https://uber.com'],
  ['Airbnb', 'Travel and stays marketplace.', 'https://airbnb.com'],
  ['Stripe', 'Online payments infrastructure.', 'https://stripe.com'],
  ['Shopify', 'Commerce platform for entrepreneurs.', 'https://shopify.com'],
  ['Atlassian', 'Team collaboration software.', 'https://atlassian.com'],
  ['Datadog', 'Observability and monitoring platform.', 'https://datadoghq.com'],
  ['Snowflake', 'Cloud data warehouse platform.', 'https://snowflake.com'],
  ['Vercel', 'Frontend cloud and deployment platform.', 'https://vercel.com'],
  ['Figma', 'Collaborative design platform.', 'https://figma.com'],
  ['Notion', 'Productivity and knowledge management.', 'https://notion.so'],
  ['Razorpay', 'Payments and banking platform.', 'https://razorpay.com'],
  ['Swiggy', 'Food delivery and quick commerce.', 'https://swiggy.com'],
  ['Zomato', 'Food delivery and restaurant discovery.', 'https://zomato.com'],
  ['Infosys', 'Global IT consulting and services.', 'https://infosys.com']
];

const JOB_TEMPLATES = [
  {
    title: 'Software Engineer',
    base: 14,
    skills: ['JavaScript', 'Docker', 'SQL', 'Git', 'REST API', 'System Design']
  },
  {
    title: 'Backend Developer',
    base: 11,
    skills: ['Node.js', 'Express', 'MySQL', 'REST API', 'Docker', 'Redis']
  },
  {
    title: 'Frontend Developer',
    base: 10,
    skills: ['React', 'JavaScript', 'CSS', 'Tailwind CSS', 'Git', 'TypeScript']
  },
  {
    title: 'Full Stack Developer',
    base: 12,
    skills: ['React', 'Node.js', 'SQL', 'REST API', 'Git', 'MongoDB']
  },
  {
    title: 'Data Scientist',
    base: 15,
    skills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'NumPy', 'Data Analysis']
  },
  {
    title: 'ML Engineer',
    base: 17,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Docker', 'Data Analysis']
  },
  {
    title: 'DevOps Engineer',
    base: 13,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform']
  },
  {
    title: 'Cloud Engineer',
    base: 12,
    skills: ['AWS', 'Azure', 'Linux', 'Docker', 'Terraform', 'CI/CD']
  },
  {
    title: 'Mobile Developer',
    base: 10,
    skills: ['Java', 'Kotlin', 'REST API', 'Git', 'System Design']
  },
  {
    title: 'QA Engineer',
    base: 8,
    skills: ['Jest', 'Cypress', 'JavaScript', 'SQL', 'Agile']
  },
  {
    title: 'Site Reliability Engineer',
    base: 16,
    skills: ['Linux', 'Kubernetes', 'AWS', 'Docker', 'System Design', 'CI/CD']
  },
  {
    title: 'Security Engineer',
    base: 15,
    skills: ['Linux', 'Python', 'AWS', 'System Design', 'Communication']
  },
  {
    title: 'Database Administrator',
    base: 9,
    skills: ['SQL', 'MySQL', 'PostgreSQL', 'Linux', 'System Design']
  },
  {
    title: 'Platform Engineer',
    base: 13,
    skills: ['Go', 'Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Linux']
  },
  {
    title: 'API Developer',
    base: 9,
    skills: ['Node.js', 'REST API', 'GraphQL', 'SQL', 'Git']
  },
  {
    title: 'Business Analyst',
    base: 8,
    skills: ['SQL', 'Data Analysis', 'Communication', 'Agile', 'Scrum']
  }
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample(arr, count) {
  return shuffle(arr).slice(0, Math.min(count, arr.length));
}

function toSqlDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function placementScore(features) {
  return (
    -8.0 +
    1.05 * (Number(features.cgpa) - 6) +
    0.42 * Number(features.skills_count) +
    0.55 * Number(features.projects_count) +
    0.9 * Number(features.internships_count) +
    0.35 * Number(features.certifications_count) -
    0.95 * Number(features.backlogs)
  );
}

function placementProbability(features) {
  const z = placementScore(features) + (Math.random() - 0.5) * 1.8;
  return 1 / (1 + Math.exp(-z));
}

function makeProfile() {
  const cgpa = round2(5.6 + Math.random() * 4.2);
  const backlogRoll = Math.random();
  let backlogs = 0;
  if (backlogRoll > 0.82) backlogs = 1;
  if (backlogRoll > 0.93) backlogs = 2;
  if (backlogRoll > 0.98) backlogs = 3;

  const projects = Math.max(0, Math.min(6, Math.round((cgpa - 5.5) * 0.8 + randInt(0, 2))));
  const internships = cgpa >= 8 ? randInt(0, 3) : randInt(0, 1);
  const certifications = randInt(0, 5);

  return { cgpa, backlogs, projects, internships, certifications };
}

let db;

async function main() {
  console.log('[seed] Starting seed...');

  // Use one dedicated connection for the whole seed. FOREIGN_KEY_CHECKS
  // and advisory locks are session-scoped, so a pool would be unsafe here.
  db = await pool.getConnection();
  const [[lock]] = await db.query("SELECT GET_LOCK('placement_seed', 120) AS got");
  if (!lock.got) {
    throw new Error('Another seed process is already running');
  }

  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'recommendations', 'predictions', 'application_log', 'applications',
    'job_skills', 'jobs', 'companies', 'student_skills', 'skills',
    'placement_history', 'students', 'users'
  ];
  for (const table of tables) {
    await db.query(`TRUNCATE TABLE ${table}`);
  }
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('[seed] Cleared existing data');

  // ------------------------------------------------------------
  // Users / students
  // ------------------------------------------------------------
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);
  const sharedHash = await bcrypt.hash('Password@123', 10);

  await db.query(
    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
    ['admin@demo.com', adminHash, 'admin']
  );

  const [demoUserResult] = await db.query(
    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
    ['student@demo.com', studentHash, 'student']
  );
  const [demoStudentResult] = await db.query(
    `INSERT INTO students
       (user_id, first_name, last_name, branch, cgpa, backlogs,
        projects_count, internships_count, certifications_count, graduation_year, is_placed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [demoUserResult.insertId, 'Aarav', 'Sharma', 'CSE', 8.6, 0, 4, 2, 3, 2026, 0]
  );
  const demoStudentId = demoStudentResult.insertId;

  const students = [];
  const studentCount = 140;

  for (let i = 0; i < studentCount; i += 1) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@campus.edu`;
    const branch = pick(BRANCHES);
    const profile = makeProfile();
    const skillCount = randInt(4, 11);
    const skillsCountForLabel = skillCount;
    const label = placementProbability({
      cgpa: profile.cgpa,
      skills_count: skillsCountForLabel,
      projects_count: profile.projects,
      internships_count: profile.internships,
      certifications_count: profile.certifications,
      backlogs: profile.backlogs
    }) >= 0.5 ? 1 : 0;

    const [userResult] = await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, sharedHash, 'student']
    );
    const [studentResult] = await db.query(
      `INSERT INTO students
         (user_id, first_name, last_name, branch, cgpa, backlogs,
          projects_count, internships_count, certifications_count,
          graduation_year, is_placed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        firstName,
        lastName,
        branch,
        profile.cgpa,
        profile.backlogs,
        profile.projects,
        profile.internships,
        profile.certifications,
        pick([2025, 2026, 2027]),
        label
      ]
    );

    students.push({
      id: studentResult.insertId,
      first_name: firstName,
      last_name: lastName,
      branch,
      ...profile,
      is_placed: label,
      skillCount: skillsCountForLabel
    });
  }

  console.log(`[seed] Created ${studentCount + 1} students and demo admin`);

  // ------------------------------------------------------------
  // Skills
  // ------------------------------------------------------------
  await db.query('INSERT INTO skills (name, category) VALUES ?', [SKILLS]);
  const [skillRows] = await db.query('SELECT id, name FROM skills');
  const skillIdByName = new Map(skillRows.map((s) => [s.name, s.id]));
  const allSkillNames = skillRows.map((s) => s.name);

  // ------------------------------------------------------------
  // Companies
  // ------------------------------------------------------------
  await db.query(
    'INSERT INTO companies (name, description, website) VALUES ?',
    [COMPANIES]
  );
  const [companyRows] = await db.query('SELECT id, name FROM companies');

  // ------------------------------------------------------------
  // Jobs
  // ------------------------------------------------------------
  const jobIds = [];
  const jobCount = 32;
  for (let i = 0; i < jobCount; i += 1) {
    const template = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const company = companyRows[i % companyRows.length];
    const skillNames = sample(template.skills, randInt(4, template.skills.length));
    const minCgpa = round2(6 + Math.random() * 2.4);
    const maxBacklogs = Math.random() > 0.55 ? 0 : randInt(1, 2);
    const packageLpa = round2(template.base + Math.random() * 8 - 2);
    const daysAhead = randInt(12, 95);
    const status = i < 26 ? 'active' : i < 30 ? 'closed' : 'filled';
    const deadline = new Date(Date.now() + daysAhead * 86400000);
    if (status !== 'active') deadline.setDate(deadline.getDate() - 20);

    const [jobResult] = await db.query(
      `INSERT INTO jobs
         (company_id, title, description, package_lpa, location,
          min_cgpa, max_backlogs, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company.id,
        template.title,
        `${company.name} is hiring a ${template.title}. You will work with a collaborative team on production systems, ship features and grow your technical skills.`,
        packageLpa,
        pick(LOCATIONS),
        minCgpa,
        maxBacklogs,
        toSqlDate(deadline),
        status
      ]
    );
    const jobId = jobResult.insertId;
    jobIds.push(jobId);

    const mandatoryCount = randInt(2, Math.min(3, skillNames.length));
    const jobSkillValues = skillNames.map((name, index) => [
      jobId,
      skillIdByName.get(name),
      index < mandatoryCount
    ]);
    await db.query(
      'INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES ?',
      [jobSkillValues]
    );
  }
  console.log(`[seed] Created ${jobIds.length} jobs with skill requirements`);

  // ------------------------------------------------------------
  // Student skills
  // ------------------------------------------------------------
  const demoSkills = [
    'JavaScript', 'React', 'Node.js', 'SQL', 'Python',
    'Docker', 'AWS', 'Git', 'REST API', 'MongoDB'
  ];
  const allStudentSkillValues = [];

  // Demo student gets a strong, relevant skill set.
  demoSkills.forEach((name) => {
    allStudentSkillValues.push([
      demoStudentId,
      skillIdByName.get(name),
      randInt(4, 5)
    ]);
  });

  students.forEach((student) => {
    const chosen = sample(allSkillNames, student.skillCount);
    chosen.forEach((name) => {
      allStudentSkillValues.push([
        student.id,
        skillIdByName.get(name),
        randInt(2, 5)
      ]);
    });
  });

  for (let i = 0; i < allStudentSkillValues.length; i += 500) {
    await db.query(
      'INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES ?',
      [allStudentSkillValues.slice(i, i + 500)]
    );
  }
  console.log(`[seed] Linked ${allStudentSkillValues.length} student skills`);

  // ------------------------------------------------------------
  // Placement history (current students + synthetic historical rows)
  // ------------------------------------------------------------
  const historyValues = students.map((student) => [
    student.id,
    student.cgpa,
    student.skillCount,
    student.projects,
    student.internships,
    student.certifications,
    student.backlogs,
    student.is_placed
  ]);

  // Demo student: strong profile but still unplaced.
  historyValues.push([
    demoStudentId,
    8.6,
    demoSkills.length,
    4,
    2,
    3,
    0,
    0
  ]);

  for (let i = 0; i < 260; i += 1) {
    const cgpa = round2(5.5 + Math.random() * 4.3);
    const skills = randInt(1, 14);
    const projects = randInt(0, 6);
    const internships = randInt(0, 3);
    const certifications = randInt(0, 6);
    const backlogs = Math.max(0, Math.round(Math.random() * 3 - 1));
    const placed = placementProbability({
      cgpa,
      skills_count: skills,
      projects_count: projects,
      internships_count: internships,
      certifications_count: certifications,
      backlogs
    }) >= 0.5 ? 1 : 0;
    historyValues.push([
      null, cgpa, skills, projects, internships, certifications, backlogs, placed
    ]);
  }

  for (let i = 0; i < historyValues.length; i += 300) {
    await db.query(
      `INSERT INTO placement_history
         (student_id, cgpa, skills_count, projects_count, internships_count,
          certifications_count, backlogs, is_placed)
       VALUES ?`,
      [historyValues.slice(i, i + 300)]
    );
  }
  const placedCount = historyValues.filter((row) => row[7] === 1).length;
  console.log(
    `[seed] Created ${historyValues.length} placement_history rows (${placedCount} placed)`
  );

  // ------------------------------------------------------------
  // Applications
  // ------------------------------------------------------------
  const [jobRows] = await db.query(
    'SELECT id, min_cgpa, max_backlogs, status, package_lpa FROM jobs'
  );
  const applicationValues = [];

  const allStudents = [
    {
      id: demoStudentId,
      cgpa: 8.6,
      backlogs: 0,
      is_placed: 0,
      isDemo: true
    },
    ...students
  ];

  allStudents.forEach((student) => {
    const eligible = jobRows.filter(
      (job) =>
        Number(student.cgpa) >= Number(job.min_cgpa) &&
        Number(student.backlogs) <= Number(job.max_backlogs)
    );
    if (!eligible.length) return;

    const desired = student.isDemo ? 4 : randInt(0, Math.min(7, eligible.length));
    const chosen = sample(eligible, desired);
    if (!chosen.length) return;

    let selectedAssigned = false;
    chosen.forEach((job, index) => {
      let status = 'applied';

      if (student.is_placed && !selectedAssigned && index === 0) {
        status = 'selected';
        selectedAssigned = true;
      } else if (student.is_placed && Math.random() < 0.2) {
        status = 'selected';
        selectedAssigned = true;
      } else {
        const roll = Math.random();
        if (roll < 0.42) status = 'applied';
        else if (roll < 0.64) status = 'shortlisted';
        else if (roll < 0.77) status = 'interviewed';
        else status = 'rejected';
      }

      if (student.isDemo) {
        status = ['applied', 'shortlisted', 'interviewed', 'rejected'][index % 4];
      }

      // Spread applications over the last ~5 months so analytics charts
      // have a realistic monthly trend.
      const appliedAt = new Date(
        Date.now() - randInt(0, 155) * 86400000 - randInt(0, 86400) * 1000
      );
      applicationValues.push([
        student.id,
        job.id,
        status,
        toSqlDate(appliedAt)
      ]);
    });
  });

  for (let i = 0; i < applicationValues.length; i += 300) {
    await db.query(
      'INSERT INTO applications (student_id, job_id, status, applied_at) VALUES ?',
      [applicationValues.slice(i, i + 300)]
    );
  }

  // Audit rows (written directly because the AFTER UPDATE trigger only
  // fires for status updates, not initial inserts).
  await db.query(
    `INSERT INTO application_log (application_id, old_status, new_status, changed_by)
     SELECT a.id, 'applied', a.status, a.student_id
       FROM applications a
      WHERE a.status <> 'applied'`
  );

  console.log(`[seed] Created ${applicationValues.length} applications`);

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  const [[summary]] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM students) AS students,
       (SELECT COUNT(*) FROM students WHERE is_placed = 1) AS placed,
       (SELECT COUNT(*) FROM skills) AS skills,
       (SELECT COUNT(*) FROM companies) AS companies,
       (SELECT COUNT(*) FROM jobs) AS jobs,
       (SELECT COUNT(*) FROM applications) AS applications,
       (SELECT COUNT(*) FROM placement_history) AS history`
  );

  console.log('[seed] Done:', summary);
  console.log('[seed] Demo accounts:');
  console.log('       admin@demo.com   / Admin@123');
  console.log('       student@demo.com / Student@123');
}

main()
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (db) {
      await db.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
      await db.query("SELECT RELEASE_LOCK('placement_seed')").catch(() => {});
      db.release();
    }
    await pool.end();
  });
