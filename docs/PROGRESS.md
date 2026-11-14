# Project Progress

## Status: COMPLETE — full stack running end-to-end

### Database (`database/`)
- [x] `schema.sql` — 13 normalized tables with PK/FK, CHECK constraints, unique keys and indexes
- [x] `views.sql` — `v_eligible_jobs`, `v_job_match`, `v_placement_stats`
- [x] `triggers.sql` — eligibility validation + placement/audit synchronization
- [x] `procedures.sql` — `sp_recommend_jobs`, `sp_student_stats`
- [x] `queries.sql` — 15 analytical queries
- [x] Re-runnable setup through `backend/scripts/init-db.js`
- [x] Verified: schema, views, triggers and procedures all apply cleanly on MySQL 8.0.40

### Backend (`backend/src/`)
- [x] MySQL connection pool with `dotenv`
- [x] JWT authentication + bcrypt password hashing
- [x] Role-based access control (`student`, `admin`)
- [x] Models: User, Student, Job, Application, Recommendation, Prediction, Skill, Company
- [x] Controllers + routes for auth, students, jobs, applications, recommendations,
      predictions, analytics and catalog data
- [x] Input validation with `express-validator`
- [x] Central error handler with MySQL error mapping
- [x] Serves the built React app in production
- [x] Verified: health, login, profiles, jobs, applications, analytics, recommendations
      procedure, views and model predictions

### ML (`backend/src/ml/`)
- [x] Logistic regression implemented from scratch
- [x] Standardisation, L2 regularization, 80/20 split, metrics
- [x] Training script (`npm run train`) saves `model.json`
- [x] Prediction endpoint with factor contributions and advice
- [x] Auto-trains if the model file is missing

### Seed data (`backend/scripts/seed.js`)
- [x] 141 students (including demo student), 50 skills, 20 companies, 32 jobs
- [x] 401 placement-history records for training
- [x] ~400 applications spread across five months
- [x] Demo accounts:
      `student@demo.com / Student@123`
      `admin@demo.com / Admin@123`
- [x] Single-connection, advisory-locked, re-runnable seed

### Frontend (`frontend/src/`)
- [x] Vite + React 19 + Tailwind CSS
- [x] Auth context, Axios JWT interceptor, protected routes
- [x] Responsive sidebar layout
- [x] Home, Login, Register, Dashboard, Profile, Jobs, Job Detail,
      Recommendations, Prediction, Applications, 404
- [x] Recharts analytics for student and admin dashboards
- [x] Production build verified with `npm run build`

### Developer experience
- [x] Root scripts: `install:all`, `db:start`, `db:stop`, `db:setup`, `seed`, `train`,
      `setup`, `backend`, `frontend`, `build`
- [x] Bundled MySQL start/stop helpers
- [x] README with setup, architecture, API and troubleshooting
