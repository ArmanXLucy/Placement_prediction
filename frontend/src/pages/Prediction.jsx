import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import PageLoader from '../components/PageLoader';

function gaugeColor(percent) {
  if (percent >= 70) return '#10b981';
  if (percent >= 40) return '#f59e0b';
  return '#f43f5e';
}

function Gauge({ percent }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;
  const color = gaugeColor(percent);

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <svg viewBox="0 0 180 180" className="h-52 w-52 -rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="13" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900">
          {percent.toFixed(1)}%
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Placement chance
        </span>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function Prediction() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.get('/predictions/me');
      setLatest(data.latest);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPrediction = async () => {
    setRunning(true);
    setError('');
    try {
      const data = await api.post('/predictions/me');
      setResult(data.prediction);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <PageLoader label="Loading prediction model..." />;

  const percent = Number(result?.probability ?? latest?.probability ?? 0);
  const hasPrediction = Boolean(result || latest);
  const level = result?.level || (percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low');
  const historyData = [...history]
    .reverse()
    .map((item) => ({
      date: formatDate(item.predicted_at),
      probability: Number(item.probability)
    }));

  const maxContribution = result?.contributions?.length
    ? Math.max(...result.contributions.map((c) => Math.abs(c.contribution)), 0.001)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Placement prediction
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Logistic regression trained on historical placement records.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={runPrediction} disabled={running}>
          {running ? <RefreshCw size={16} className="animate-spin" /> : <Brain size={16} />}
          {running ? 'Running model...' : hasPrediction ? 'Run again' : 'Run prediction'}
        </button>
      </div>

      {error ? <Alert type="error" onClose={() => setError('')}>{error}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card flex flex-col items-center p-6 text-center">
          {hasPrediction ? (
            <>
              <Gauge percent={percent} />
              <div className="mt-3 flex items-center gap-2">
                <Badge value={level} className="capitalize">
                  {level === 'high' ? 'High chance' : level === 'medium' ? 'Moderate chance' : 'Low chance'}
                </Badge>
                {latest ? (
                  <span className="text-xs text-slate-400">Last run {formatDate(latest.predicted_at)}</span>
                ) : null}
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
                {level === 'high'
                  ? 'Your profile is competitive. Focus on applying early and interview preparation.'
                  : level === 'medium'
                  ? 'You are in the mix. Strengthening weaker factors can move you into the high-chance bracket.'
                  : 'There is room to improve. Work through the suggestions on the right and re-run the model.'}
              </p>
              {!result ? (
                <button type="button" className="btn-secondary mt-4" onClick={runPrediction} disabled={running}>
                  Show factor breakdown <ArrowRight size={15} />
                </button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="rounded-full bg-indigo-50 p-4 text-indigo-600">
                <Brain size={30} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No prediction yet</h3>
              <p className="max-w-sm text-sm text-slate-500">
                Run the model to estimate your placement probability from your CGPA,
                skills, projects, internships, certifications and backlogs.
              </p>
              <button type="button" className="btn-primary mt-2" onClick={runPrediction} disabled={running}>
                {running ? 'Running...' : 'Run prediction'}
              </button>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-900">What is driving your score?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each bar shows how a feature pushes your probability up or down.
          </p>

          {result?.contributions?.length ? (
            <div className="mt-5 space-y-4">
              {result.contributions.map((item) => {
                const positive = item.contribution >= 0;
                const width = Math.max(4, (Math.abs(item.contribution) / maxContribution) * 100);
                return (
                  <div key={item.feature}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className={`font-bold ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {positive ? '+' : ''}{item.contribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-rose-400'}`}
                        style={{ width: `${Math.min(100, width)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Your value: {item.value}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              Run a prediction to see the factor-by-factor breakdown. Your latest saved
              score is shown on the left.
            </div>
          )}
        </div>
      </div>

      {result ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Lightbulb size={18} className="text-amber-500" /> Personalised advice
            </h2>
            <ul className="mt-4 space-y-3">
              {result.advice.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <Link to="/profile" className="btn-secondary text-xs">Update profile</Link>
              <Link to="/recommendations" className="btn-primary text-xs">
                See matching jobs <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-900">Model performance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Evaluated on a held-out 20% split of placement history.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Accuracy', result.model.metrics.test.accuracy],
                ['Precision', result.model.metrics.test.precision],
                ['Recall', result.model.metrics.test.recall],
                ['AUC', result.model.metrics.test.auc]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {(Number(value) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Trained on {result.model.metrics.test.samples + result.model.metrics.train.samples} records ·
              {' '}{result.model.algorithm.replace('_', ' ')}
            </p>
          </div>
        </div>
      ) : null}

      {historyData.length > 1 ? (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Prediction history</h2>
              <p className="mt-1 text-sm text-slate-500">How your probability changed over time.</p>
            </div>
            <span className={`badge ${percent >= 40 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
              {percent >= 55 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {percent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
