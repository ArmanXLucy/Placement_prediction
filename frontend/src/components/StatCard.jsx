import React from 'react';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600'
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-xl p-2.5 ${tones[tone] || tones.indigo}`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
