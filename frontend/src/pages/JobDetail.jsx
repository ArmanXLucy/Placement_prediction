import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Circle,
  ExternalLink,
  IndianRupee,
  MapPin,
  Send,
  Users,
  XCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import MatchBar from '../components/MatchBar';
import PageLoader from '../components/PageLoader';

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export default function JobDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const student = user?.student;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .get(`/jobs/${id}`)
      .then((data) => {
        if (mounted) setJob(data.job);
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
  }, [id]);

  if (loading) return <PageLoader label="Loading job details..." />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!job) return null;

  const cgpaOk = student ? Number(student.cgpa) >= Number(job.min_cgpa) : false;
  const backlogOk = student ? Number(student.backlogs) <= Number(job.max_backlogs) : false;
  const deadlinePassed = job.deadline ? new Date(String(job.deadline).replace(' ', 'T')) < new Date() : false;
  const eligible = cgpaOk && backlogOk && job.status === 'active' && !deadlinePassed;
  const alreadyApplied = Boolean(job.application);
  const skills = job.skills || [];
  const mandatorySkills = skills.filter((s) => s.is_mandatory);
  const optionalSkills = skills.filter((s) => !s.is_mandatory);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    setMessage('');
    try {
      const data = await api.post('/applications', { job_id: job.id });
      setJob((current) => ({ ...current, application: data.application, applicant_count: current.applicant_count + 1 }));
      setMessage(data.message || 'Application submitted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      {message ? <Alert type="success">{message}</Alert> : null}
      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="card p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-extrabold text-indigo-600">
              {(job.company_name || 'C').slice(0, 1)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{job.title}</h1>
                <Badge value={job.status} className="capitalize" />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Building2 size={15} /> {job.company_name || 'Company'}
              </p>
            </div>
          </div>
          {!isAdmin ? (
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary shrink-0 px-5 py-3"
              disabled={applying || alreadyApplied || !eligible}
            >
              <Send size={16} />
              {alreadyApplied ? 'Already applied' : applying ? 'Submitting...' : 'Apply now'}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: IndianRupee, label: 'Package', value: `₹${Number(job.package_lpa).toFixed(1)} LPA` },
            { icon: MapPin, label: 'Location', value: job.location || '—' },
            { icon: CalendarClock, label: 'Apply before', value: formatDate(job.deadline) },
            { icon: Users, label: 'Applicants', value: job.applicant_count || 0 }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Icon size={13} /> {label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {!isAdmin && alreadyApplied ? (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-sm text-indigo-800">
              Your application status: <span className="font-bold capitalize">{job.application.status}</span>
            </p>
            <Link to="/applications" className="text-xs font-semibold text-indigo-600 hover:underline">
              View applications
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-900">About the role</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {job.description || 'No description provided.'}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-900">Skills required</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAdmin
                ? 'Skills attached to this job posting.'
                : 'Green means the skill is already on your profile.'}
            </p>

            <div className="mt-4 space-y-2">
              {[...mandatorySkills, ...optionalSkills].map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    {isAdmin ? (
                      <Circle size={15} className="text-slate-300" />
                    ) : skill.has_skill ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="text-slate-300" />
                    )}
                    <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                    <span className="text-[11px] text-slate-400">{skill.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {skill.is_mandatory ? (
                      <span className="badge bg-rose-50 text-rose-600">Mandatory</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500">Optional</span>
                    )}
                    {!isAdmin && skill.has_skill ? (
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Level {skill.proficiency}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {!isAdmin ? (
            <div className="card p-6">
              <h2 className="text-base font-bold text-slate-900">Your eligibility</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                  <span className="text-sm text-slate-600">CGPA</span>
                  <span className={`text-sm font-bold ${cgpaOk ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {student?.cgpa ?? '—'} / {Number(job.min_cgpa).toFixed(2)} required
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                  <span className="text-sm text-slate-600">Backlogs</span>
                  <span className={`text-sm font-bold ${backlogOk ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {student?.backlogs ?? '—'} / max {job.max_backlogs}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                  <span className="text-sm text-slate-600">Deadline</span>
                  <span className={`text-sm font-bold ${deadlinePassed ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {deadlinePassed ? 'Passed' : formatDate(job.deadline)}
                  </span>
                </div>
              </div>

              {job.match ? (
                <div className="mt-5">
                  <MatchBar value={job.match.match_percent || 0} />
                  <p className="mt-2 text-xs text-slate-500">
                    {job.match.matched_count} of {job.match.required_count} required skills matched
                  </p>
                </div>
              ) : null}

              {!eligible && !alreadyApplied ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-600">
                  You do not currently meet all eligibility criteria for this role.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-900">Company</h2>
            <p className="mt-2 text-sm font-semibold text-slate-800">{job.company_name || '—'}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {job.company_description || 'No company description available.'}
            </p>
            {job.company_website ? (
              <a
                href={job.company_website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Visit website <ExternalLink size={13} />
              </a>
            ) : null}
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Job posted {formatDate(job.created_at, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
