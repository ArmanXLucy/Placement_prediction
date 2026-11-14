import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarClock, Search, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import PageLoader from '../components/PageLoader';

const STATUSES = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/applications')
      .then((data) => {
        if (mounted) setApps(data.applications || []);
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

  const counts = useMemo(() => {
    const result = Object.fromEntries(STATUSES.map((status) => [status, 0]));
    apps.forEach((app) => {
      result[app.status] = (result[app.status] || 0) + 1;
    });
    return result;
  }, [apps]);

  const withdraw = async (app) => {
    if (!window.confirm(`Withdraw your application for ${app.title}?`)) return;
    setWithdrawing(app.id);
    setError('');
    setMessage('');
    try {
      await api.delete(`/applications/${app.id}`);
      setApps((current) => current.filter((item) => item.id !== app.id));
      setMessage('Application withdrawn.');
    } catch (err) {
      setError(err.message);
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading) return <PageLoader label="Loading your applications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track every application and its current stage.
          </p>
        </div>
        <Link to="/jobs" className="btn-primary shrink-0">
          <Briefcase size={16} /> Find more jobs
        </Link>
      </div>

      {message ? <Alert type="success" onClose={() => setMessage('')}>{message}</Alert> : null}
      {error ? <Alert type="error" onClose={() => setError('')}>{error}</Alert> : null}

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {STATUSES.map((status) => (
          <div key={status} className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{status}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{counts[status] || 0}</p>
          </div>
        ))}
      </div>

      {apps.length ? (
        <div className="table-wrap">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Job</th>
                <th className="th">Company</th>
                <th className="th">Package</th>
                <th className="th">Applied</th>
                <th className="th">Status</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70">
                  <td className="td">
                    <Link to={`/jobs/${app.job_id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                      {app.title}
                    </Link>
                    <p className="text-xs text-slate-400">{app.location}</p>
                  </td>
                  <td className="td">{app.company_name || '—'}</td>
                  <td className="td font-semibold">₹{Number(app.package_lpa).toFixed(1)} LPA</td>
                  <td className="td">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarClock size={13} /> {formatDate(app.applied_at)}
                    </span>
                  </td>
                  <td className="td">
                    <Badge value={app.status} className="capitalize" />
                  </td>
                  <td className="td text-right">
                    {app.status === 'applied' ? (
                      <button
                        type="button"
                        className="btn-danger px-2.5 py-1.5 text-xs"
                        onClick={() => withdraw(app)}
                        disabled={withdrawing === app.id}
                      >
                        <Trash2 size={13} />
                        {withdrawing === app.id ? '...' : 'Withdraw'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Browse recommended jobs and submit your first application."
          action={<Link to="/recommendations" className="btn-primary">View recommendations</Link>}
        />
      )}
    </div>
  );
}

function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/applications', { params: { status, search } })
      .then((data) => {
        if (mounted) setApps(data.applications || []);
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
  }, [status, search]);

  const changeStatus = async (app, nextStatus) => {
    setUpdating(app.id);
    setError('');
    setMessage('');
    try {
      const data = await api.patch(`/applications/${app.id}/status`, { status: nextStatus });
      setApps((current) =>
        current.map((item) =>
          item.id === app.id ? { ...item, status: data.application.status } : item
        )
      );
      setMessage(
        `${app.first_name} ${app.last_name} · ${app.title} marked as ${nextStatus}.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and update application statuses. Selecting a student marks them as placed.
        </p>
      </div>

      {message ? <Alert type="success" onClose={() => setMessage('')}>{message}</Alert> : null}
      {error ? <Alert type="error" onClose={() => setError('')}>{error}</Alert> : null}

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search student, job or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchInput('');
              setStatus('');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading applications..." />
      ) : apps.length ? (
        <>
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{apps.length}</span> applications
          </p>
          <div className="table-wrap">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Job</th>
                  <th className="th">Company</th>
                  <th className="th">Package</th>
                  <th className="th">Applied</th>
                  <th className="th">Status</th>
                  <th className="th">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-semibold text-slate-800">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {app.branch} · CGPA {Number(app.cgpa).toFixed(2)}
                      </p>
                    </td>
                    <td className="td">
                      <Link to={`/jobs/${app.job_id}`} className="font-medium text-slate-700 hover:text-indigo-600">
                        {app.title}
                      </Link>
                      <p className="text-xs text-slate-400">{app.location}</p>
                    </td>
                    <td className="td">{app.company_name || '—'}</td>
                    <td className="td font-semibold">₹{Number(app.package_lpa).toFixed(1)} LPA</td>
                    <td className="td text-xs text-slate-500">{formatDate(app.applied_at)}</td>
                    <td className="td">
                      <Badge value={app.status} className="capitalize" />
                    </td>
                    <td className="td">
                      <select
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs capitalize"
                        value={app.status}
                        onChange={(e) => changeStatus(app, e.target.value)}
                        disabled={updating === app.id}
                      >
                        {STATUSES.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          title="No applications found"
          description="Try clearing the filters or search for a different student."
        />
      )}
    </div>
  );
}

export default function Applications() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminApplications /> : <StudentApplications />;
}
