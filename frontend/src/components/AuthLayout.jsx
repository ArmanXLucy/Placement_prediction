import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <GraduationCap size={22} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">PlacementIQ</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Make your next placement decision with data, not guesswork.
          </h2>
          <p className="mt-4 text-slate-300">
            PlacementIQ scores every eligible job against your skills and predicts
            your placement probability from your academic profile.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Target, text: 'Jobs ranked by real skill overlap' },
              { icon: TrendingUp, text: 'Placement probability from a trained ML model' },
              { icon: Sparkles, text: 'Recommendations refreshed on every visit' }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={16} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          MySQL 8 · Express · React · Node.js
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={19} />
            </span>
            <span className="text-base font-extrabold text-slate-900">PlacementIQ</span>
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}

          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-sm text-slate-500">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
