import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import MatchBar from '../components/MatchBar';

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

function isEligible(student, job) {
  if (!student) return false;
  return (
    Number(student.cgpa) >= Number(job.min_cgpa) &&
    Number(student.backlogs) <= Number(job.max_backlogs)
  );
}

export default function Jobs() {
  const { user, isAdmin } = useAuth();
  const student = user?.student;
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPackage: '',
    status: 'active'
  });
  const [searchInput, setSearchInput] = useState('');
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput ? current : { ...current, search: searchInput }
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .get('/jobs', { params: filters })
      .then((data) => {
        if (!mounted) return;
        setJobs(data.jobs || []);
        setLocations(data.locations || []);
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
  }, [filters]);

  const activeFilterCount = useMemo(
    () =>
      ['search', 'location', 'minPackage', 'status'].filter((key) => {
        if (key === 'status') return filters.status !== 'active';
        return Boolean(filters[key]);
      }).length,
    [filters]
  );

  const setFilter = (field) => (event) =>
    setFilters((current) => ({ ...current, [field]: event.target.value }));

  const resetFilters = () => {
    setSearchInput('');
    setFilters({ search: '', location: '', minPackage: '', status: 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Browse jobs</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'All openings in the placement database.'
              : 'Active openings, ranked by how well your skills match.'}
          </p>
        </div>
        {!isAdmin ? (
          <Link to="/recommendations" className="btn-primary shrink-0">
            <Sparkles size={16} /> Smart recommendations
          </Link>
        ) : null}
      </div>

      <div className="card p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search role, company or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className="input pl-8" value={filters.location} onChange={setFilter('location')}>
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className="input pl-8" value={filters.minPackage} onChange={setFilter('minPackage')}>
              <option value="">Any package</option>
              <option value="5">₹5+ LPA</option>
              <option value="8">₹8+ LPA</option>
              <option value="12">₹12+ LPA</option>
              <option value="16">₹16+ LPA</option>
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className="input pl-8" value={filters.status} onChange={setFilter('status')}>
              <option value="active">Active only</option>
              <option value="">All statuses</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="btn-secondary"
            disabled={!activeFilterCount && !searchInput}
          >
            Reset
          </button>
        </div>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <div key={key} className="card h-64 animate-pulse bg-slate-100/60" />
          ))}
        </div>
      ) : jobs.length ? (
        <>
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{jobs.length}</span>{' '}
            job{jobs.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const eligible = isEligible(student, job);
              return (
                <div key={job.id} className="card flex flex-col p-5 transition hover:border-indigo-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-extrabold text-indigo-600">
                        {(job.company_name || 'C').slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">{job.title}</h3>
                        <p className="truncate text-sm text-slate-500">{job.company_name || 'Company'}</p>
                      </div>
                    </div>
                    <Badge value={job.status} className="capitalize" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" /> {job.location || '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                      <IndianRupee size={14} className="text-slate-400" />
                      {Number(job.package_lpa).toFixed(1)} LPA
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock size={14} className="text-slate-400" /> {formatDate(job.deadline)}
                    </span>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" /> {job.applicant_count}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(job.skills || []).slice(0, 4).map((skill) => (
                      <span key={skill} className="badge bg-slate-100 text-slate-600">{skill}</span>
                    ))}
                    {(job.skills || []).length > 4 ? (
                      <span className="badge bg-slate-100 text-slate-500">
                        +{job.skills.length - 4}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-4">
                    {!isAdmin ? (
                      <div className="mb-3">
                        {eligible ? (
                          <>
                            <MatchBar value={job.match_percent || 0} />
                            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <CheckCircle2 size={12} /> You meet the eligibility criteria
                            </p>
                          </>
                        ) : (
                          <p className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500">
                            <AlertCircle size={12} />
                            Requires CGPA {Number(job.min_cgpa).toFixed(1)}+ and ≤{job.max_backlogs} backlog(s)
                          </p>
                        )}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        Min CGPA {Number(job.min_cgpa).toFixed(1)} · {job.max_backlogs} backlog(s)
                      </span>
                      <Link to={`/jobs/${job.id}`} className="btn-secondary px-3 py-2 text-xs">
                        View details
                      </Link>
                    </div>
                    {job.applied ? (
                      <p className="mt-2 text-right text-[11px] font-semibold text-indigo-600">
                        ✓ Already applied
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="card px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-800">No jobs found</p>
          <p className="mt-1 text-sm text-slate-500">Try widening your filters or clearing the search.</p>
          <button type="button" onClick={resetFilters} className="btn-secondary mt-4">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
