import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const DEMOS = [
  { label: 'Student demo', email: 'student@demo.com', password: 'Student@123' },
  { label: 'Admin demo', email: 'admin@demo.com', password: 'Admin@123' }
];

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from || '/dashboard';

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
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your recommendations and placement prediction."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Create a student account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <Alert type="error">{error}</Alert> : null}

        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@campus.edu"
            value={form.email}
            onChange={setField('email')}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input pr-11"
              placeholder="••••••••"
              value={form.password}
              onChange={setField('password')}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
          {!busy ? <LogIn size={17} /> : null}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Quick demo login
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {DEMOS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => {
                setForm({ email: demo.email, password: demo.password });
                setError('');
              }}
            >
              <span className="block font-semibold text-slate-700">{demo.label}</span>
              <span className="block truncate text-slate-400">{demo.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
