import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Brain,
  Briefcase,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STUDENT_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/prediction', label: 'Placement Prediction', icon: Brain },
  { to: '/applications', label: 'My Applications', icon: FileText },
  { to: '/profile', label: 'Profile & Skills', icon: User }
];

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: FileText }
];

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;
  const displayName = isAdmin
    ? 'Placement Admin'
    : `${user?.student?.first_name || ''} ${user?.student?.last_name || ''}`.trim() || 'Student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <GraduationCap size={20} />
        </span>
        <span>
          <span className="block text-base font-extrabold tracking-tight text-slate-900">
            PlacementIQ
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Predict · Match · Apply
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/jobs'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {initials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-600"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <GraduationCap size={18} />
          </span>
          <span className="text-sm font-extrabold text-slate-900">PlacementIQ</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
            role="presentation"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
