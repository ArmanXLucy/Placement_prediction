import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import PageLoader from '../components/PageLoader';
import StatCard from '../components/StatCard';

const STATUS_COLORS = {
  applied: '#0ea5e9',
  shortlisted: '#8b5cf6',
  interviewed: '#f59e0b',
  selected: '#10b981',
  rejected: '#f43f5e'
};

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

function StudentDashboard({ data }) {
  const { student, stats = {}, statusCounts = [], latestPrediction, recentApplications = [] } = data;
  const probability = latestPrediction?.probability ?? stats.placement_probability;
  const totalApplications = Number(stats.total_applications || 0);
  const selected = Number(stats.selected_count || 0);

  const statusData = statusCounts.map((item) => ({
    name: item.status,
    value: Number(item.count)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {student.first_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {student.branch} · CGPA {Number(student.cgpa).toFixed(2)} · Graduating {student.graduation_year || '—'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/recommendations" className="btn-primary">
            <Sparkles size={16} /> View recommendations
          </Link>
          <Link to="/prediction" className="btn-secondary">
            <Brain size={16} /> Prediction
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Placement probability"
          value={probability !== null && probability !== undefined ? `${Number(probability).toFixed(1)}%` : 'Not run'}
          hint={probability !== null && probability !== undefined ? 'From the latest prediction' : 'Run your first prediction'}
          tone="indigo"
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={totalApplications}
          hint={`${selected} selected`}
          tone="sky"
        />
        <StatCard
          icon={Sparkles}
          label="Skills on profile"
          value={Number(stats.skill_count || 0)}
          hint="Used for job matching"
          tone="violet"
        />
        <StatCard
          icon={Target}
          label="Eligible jobs"
          value={Number(stats.eligible_jobs || 0)}
          hint="Based on CGPA & backlogs"
          tone="emerald"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Profile strength</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Academic and experience factors the model considers.
              </p>
            </div>
            <Link to="/profile" className="text-xs font-semibold text-indigo-600 hover:underline">
              Edit profile
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'CGPA', value: Number(student.cgpa).toFixed(2), max: 10 },
              { label: 'Backlogs', value: student.backlogs, max: 5, invert: true },
              { label: 'Projects', value: student.projects_count, max: 6 },
              { label: 'Internships', value: student.internships_count, max: 3 },
              { label: 'Certifications', value: student.certifications_count, max: 6 }
            ].map((item) => {
              const ratio = item.invert
                ? Math.max(0, 1 - Number(item.value || 0) / item.max)
                : Math.min(1, Number(item.value || 0) / item.max);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.invert ? 'bg-rose-400' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-900">
              {probability !== null && probability !== undefined
                ? `Your current placement probability is ${Number(probability).toFixed(1)}%.`
                : 'You have not run a prediction yet.'}
            </p>
            <p className="mt-1 text-xs text-indigo-700">
              {probability !== null && probability !== undefined
                ? 'Keep applying to recommended roles and improve the weakest factors below.'
                : 'Run the model to see your probability, strongest factors and personalised advice.'}
            </p>
            <Link to="/prediction" className="btn-primary mt-3 px-3 py-2 text-xs">
              {probability !== null && probability !== undefined ? 'Refresh prediction' : 'Run prediction'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-800">Application pipeline</h3>
          <p className="mt-0.5 text-xs text-slate-500">Where your applications stand.</p>
          {statusData.length ? (
            <>
              <div className="mt-3 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 capitalize text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUS_COLORS[item.name] || '#94a3b8' }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              No applications yet.{' '}
              <Link to="/jobs" className="font-semibold text-indigo-600 hover:underline">
                Browse jobs
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-800">Recent applications</h3>
          <Link to="/applications" className="text-xs font-semibold text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {recentApplications.length ? (
          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Briefcase size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{app.title}</p>
                    <p className="text-xs text-slate-500">
                      {app.company_name} · ₹{Number(app.package_lpa).toFixed(1)} LPA
                    </p>
                  </div>
                </div>
                <Badge value={app.status} className="capitalize" />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            You have not applied to any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  const {
    totals = {},
    branchStats = [],
    topSkills = [],
    statusDistribution = [],
    monthlyApplications = [],
    topCompanies = [],
    recentApplications = []
  } = data;

  const branchData = branchStats.map((b) => ({
    branch: b.branch || 'Unknown',
    'Placement rate': Number(b.placement_rate || 0),
    Placed: Number(b.placed_count || 0),
    Total: Number(b.total_students || 0)
  }));

  const statusData = statusDistribution.map((s) => ({
    name: s.status,
    value: Number(s.count)
  }));

  const skillData = topSkills.map((s) => ({
    name: s.name,
    Jobs: Number(s.jobs_count || 0),
    Students: Number(s.students_count || 0)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Placement cell dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live statistics from the placement database.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total students"
          value={Number(totals.total_students || 0)}
          hint={`${Number(totals.placed_students || 0)} placed`}
          tone="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="Placement rate"
          value={`${Number(totals.placement_rate || 0).toFixed(1)}%`}
          hint="Across all branches"
          tone="emerald"
        />
        <StatCard
          icon={Briefcase}
          label="Active jobs"
          value={Number(totals.active_jobs || 0)}
          hint={`${Number(totals.total_jobs || 0)} total jobs`}
          tone="sky"
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={Number(totals.total_applications || 0)}
          hint={`${Number(totals.selected_applications || 0)} selections`}
          tone="violet"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Companies" value={Number(totals.total_companies || 0)} tone="amber" />
        <StatCard
          icon={Award}
          label="Average package"
          value={totals.avg_package ? `₹${Number(totals.avg_package).toFixed(1)} LPA` : '—'}
          hint={totals.max_package ? `Highest ₹${Number(totals.max_package).toFixed(1)} LPA` : ''}
          tone="rose"
        />
        <StatCard
          icon={GraduationCap}
          label="Branch count"
          value={branchStats.length}
          hint="Branches with student data"
          tone="indigo"
        />
        <StatCard
          icon={Target}
          label="Selection ratio"
          value={
            Number(totals.total_applications)
              ? `${((Number(totals.selected_applications) / Number(totals.total_applications)) * 100).toFixed(1)}%`
              : '—'
          }
          hint="Selected / applications"
          tone="emerald"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Branch-wise placement rate" subtitle="Percentage of students placed per branch">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="branch" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
              <Tooltip />
              <Bar dataKey="Placement rate" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Application status split" subtitle="Distribution of every application">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={85} label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly applications" subtitle="Most recent six months">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyApplications} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most in-demand skills" subtitle="Jobs requiring each skill">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 28, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                type="category"
                dataKey="name"
                width={92}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <Tooltip />
              <Bar dataKey="Jobs" fill="#8b5cf6" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-800">Recent applications</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {app.first_name} {app.last_name}
                    <span className="font-normal text-slate-400"> · {app.branch}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {app.title} at {app.company_name || 'Company'}
                  </p>
                </div>
                <Badge value={app.status} className="capitalize" />
              </div>
            ))}
            {!recentApplications.length ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No applications yet.</p>
            ) : null}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-800">Top companies by applications</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {topCompanies.map((company, index) => (
              <div key={company.name} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{company.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{company.applications}</p>
                  <p className="text-[11px] text-slate-500">{company.applicants} applicants</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/analytics/dashboard')
      .then((response) => {
        if (mounted) setData(response.data);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <Alert type="error">
          {error}
          <p className="mt-2 text-xs">
            Check that the API is reachable and the database has been set up and seeded.
          </p>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return user?.role === 'admin' ? <AdminDashboard data={data} /> : <StudentDashboard data={data} />;
}
