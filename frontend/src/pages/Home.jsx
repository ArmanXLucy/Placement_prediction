import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI placement prediction',
    text: 'A logistic regression model trained on historical placement data estimates your probability of getting placed.'
  },
  {
    icon: Sparkles,
    title: 'Skill-based job matching',
    text: 'Every eligible job is scored against your skills, so you see the roles where you have the strongest fit first.'
  },
  {
    icon: BarChart3,
    title: 'Placement analytics',
    text: 'Branch-wise placement rates, in-demand skills, application trends and package statistics in one dashboard.'
  }
];

const STEPS = [
  { number: '01', title: 'Build your profile', text: 'Add your CGPA, projects, internships and technical skills.' },
  { number: '02', title: 'Get matched', text: 'See eligible jobs ranked by skill match and expected package.' },
  { number: '03', title: 'Predict & apply', text: 'Check your placement probability, then apply with one click.' }
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950">
      <div className="relative">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">PlacementIQ</span>
          </div>
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-slate-900 hover:bg-slate-100"
              >
                Go to dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn text-slate-200 hover:bg-white/10">
                  Log in
                </Link>
                <Link to="/register" className="btn bg-white text-slate-900 hover:bg-slate-100">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </header>

        <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-16">
          <div>
            <span className="badge border border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
              <Sparkles size={13} /> DBMS + ML course project
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Predict your placement.
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                Find the right job.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              PlacementIQ combines your academic profile, projects and skills with a
              trained machine-learning model to estimate placement chances and
              recommend the jobs where you match best.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn bg-indigo-500 px-5 py-3 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
              >
                {isAuthenticated ? 'Open dashboard' : 'Create free account'} <ArrowRight size={17} />
              </Link>
              <Link
                to="/login"
                className="btn border border-white/20 px-5 py-3 text-slate-100 hover:bg-white/10"
              >
                Try demo account
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {['JWT authentication', 'MySQL 8 database', 'Live recommendations'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 to-violet-500/10 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Placement probability
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-slate-900">78%</p>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700">High chance</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Top recommendation
                </p>
                {[
                  { role: 'Software Engineer', company: 'Google', match: 86 },
                  { role: 'Full Stack Developer', company: 'Stripe', match: 74 },
                  { role: 'Backend Developer', company: 'Atlassian', match: 68 }
                ].map((job) => (
                  <div
                    key={job.role}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Briefcase size={17} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{job.role}</p>
                        <p className="text-xs text-slate-500">{job.company}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
                      <Target size={14} /> {job.match}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Features</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Everything a placement cell needs
            </h2>
            <p className="mt-3 text-slate-600">
              Built on a normalized MySQL schema with stored procedures, triggers,
              views and indexes — then wrapped in a modern React dashboard.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                From profile to offer, in three steps
              </h2>
              <div className="mt-8 space-y-5">
                {STEPS.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-7">
              <h3 className="text-lg font-bold text-slate-900">Demo credentials</h3>
              <p className="mt-1 text-sm text-slate-600">
                The seed script creates two accounts you can use right away.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Student
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-800">student@demo.com</p>
                  <p className="font-mono text-sm text-slate-500">Student@123</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Admin
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-800">admin@demo.com</p>
                  <p className="font-mono text-sm text-slate-500">Admin@123</p>
                </div>
              </div>
              <Link to="/login" className="btn-primary mt-5 w-full">
                Log in to explore <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>PlacementIQ · AI-Based Placement Prediction & Job Recommendation System</p>
          <p>MySQL 8 · Express · React · Node.js</p>
        </div>
      </footer>
    </div>
  );
}
