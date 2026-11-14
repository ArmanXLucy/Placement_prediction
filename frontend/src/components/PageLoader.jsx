import React from 'react';

export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
