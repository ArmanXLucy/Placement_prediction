import React from 'react';

export default function MatchBar({ value = 0, showLabel = true }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-500' : 'bg-rose-400';

  return (
    <div>
      {showLabel ? (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Skill match</span>
          <span className="font-semibold text-slate-700">{percent.toFixed(0)}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
