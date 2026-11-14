import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE', 'IT', 'AIML', 'DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const INITIAL = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  branch: 'CSE',
  cgpa: '',
  backlogs: '0',
  graduation_year: '2026'
};

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, loading, navigate]);

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({
        ...form,
        cgpa: form.cgpa === '' ? null : Number(form.cgpa),
        backlogs: Number(form.backlogs || 0),
        graduation_year: Number(form.graduation_year)
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your student account"
      subtitle="Add your academic details now — you can add skills right after."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <Alert type="error">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="first_name">First name</label>
            <input
              id="first_name"
              className="input"
              value={form.first_name}
              onChange={setField('first_name')}
              placeholder="Aarav"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              className="input"
              value={form.last_name}
              onChange={setField('last_name')}
              placeholder="Sharma"
              required
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={setField('email')}
            placeholder="you@campus.edu"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={setField('password')}
            placeholder="At least 6 characters"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="branch">Branch</label>
            <select id="branch" className="input" value={form.branch} onChange={setField('branch')}>
              {BRANCHES.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="cgpa">CGPA (0–10)</label>
            <input
              id="cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              className="input"
              value={form.cgpa}
              onChange={setField('cgpa')}
              placeholder="8.25"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="backlogs">Active backlogs</label>
            <input
              id="backlogs"
              type="number"
              min="0"
              max="30"
              className="input"
              value={form.backlogs}
              onChange={setField('backlogs')}
            />
          </div>
          <div>
            <label className="label" htmlFor="graduation_year">Graduation year</label>
            <input
              id="graduation_year"
              type="number"
              min="2000"
              max="2100"
              className="input"
              value={form.graduation_year}
              onChange={setField('graduation_year')}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
          {!busy ? <UserPlus size={17} /> : null}
        </button>
      </form>
    </AuthLayout>
  );
}
