# PlacementIQ — AI-Based Placement Prediction & Job Recommendation System

A full-stack DBMS course project that predicts a student's placement probability and
recommends jobs ranked by real skill overlap. Built with **MySQL 8**, **Node.js/Express**,
**React (Vite)** and a from-scratch **logistic regression** model.

![stack](https://img.shields.io/badge/MySQL-8-4479A1) ![stack](https://img.shields.io/badge/Node.js-22-339933) ![stack](https://img.shields.io/badge/React-19-61DAFB) ![stack](https://img.shields.io/badge/Express-5-000000)

---

## Features

### Student
- JWT login / registration with a student profile
- Editable academic profile (CGPA, backlogs, projects, internships, certifications)
- Skill management with proficiency levels (1–5)
- Browse active jobs with search, location, package and status filters
- **Skill-match score** for every eligible job
- Personalised recommendations (stored procedure `sp_recommend_jobs`)
- **Placement probability** from a trained logistic regression model, with factor
  contributions and personalised advice
- Apply to jobs, track application status and withdraw pending applications
- Prediction history chart

### Admin
- Placement-cell dashboard: totals, placement rate, average package
- Branch-wise placement charts, application status split, monthly trend
- Most in-demand skills and top companies by applications
- Browse every job and applicant count
- Review applications and update statuses
  (`applied → shortlisted → interviewed → selected/rejected`)
- Selecting a student automatically marks them placed via a database trigger

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Database | MySQL 8 (`schema.sql`, `views.sql`, `triggers.sql`, `procedures.sql`) |
| Backend | Node.js, Express 5, `mysql2`, JWT, bcrypt, express-validator |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 3, Recharts, Axios, Lucide |
| ML | Plain JavaScript logistic regression (standardised features, gradient descent) |

---

## Quick start

### Prerequisites
- Node.js 20+ (tested on Node 22)
- MySQL 8 — either the bundled copy in `.tools/mysql` or your own installation

### 1. Install dependencies
This is an npm workspaces monorepo, so one install covers the API and the web app:
```bash
npm install
```

### 2. Start MySQL
If you are using the MySQL bundled in this project:
```bash
npm run db:start
```
This starts `mysqld` on port **3306** and writes logs to `.tools/mysqld.log`.

If you use your own MySQL server, start it normally and configure
`backend/.env` (see below).

### 3. Configure environment
Copy `backend/.env.example` to `backend/.env` if it does not exist:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=placement_db
DB_SSL=false          # set true for hosted MySQL that requires TLS
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

### 4. Create the database, seed data and train the model
```bash
npm run setup
```
This runs, in order:
1. `db:setup` — creates `placement_db`, all tables, views, triggers, procedures and indexes
2. `seed` — 141 students, 50 skills, 20 companies, 32 jobs, ~400 applications and 401 training records
3. `train` — trains the logistic regression model and saves `backend/src/ml/model.json`

### 5. Run the app
Terminal 1 — backend API on **http://localhost:5000**:
```bash
npm run backend
```

Terminal 2 — frontend dev server on **http://localhost:5173**:
```bash
npm run frontend
```

Open **http://localhost:5173**.

### Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Student | `student@demo.com` | `Student@123` |
| Admin | `admin@demo.com` | `Admin@123` |

> Seeded students (other than the demo account) all use `Password@123`.

---

## Available scripts

From the project root:

| Command | What it does |
|---------|--------------|
| `npm run install:all` | Install backend and frontend dependencies (alias for `npm install`) |
| `npm run db:start` | Start the bundled MySQL server |
| `npm run db:stop` | Gracefully stop MySQL |
| `npm run db:setup` | Apply schema/views/triggers/procedures (resets the database) |
| `npm run seed` | Populate demo data and training history |
| `npm run train` | Retrain the ML model |
| `npm run setup` | `db:setup` + `seed` + `train` |
| `npm run backend` | Start the API server |
| `npm run frontend` | Start the Vite dev server |
| `npm run build` | Build the production frontend into `frontend/dist` |

From `backend/` you can also use `npm run dev` (nodemon) and `npm start`.

---

## Production build

```bash
npm run build     # builds frontend/dist
npm run backend   # Express serves the built SPA and the API on :5000
```
Open **http://localhost:5000**.

---

## Deploying to Vercel

The repository is already shaped for Vercel: `api/index.js` exports the Express app
as a serverless function, Vercel builds `frontend/dist` as the static site, and
`vercel.json` routes `/api/*` to the function and everything else to the SPA.

### 1. Create a hosted MySQL database
Vercel functions are stateless, so the local MySQL in `.tools/mysql` cannot be used.
Create a hosted MySQL 8 database (Aiven, TiDB Cloud, Railway, Clever Cloud, …) and
import the schema from `database/`:

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < database/schema.sql
mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < database/views.sql
mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < database/triggers.sql
mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < database/procedures.sql
```

Seed data and the trained model (`backend/src/ml/model.json`) are already in the repo.
To seed a completely empty database you can point `backend/.env` at the hosted
database and run `npm run seed` locally. If your provider requires TLS, add `DB_SSL=true`.

### 2. Import the repo into Vercel
1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel choose **Add New → Project → Import** the repository.
3. Keep the **Root Directory** as the repository root. Do **not** change the
   framework preset — `vercel.json` sets the build command, output directory and routing.
4. Add the environment variables below for Production (and Preview if wanted):

| Variable | Value |
|----------|-------|
| `DB_HOST` | hosted MySQL host |
| `DB_PORT` | hosted MySQL port (often `3306` or `25060`) |
| `DB_USER` | database user |
| `DB_PASSWORD` | database password |
| `DB_NAME` | database name |
| `DB_SSL` | `true` when the provider requires TLS |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRES_IN` | `7d` (optional) |

5. Click **Deploy**. `vercel.json` runs `npm install` and `npm run build`, then deploys:
   - `/` and client routes → `frontend/dist` (React SPA)
   - `/api/*` → `api/index.js` (Express serverless function)

Open `https://<project>.vercel.app/api/health` to confirm the API can reach MySQL.

### Deploying with the Vercel CLI (optional)
```bash
npm i -g vercel
vercel            # first run links the project and creates a preview
vercel --prod     # production deployment
```

> Note: the serverless function keeps a small MySQL pool (3 connections by default;
> override with `DB_POOL_SIZE`). Use a provider that allows connections from Vercel's
> dynamic IPs, or enable its "allow public access" option.

---

## Project structure

```
DBMS Project/
├── api/
│   └── index.js            # Vercel serverless entry point (exports the Express app)
├── vercel.json             # build, routing and function config for Vercel
├── database/
│   ├── schema.sql          # tables, constraints, indexes
│   ├── views.sql           # v_eligible_jobs, v_job_match, v_placement_stats
│   ├── triggers.sql        # application eligibility + placement/audit sync
│   └── procedures.sql      # sp_recommend_jobs, sp_student_stats
├── backend/
│   ├── scripts/
│   │   ├── init-db.js      # applies all SQL files (handles DELIMITER blocks)
│   │   └── seed.js         # realistic seed data + ML training history
│   ├── src/
│   │   ├── config/         # MySQL pool
│   │   ├── controllers/    # auth, students, jobs, applications, predictions...
│   │   ├── middleware/     # JWT auth, validation, error handling
│   │   ├── ml/             # logistic regression + train script + model.json
│   │   ├── models/         # SQL data-access layer
│   │   ├── routes/         # REST routes
│   │   └── server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── api/            # Axios client with JWT interceptor
│       ├── components/     # layout, cards, badges, charts helpers
│       ├── context/        # AuthContext
│       └── pages/          # Home, Login, Register, Dashboard, Jobs, ...
├── docs/PROGRESS.md
├── setup.js
└── README.md
```

---

## Database design highlights

**Tables:** `users`, `students`, `skills`, `student_skills`, `companies`, `jobs`,
`job_skills`, `applications`, `application_log`, `placement_history`, `predictions`,
`recommendations`.

- Normalised **M:N** relationships: `student_skills` (with proficiency) and
  `job_skills` (with mandatory flag)
- `UNIQUE(student_id, job_id)` on applications prevents duplicate applications
- `CHECK` constraints on CGPA, backlogs and proficiency
- `ON DELETE CASCADE` / `SET NULL` rules keep dependent data consistent
- Secondary indexes on CGPA, branch, placement status, job status and application status

**Views**
- `v_eligible_jobs` — every student/job pair satisfying CGPA and backlog rules
- `v_job_match` — matched/missing skills and match percentage per eligible pair
- `v_placement_stats` — branch-wise placement rate, average CGPA and package

**Triggers**
- `trg_before_application_insert` rejects applications below the job's CGPA or above
  its backlog limit using `SIGNAL SQLSTATE '45000'`
- `trg_after_application_selected` marks the student placed, records placement history
  and writes an audit row to `application_log`

**Stored procedures**
- `sp_recommend_jobs(student_id)` — ranked recommendations with matched/missing skills
- `sp_student_stats(student_id)` — dashboard aggregates in one call

A full set of analytical queries is in `database/queries.sql`.

---

## REST API

All endpoints are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| GET | `/health` | public | DB health check |
| POST | `/auth/register` | public | Create student account |
| POST | `/auth/login` | public | JWT login |
| GET | `/auth/me` | auth | Current user |
| GET/PUT | `/students/me` | student | Profile |
| PUT | `/students/me/skills` | student | Replace skill set |
| GET | `/students` | admin | List students |
| GET | `/jobs` | optional auth | Filtered job list + match scores |
| GET | `/jobs/:id` | optional auth | Job detail + eligibility/skills |
| POST/PUT/DELETE | `/jobs` / `/jobs/:id` | admin | Manage jobs |
| GET | `/jobs/companies` | optional auth | Company list |
| GET | `/skills` | public | Skill catalog |
| GET | `/applications` | auth | Own (student) or all (admin) |
| POST | `/applications` | student | Apply to a job |
| PATCH | `/applications/:id/status` | admin | Update status |
| DELETE | `/applications/:id` | student | Withdraw pending application |
| GET | `/recommendations/me` | student | Refresh + return ranked jobs |
| POST/GET | `/predictions/me` | student | Run / fetch predictions |
| GET | `/analytics/dashboard` | auth | Role-specific dashboard data |

---

## ML model

`backend/src/ml/logisticRegression.js` implements training from scratch:

- Features: `cgpa`, `skills_count`, `projects_count`, `internships_count`,
  `certifications_count`, `backlogs`
- Standardisation using training means/std deviations
- Full-batch gradient descent with L2 regularisation
- Deterministic 80/20 train/test split
- Metrics: accuracy, precision, recall, F1, AUC and a confusion matrix

With the seeded data the model reaches roughly **95% test accuracy / 0.99 AUC**.
The prediction response includes the probability, risk level, per-feature contribution
and personalised advice.

To retrain after changing the data:
```bash
npm run train
```

---

## Troubleshooting

**`ECONNREFUSED` / database is not reachable**
- Start MySQL: `npm run db:start` (or start your own server)
- Check `backend/.env` credentials

**Frontend shows 404 / blank page**
- Make sure the backend is running on port 5000
- In dev, Vite proxies `/api` to `http://localhost:5000`

**Model file missing**
- Run `npm run train`, or simply call the prediction endpoint — it auto-trains
  from `placement_history` if `model.json` is absent

**Port already in use**
- Change `PORT` in `backend/.env` for the API
- Vite uses 5173; stop the conflicting process or run `npm run frontend -- --port 5174`

**Reset everything**
```bash
npm run db:setup
npm run seed
npm run train
```
