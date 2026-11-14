import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
        <GraduationCap size={28} />
      </div>
      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn-primary">
          <Home size={16} /> {isAuthenticated ? 'Go to dashboard' : 'Back to home'}
        </Link>
        {!isAuthenticated ? (
          <Link to="/login" className="btn-secondary">Log in</Link>
        ) : null}
      </div>
    </div>
  );
}
