import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-500">
        <Inbox size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
