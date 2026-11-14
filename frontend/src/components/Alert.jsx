import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const ICONS = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info
};

const STYLES = {
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800'
};

export default function Alert({ type = 'info', children, onClose }) {
  if (!children) return null;
  const Icon = ICONS[type] || Info;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${STYLES[type]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose ? (
        <button type="button" onClick={onClose} className="text-xs font-semibold underline">
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
