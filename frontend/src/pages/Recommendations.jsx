import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  XCircle
} from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import MatchBar from '../components/MatchBar';
import PageLoader from '../components/PageLoader';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Recommendations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [minMatch, setMinMatch] = useState(0);
  const [applyingId, setApplyingId] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await api.get('/recommendations/me');
      setItems(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => items.filter((job) => Number(job.match_percent) >= minMatch),
    [items, minMatch]
  );

  const apply = async (job) => {
    setApplyingId(job.id);
    setError('');
    setMessage('');
    try {
      const data = await api.post('/applications', { job_id: job.id });
      setItems((current) =>
        current.map((item) => (item.id === job.id ? { ...item, applied: true } : item))
      );
      setMessage(data.message || `Applied to ${job.title}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <PageLoader label="Scoring jobs against your skills..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Recommended for you
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Active jobs you are eligible for, ranked by skill overlap.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-auto"
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
          >
            <option value={0}>Any match</option>
            <option value={40}>40%+ match</option>
            <option value={60}>60%+ match</option>
            <option value={80}>80%+ match</option>
          </select>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {message ? <Alert type="success" onClose={() => setMessage('')}>{message}</Alert> : null}
      {error ? <Alert type="error" onClose={() => setError('')}>{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recommendations</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{items.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average match</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {items.length
              ? `${(items.reduce((sum, item) => sum + Number(item.match_percent || 0), 0) / items.length).toFixed(0)}%`
              : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best match</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {items.length ? `${Math.max(...items.map((item) => Number(item.match_percent || 0))).toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>

      {filtered.length ? (
        <div className="space-y-4">
          {filtered.map((job, index) => (
            <div key={job.id} className="card overflow-hidden">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <span className="text-[10px] font-semibold uppercase leading-none">Rank</span>
                    <span className="text-base font-extrabold leading-tight">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      <span className="badge bg-emerald-100 text-emerald-700">
                        <Target size={12} /> {Number(job.match_percent).toFixed(0)}% match
                      </span>
                      {job.applied ? (
                        <span className="badge bg-indigo-100 text-indigo-700">Applied</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{job.company_name}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {job.location || '—'}
                      </span>
                      <span className="font-semibold text-slate-700">
                        ₹{Number(job.package_lpa).toFixed(1)} LPA
                      </span>
                      <span>Deadline {formatDate(job.deadline)}</span>
                      <span>Min CGPA {Number(job.min_cgpa).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-64">
                  <MatchBar value={job.match_percent} />
                  <div className="flex gap-2">
                    <Link to={`/jobs/${job.id}`} className="btn-secondary flex-1 px-3 py-2 text-xs">
                      Details
                    </Link>
                    <button
                      type="button"
                      className="btn-primary flex-1 px-3 py-2 text-xs"
                      onClick={() => apply(job)}
                      disabled={job.applied || applyingId === job.id}
                    >
                      <Send size={14} />
                      {job.applied ? 'Applied' : applyingId === job.id ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-4 md:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                    <CheckCircle2 size={13} /> Matched skills ({job.matched_skills?.length || 0})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.matched_skills?.length ? (
                      job.matched_skills.map((skill) => (
                        <span key={skill} className="badge bg-emerald-100 text-emerald-700">{skill}</span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No overlap yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-rose-500">
                    <XCircle size={13} /> Skills to learn ({job.missing_skills?.length || 0})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.missing_skills?.length ? (
                      job.missing_skills.map((skill) => (
                        <span key={skill} className="badge bg-rose-50 text-rose-600">{skill}</span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">You match every required skill 🎉</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length ? (
        <EmptyState
          title="No jobs match this filter"
          description="Lower the minimum match percentage to see more recommendations."
          action={
            <button type="button" className="btn-secondary" onClick={() => setMinMatch(0)}>
              Show all matches
            </button>
          }
        />
      ) : (
        <EmptyState
          title="No recommendations yet"
          description="Add skills to your profile and make sure there are active jobs matching your CGPA and backlog criteria."
          action={
            <div className="flex gap-2">
              <Link to="/profile" className="btn-primary">
                <Sparkles size={16} /> Add skills
              </Link>
              <Link to="/jobs" className="btn-secondary">Browse jobs</Link>
            </div>
          }
        />
      )}
    </div>
  );
}
