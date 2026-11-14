import React from 'react';

const STYLES = {
  applied: 'bg-sky-100 text-sky-700',
  shortlisted: 'bg-violet-100 text-violet-700',
  interviewed: 'bg-amber-100 text-amber-800',
  selected: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
  filled: 'bg-indigo-100 text-indigo-700',
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-rose-100 text-rose-700'
};

export default function Badge({ value, children, className = '' }) {
  const key = String(value || '').toLowerCase();
  const style = STYLES[key] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`badge ${style} ${className}`}>
      {children || value}
    </span>
  );
}
