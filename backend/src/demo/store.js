/**
 * In-memory demo dataset. No database is required.
 * Data lives for the lifetime of a serverless instance.
 */
const bcrypt = require('bcryptjs');

const now = () => new Date().toISOString();

const skills = [
  { id: 1, name: 'JavaScript', category: 'Programming' },
  { id: 2, name: 'TypeScript', category: 'Programming' },
  { id: 3, name: 'Python', category: 'Programming' },
  { id: 4, name: 'Java', category: 'Programming' },
  { id: 5, name: 'C++', category: 'Programming' },
  { id: 6, name: 'SQL', category: 'Databases' },
  { id: 7, name: 'React', category: 'Frontend' },
  { id: 8, name: 'Node.js', category: 'Backend' },
  { id: 9, name: 'Express', category: 'Backend' },
  { id: 10, name: 'MongoDB', category: 'Databases' },
  { id: 11, name: 'Docker', category: 'DevOps' },
  { id: 12, name: 'AWS', category: 'Cloud' },
  { id: 13, name: 'Git', category: 'Tools' },
  { id: 14, name: 'Data Structures', category: 'CS Core' },
  { id: 15, name: 'Algorithms', category: 'CS Core' },
  { id: 16, name: 'Machine Learning', category: 'Data Science' },
  { id: 17, name: 'Pandas', category: 'Data Science' },
  { id: 18, name: 'NumPy', category: 'Data Science' },
  { id: 19, name: 'Spring Boot', category: 'Backend' },
  { id: 20, name: 'REST APIs', category: 'Backend' },
  { id: 21, name: 'Tailwind CSS', category: 'Frontend' },
  { id: 22, name: 'Figma', category: 'Design' },
  { id: 23, name: 'Kubernetes', category: 'DevOps' },
  { id: 24, name: 'Linux', category: 'Tools' }
];

const categories = [...new Set(skills.map((s) => s.category))].sort();

const companies = [
  {
    id: 1,
    name: 'TechNova Solutions',
    description: 'Product engineering company building developer tools.',
    website: 'https://technova.example.com'
  },
  {
    id: 2,
    name: 'DataForge Analytics',
    description: 'Analytics and machine-learning consultancy.',
    website: 'https://dataforge.example.com'
  },
  {
    id: 3,
    name: 'CloudSprint',
    description: 'Cloud infrastructure and platform engineering.',
    website: 'https://cloudsprint.example.com'
  },
  {
    id: 4,
    name: 'FinEdge Systems',
    description: 'Fintech products for lending and payments.',
    website: 'https://finedge.example.com'
  },
  {
    id: 5,
    name: 'PixelCraft Studios',
    description: 'Design-led consumer apps and brand systems.',
    website: 'https://pixelcraft.example.com'
  },
  {
    id: 6,
    name: 'QuantumHire',
    description: 'Talent platform for fast-growing startups.',
    website: 'https://quantumhire.example.com'
  }
];

// skills: [skillId, isMandatory]
const jobs = [
  {
    id: 1,
    company_id: 1,
    title: 'Frontend Developer',
    description:
      'Build polished React interfaces for our developer platform.\nYou will work with designers, ship reusable components and keep the UI fast and accessible.',
    package_lpa: 12,
    location: 'Bangalore',
    min_cgpa: 7,
    max_backlogs: 0,
    deadline: '2027-03-31',
    status: 'active',
    created_at: '2026-09-01T09:00:00.000Z',
    skills: [
      [7, true],
      [1, true],
      [21, false],
      [13, false]
    ]
  },
  {
    id: 2,
    company_id: 2,
    title: 'Data Analyst',
    description:
      'Turn raw business data into dashboards and recommendations.\nStrong SQL and Python are essential; experience with Pandas is a plus.',
    package_lpa: 9.5,
    location: 'Hyderabad',
    min_cgpa: 7.5,
    max_backlogs: 0,
    deadline: '2027-04-15',
    status: 'active',
    created_at: '2026-09-05T09:00:00.000Z',
    skills: [
      [3, true],
      [6, true],
      [17, false],
      [16, false]
    ]
  },
  {
    id: 3,
    company_id: 3,
    title: 'Cloud Engineer',
    description:
      'Deploy and operate containerised workloads on AWS.\nYou will automate infrastructure and improve reliability across environments.',
    package_lpa: 11,
    location: 'Pune',
    min_cgpa: 7,
    max_backlogs: 1,
    deadline: '2027-05-01',
    status: 'active',
    created_at: '2026-09-10T09:00:00.000Z',
    skills: [
      [12, true],
      [11, true],
      [24, false],
      [13, false]
    ]
  },
  {
    id: 4,
    company_id: 4,
    title: 'Backend Developer',
    description:
      'Design secure REST services for a lending platform.\nJava, Spring Boot and relational databases are core to this role.',
    package_lpa: 14,
    location: 'Mumbai',
    min_cgpa: 8,
    max_backlogs: 0,
    deadline: '2027-04-20',
    status: 'active',
    created_at: '2026-09-12T09:00:00.000Z',
    skills: [
      [4, true],
      [19, true],
      [6, true],
      [20, false]
    ]
  },
  {
    id: 5,
    company_id: 5,
    title: 'UI/UX Engineer',
    description:
      'Prototype and ship delightful interfaces.\nYou will move between Figma and frontend code to deliver production-ready designs.',
    package_lpa: 8,
    location: 'Remote',
    min_cgpa: 6.5,
    max_backlogs: 2,
    deadline: '2027-03-15',
    status: 'active',
    created_at: '2026-09-15T09:00:00.000Z',
    skills: [
      [22, true],
      [7, true],
      [21, false]
    ]
  },
  {
    id: 6,
    company_id: 6,
    title: 'Full Stack Developer',
    description:
      'Own features end to end across React and Node.js services.\nComfortable with APIs, SQL and shipping quickly in a small team.',
    package_lpa: 10.5,
    location: 'Bangalore',
    min_cgpa: 7,
    max_backlogs: 1,
    deadline: '2027-06-10',
    status: 'active',
    created_at: '2026-09-20T09:00:00.000Z',
    skills: [
      [1, true],
      [8, true],
      [7, true],
      [6, false],
      [13, false]
    ]
  },
  {
    id: 7,
    company_id: 1,
    title: 'QA Automation Engineer',
    description:
      'Write automated test suites for web applications.\nPython or JavaScript scripting experience preferred.',
    package_lpa: 7.5,
    location: 'Noida',
    min_cgpa: 6.5,
    max_backlogs: 2,
    deadline: '2027-02-28',
    status: 'active',
    created_at: '2026-09-25T09:00:00.000Z',
    skills: [
      [3, true],
      [1, true],
      [14, false]
    ]
  },
  {
    id: 8,
    company_id: 2,
    title: 'Machine Learning Engineer',
    description:
      'Train, evaluate and deploy predictive models.\nStrong Python, ML fundamentals and data wrangling skills required.',
    package_lpa: 16,
    location: 'Bangalore',
    min_cgpa: 8,
    max_backlogs: 0,
    deadline: '2027-05-20',
    status: 'active',
    created_at: '2026-10-01T09:00:00.000Z',
    skills: [
      [3, true],
      [16, true],
      [18, true],
      [17, false]
    ]
  },
  {
    id: 9,
    company_id: 3,
    title: 'DevOps Intern',
    description: 'Six-month internship supporting CI/CD pipelines and monitoring.',
    package_lpa: 6,
    location: 'Pune',
    min_cgpa: 6.5,
    max_backlogs: 1,
    deadline: '2026-12-15',
    status: 'closed',
    created_at: '2026-08-01T09:00:00.000Z',
    skills: [
      [11, true],
      [24, false]
    ]
  }
];

const studentSeeds = [
  {
    id: 1,
    user_id: 1,
    first_name: 'Aarav',
    last_name: 'Sharma',
    branch: 'CSE',
    cgpa: 8.6,
    backlogs: 0,
    projects_count: 3,
    internships_count: 2,
    certifications_count: 2,
    graduation_year: 2027,
    resume_url: '',
    is_placed: 0,
    placed_company: null,
    skills: [
      [1, 5],
      [7, 4],
      [8, 4],
      [6, 4],
      [13, 5],
      [21, 4],
      [3, 3]
    ]
  },
  {
    id: 2,
    user_id: 2,
    first_name: 'Priya',
    last_name: 'Verma',
    branch: 'IT',
    cgpa: 9.1,
    backlogs: 0,
    projects_count: 4,
    internships_count: 2,
    certifications_count: 3,
    graduation_year: 2027,
    resume_url: '',
    is_placed: 1,
    placed_company: 'DataForge Analytics',
    skills: [
      [3, 5],
      [6, 4],
      [17, 4],
      [18, 3],
      [16, 3],
      [13, 4]
    ]
  },
  {
    id: 3,
    user_id: 3,
    first_name: 'Rohan',
    last_name: 'Mehta',
    branch: 'ECE',
    cgpa: 7.4,
    backlogs: 1,
    projects_count: 2,
    internships_count: 1,
    certifications_count: 1,
    graduation_year: 2027,
    resume_url: '',
    is_placed: 0,
    placed_company: null,
    skills: [
      [4, 4],
      [19, 3],
      [6, 3],
      [13, 4],
      [20, 3]
    ]
  },
  {
    id: 4,
    user_id: 4,
    first_name: 'Ananya',
    last_name: 'Iyer',
    branch: 'AIML',
    cgpa: 8.9,
    backlogs: 0,
    projects_count: 3,
    internships_count: 1,
    certifications_count: 2,
    graduation_year: 2027,
    resume_url: '',
    is_placed: 1,
    placed_company: 'DataForge Analytics',
    skills: [
      [3, 5],
      [16, 4],
      [17, 5],
      [18, 4],
      [6, 4],
      [12, 3]
    ]
  },
  {
    id: 5,
    user_id: 5,
    first_name: 'Kabir',
    last_name: 'Nair',
    branch: 'DS',
    cgpa: 7.8,
    backlogs: 0,
    projects_count: 2,
    internships_count: 0,
    certifications_count: 1,
    graduation_year: 2028,
    resume_url: '',
    is_placed: 0,
    placed_company: null,
    skills: [
      [1, 3],
      [7, 3],
      [22, 4],
      [21, 3],
      [13, 3]
    ]
  },
  {
    id: 6,
    user_id: 6,
    first_name: 'Meera',
    last_name: 'Joshi',
    branch: 'CSE',
    cgpa: 6.9,
    backlogs: 2,
    projects_count: 1,
    internships_count: 0,
    certifications_count: 0,
    graduation_year: 2028,
    resume_url: '',
    is_placed: 0,
    placed_company: null,
    skills: [
      [5, 3],
      [14, 4],
      [15, 3],
      [13, 2]
    ]
  }
];

const studentUsers = [
  { email: 'student@demo.com', password: 'Student@123' },
  { email: 'priya@demo.com', password: 'Password@123' },
  { email: 'rohan@demo.com', password: 'Password@123' },
  { email: 'ananya@demo.com', password: 'Password@123' },
  { email: 'kabir@demo.com', password: 'Password@123' },
  { email: 'meera@demo.com', password: 'Password@123' }
];

const users = [
  ...studentUsers.map((entry, index) => ({
    id: index + 1,
    email: entry.email,
    password: bcrypt.hashSync(entry.password, 10),
    role: 'student',
    studentId: index + 1
  })),
  {
    id: 7,
    email: 'admin@demo.com',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    studentId: null
  }
];

const students = studentSeeds.map(({ skills: skillList, ...student }) => ({
  ...student,
  user_id: student.user_id
}));

const studentSkills = new Map(
  studentSeeds.map((student) => [
    student.id,
    student.skills.map(([skill_id, proficiency]) => ({ skill_id, proficiency }))
  ])
);

const applications = [
  { id: 1, student_id: 1, job_id: 1, status: 'shortlisted', applied_at: '2026-11-01T10:00:00.000Z', updated_at: '2026-11-05T10:00:00.000Z' },
  { id: 2, student_id: 1, job_id: 2, status: 'applied', applied_at: '2026-11-10T10:00:00.000Z', updated_at: '2026-11-10T10:00:00.000Z' },
  { id: 3, student_id: 1, job_id: 5, status: 'rejected', applied_at: '2026-10-20T10:00:00.000Z', updated_at: '2026-11-02T10:00:00.000Z' },
  { id: 4, student_id: 2, job_id: 2, status: 'selected', applied_at: '2026-10-20T10:00:00.000Z', updated_at: '2026-11-01T10:00:00.000Z' },
  { id: 5, student_id: 2, job_id: 8, status: 'selected', applied_at: '2026-10-25T10:00:00.000Z', updated_at: '2026-11-03T10:00:00.000Z' },
  { id: 6, student_id: 3, job_id: 5, status: 'applied', applied_at: '2026-11-05T10:00:00.000Z', updated_at: '2026-11-05T10:00:00.000Z' },
  { id: 7, student_id: 4, job_id: 8, status: 'selected', applied_at: '2026-10-15T10:00:00.000Z', updated_at: '2026-10-30T10:00:00.000Z' },
  { id: 8, student_id: 4, job_id: 2, status: 'interviewed', applied_at: '2026-11-08T10:00:00.000Z', updated_at: '2026-11-12T10:00:00.000Z' },
  { id: 9, student_id: 5, job_id: 5, status: 'applied', applied_at: '2026-11-12T10:00:00.000Z', updated_at: '2026-11-12T10:00:00.000Z' },
  { id: 10, student_id: 6, job_id: 7, status: 'applied', applied_at: '2026-11-14T10:00:00.000Z', updated_at: '2026-11-14T10:00:00.000Z' }
];

const predictions = [
  { id: 1, student_id: 1, probability: 78.4, predicted_at: '2026-10-01T09:00:00.000Z' },
  { id: 2, student_id: 1, probability: 82.1, predicted_at: '2026-11-01T09:00:00.000Z' }
];

let nextIds = {
  user: 8,
  student: 7,
  application: Math.max(...applications.map((a) => a.id)) + 1,
  prediction: Math.max(...predictions.map((p) => p.id)) + 1
};

const skillById = new Map(skills.map((s) => [s.id, s]));
const studentById = new Map(students.map((s) => [s.id, s]));
const userById = new Map(users.map((u) => [u.id, u]));
const jobById = new Map(jobs.map((j) => [j.id, j]));
const companyById = new Map(companies.map((c) => [c.id, c]));

function nextId(kind) {
  const id = nextIds[kind];
  nextIds[kind] += 1;
  return id;
}

function studentWithUser(student) {
  if (!student) return null;
  const user = userById.get(student.user_id);
  return {
    ...student,
    email: user ? user.email : null,
    role: user ? user.role : 'student'
  };
}

function publicUser(user) {
  const student = user.studentId ? studentWithUser(studentById.get(user.studentId)) : null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    studentId: student ? student.id : null,
    student
  };
}

function skillsFor(studentId) {
  return (studentSkills.get(studentId) || []).map((entry) => {
    const skill = skillById.get(entry.skill_id);
    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      proficiency: entry.proficiency
    };
  });
}

function jobSkillEntries(job) {
  return job.skills.map(([skillId, mandatory]) => {
    const skill = skillById.get(skillId);
    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      is_mandatory: mandatory
    };
  });
}

function isEligible(student, job) {
  if (!student) return false;
  return (
    Number(student.cgpa) >= Number(job.min_cgpa) &&
    Number(student.backlogs) <= Number(job.max_backlogs)
  );
}

function matchFor(studentId, job) {
  const student = studentById.get(studentId);
  if (!student || !isEligible(student, job)) return null;
  const owned = new Set((studentSkills.get(studentId) || []).map((s) => s.skill_id));
  const required = job.skills.map(([id]) => id);
  const matched = [];
  const missing = [];
  job.skills.forEach(([id]) => {
    const skill = skillById.get(id);
    if (owned.has(id)) matched.push(skill.name);
    else missing.push(skill.name);
  });
  const percent = required.length
    ? Math.round((matched.length / required.length) * 100)
    : 0;
  return {
    match_percent: percent,
    matched_skills: matched,
    missing_skills: missing,
    required_count: required.length,
    matched_count: matched.length
  };
}

function applicantCount(jobId) {
  return applications.filter((a) => a.job_id === jobId).length;
}

function appliedTo(studentId, jobId) {
  return applications.some((a) => a.student_id === studentId && a.job_id === jobId);
}

function jobListItem(job, studentId) {
  const company = companyById.get(job.company_id);
  const match = studentId ? matchFor(studentId, job) : null;
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    package_lpa: job.package_lpa,
    location: job.location,
    min_cgpa: job.min_cgpa,
    max_backlogs: job.max_backlogs,
    deadline: job.deadline,
    status: job.status,
    created_at: job.created_at,
    company_id: job.company_id,
    company_name: company ? company.name : null,
    company_website: company ? company.website : null,
    applicant_count: applicantCount(job.id),
    skills: jobSkillEntries(job).map((s) => s.name),
    match_percent: match ? match.match_percent : 0,
    matched_skills: match ? match.matched_skills : [],
    missing_skills: match ? match.missing_skills : [],
    applied: studentId ? appliedTo(studentId, job.id) : false
  };
}

function jobDetail(job, studentId) {
  const company = companyById.get(job.company_id);
  const skillList = jobSkillEntries(job);
  const owned = new Map(
    (studentSkills.get(studentId) || []).map((s) => [s.skill_id, s.proficiency])
  );
  const application = studentId
    ? applications.find((a) => a.student_id === studentId && a.job_id === job.id) || null
    : null;
  const match = studentId ? matchFor(studentId, job) : null;
  return {
    ...job,
    company_name: company ? company.name : null,
    company_description: company ? company.description : null,
    company_website: company ? company.website : null,
    applicant_count: applicantCount(job.id),
    skills: skillList.map((skill) => ({
      ...skill,
      has_skill: owned.has(skill.id),
      proficiency: owned.get(skill.id) || null
    })),
    match: match
      ? {
          match_percent: match.match_percent,
          matched_skills: match.matched_skills.join(', '),
          missing_skills: match.missing_skills.join(', ')
        }
      : null,
    application: application
      ? { id: application.id, status: application.status, applied_at: application.applied_at }
      : null
  };
}

function studentStats(studentId) {
  const studentApplications = applications.filter((a) => a.student_id === studentId);
  const latest = predictions
    .filter((p) => p.student_id === studentId)
    .sort((a, b) => new Date(b.predicted_at) - new Date(a.predicted_at))[0];
  return {
    total_applications: studentApplications.length,
    selected_count: studentApplications.filter((a) => a.status === 'selected').length,
    skill_count: (studentSkills.get(studentId) || []).length,
    eligible_jobs: jobs.filter((job) => isEligible(studentById.get(studentId), job)).length,
    placement_probability: latest ? latest.probability : null
  };
}

function statusCounts(studentId) {
  const counts = {};
  applications
    .filter((a) => a.student_id === studentId)
    .forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

function recommendationsFor(studentId) {
  return jobs
    .filter((job) => job.status === 'active' && isEligible(studentById.get(studentId), job))
    .map((job) => {
      const match = matchFor(studentId, job);
      const company = companyById.get(job.company_id);
      return {
        id: job.id,
        title: job.title,
        company_id: job.company_id,
        company_name: company ? company.name : null,
        package_lpa: job.package_lpa,
        location: job.location,
        min_cgpa: job.min_cgpa,
        max_backlogs: job.max_backlogs,
        deadline: job.deadline,
        status: job.status,
        match_percent: match ? match.match_percent : 0,
        required_count: match ? match.required_count : job.skills.length,
        matched_count: match ? match.matched_count : 0,
        matched_skills: match ? match.matched_skills : [],
        missing_skills: match ? match.missing_skills : [],
        applied: appliedTo(studentId, job.id)
      };
    })
    .sort(
      (a, b) =>
        b.match_percent - a.match_percent || Number(b.package_lpa) - Number(a.package_lpa)
    );
}

function adminSummary() {
  const placed = students.filter((s) => Number(s.is_placed) === 1).length;
  const packages = jobs.map((j) => Number(j.package_lpa)).filter((n) => !Number.isNaN(n));
  const totalApplications = applications.length;
  const selected = applications.filter((a) => a.status === 'selected').length;

  const totals = {
    total_students: students.length,
    placed_students: placed,
    total_jobs: jobs.length,
    active_jobs: jobs.filter((j) => j.status === 'active').length,
    total_applications: totalApplications,
    selected_applications: selected,
    total_companies: companies.length,
    avg_package: packages.length
      ? Number((packages.reduce((sum, n) => sum + n, 0) / packages.length).toFixed(2))
      : null,
    max_package: packages.length ? Math.max(...packages) : null,
    min_package: packages.length ? Math.min(...packages) : null,
    placement_rate: students.length
      ? Number(((placed / students.length) * 100).toFixed(2))
      : 0
  };

  const branchStats = [...new Set(students.map((s) => s.branch))]
    .sort()
    .map((branch) => {
      const inBranch = students.filter((s) => s.branch === branch);
      const branchPlaced = inBranch.filter((s) => Number(s.is_placed) === 1).length;
      return {
        branch,
        total_students: inBranch.length,
        placed_count: branchPlaced,
        placement_rate: inBranch.length
          ? Number(((branchPlaced / inBranch.length) * 100).toFixed(2))
          : 0
      };
    });

  const topSkills = skills
    .map((skill) => ({
      name: skill.name,
      category: skill.category,
      jobs_count: jobs.filter((job) => job.skills.some(([id]) => id === skill.id)).length,
      students_count: [...studentSkills.values()].filter((list) =>
        list.some((entry) => entry.skill_id === skill.id)
      ).length
    }))
    .sort((a, b) => b.jobs_count - a.jobs_count || b.students_count - a.students_count)
    .slice(0, 10);

  const statusDistribution = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected']
    .map((status) => ({
      status,
      count: applications.filter((a) => a.status === status).length
    }))
    .filter((entry) => entry.count > 0);

  const monthlyMap = {};
  applications.forEach((a) => {
    const month = String(a.applied_at).slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });
  const monthlyApplications = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, applications: count }));

  const topCompanies = companies
    .map((company) => {
      const companyJobs = jobs.filter((j) => j.company_id === company.id);
      const companyApplications = applications.filter((a) =>
        companyJobs.some((j) => j.id === a.job_id)
      );
      return {
        name: company.name,
        applications: companyApplications.length,
        applicants: new Set(companyApplications.map((a) => a.student_id)).size
      };
    })
    .sort((a, b) => b.applications - a.applications || b.applicants - a.applicants)
    .slice(0, 8);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
    .slice(0, 10)
    .map((a) => {
      const student = studentWithUser(studentById.get(a.student_id));
      const job = jobById.get(a.job_id);
      const company = job ? companyById.get(job.company_id) : null;
      return {
        id: a.id,
        status: a.status,
        applied_at: a.applied_at,
        first_name: student ? student.first_name : '',
        last_name: student ? student.last_name : '',
        branch: student ? student.branch : '',
        title: job ? job.title : '',
        company_name: company ? company.name : null
      };
    });

  return {
    role: 'admin',
    totals,
    branchStats,
    topSkills,
    statusDistribution,
    monthlyApplications,
    topCompanies,
    recentApplications
  };
}

module.exports = {
  now,
  skills,
  categories,
  companies,
  jobs,
  students,
  users,
  applications,
  predictions,
  skillById,
  studentById,
  userById,
  jobById,
  companyById,
  studentSkills,
  nextId,
  studentWithUser,
  publicUser,
  skillsFor,
  isEligible,
  matchFor,
  applicantCount,
  appliedTo,
  jobListItem,
  jobDetail,
  studentStats,
  statusCounts,
  recommendationsFor,
  adminSummary
};
