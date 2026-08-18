import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import { GlassCard, Spinner, EmptyState, Badge } from '@/components/ui';
import { getPatients, getScans, getRiskAssessments } from '@/lib/data';
import type { Patient, RetinalScan, RiskAssessment } from '@/types';
import { DR_STAGE_LABELS, RISK_CATEGORY_LABELS } from '@/types';

export function Progression() {
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [scans, setScans] = useState<RetinalScan[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([getScans(patientId), getRiskAssessments(patientId)]).then(([s, r]) => {
      setScans(s);
      setRisks(r);
    });
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  // Build timeline data from scans (confidence over time)
  const scanTimeline = [...scans].reverse().map((s, i) => ({
    date: new Date(s.created_at).toLocaleDateString(),
    scan: i + 1,
    confidence: Number((s.confidence * 100).toFixed(1)),
    stage: DR_STAGE_LABELS[s.prediction],
  }));

  // Mocked HbA1c / glucose history derived from risk inputs + trend
  const labTrend = Array.from({ length: 6 }, (_, i) => {
    const base = 7 + i * 0.3;
    return {
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      hba1c: Number((base + (Math.random() - 0.5)).toFixed(1)),
      glucose: Math.round(140 + i * 8 + (Math.random() - 0.5) * 20),
    };
  });

  const trend = scans.length >= 2
    ? scans[0].confidence > scans[scans.length - 1].confidence ? 'progressing' : 'improving'
    : 'stable';
  const trendMap = {
    improving: { icon: TrendingDown, label: 'Improving', tone: 'green' as const },
    stable: { icon: Minus, label: 'Stable', tone: 'cyan' as const },
    progressing: { icon: TrendingUp, label: 'Progressing', tone: 'rose' as const },
  };
  const TrendIcon = trendMap[trend].icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Disease Progression Monitoring</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Compare scans, predictions, and lab history over time.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          {scans.length >= 2 && <Badge tone={trendMap[trend].tone}><TrendIcon className="h-3 w-3" /> {trendMap[trend].label}</Badge>}
        </div>
      </div>

      {scans.length === 0 ? (
        <EmptyState icon={LineChartIcon} title="No scan history" description="Once scans are saved, progression charts will appear here." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Scan Confidence Timeline</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={scanTimeline}>
                <defs>
                  <linearGradient id="gConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3366ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3366ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Area type="monotone" dataKey="confidence" stroke="#3366ff" fill="url(#gConf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">HbA1c & Blood Glucose History</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={labTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="l" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="r" orientation="right" stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="hba1c" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="r" type="monotone" dataKey="glucose" stroke="#3366ff" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="lg:col-span-2">
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Scan Comparison</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scans.slice(0, 6).map((s) => (
                <div key={s.id} className="rounded-xl border border-navy-100 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <Activity className="h-4 w-4 text-royal-500" />
                    <Badge tone={s.risk_level === 'high' ? 'rose' : s.risk_level === 'moderate' ? 'amber' : 'green'}>{s.risk_level}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy-900 dark:text-white">{DR_STAGE_LABELS[s.prediction]}</p>
                  <p className="text-xs text-navy-500 dark:text-slate-400">{new Date(s.created_at).toLocaleDateString()} · {(s.confidence * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {risks.length > 0 && (
            <GlassCard className="lg:col-span-2">
              <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Risk Score Trends</h3>
              <div className="flex flex-wrap gap-2">
                {risks.slice(0, 12).map((r) => (
                  <div key={r.id} className="rounded-xl border border-navy-100 px-3 py-2 dark:border-white/10">
                    <p className="text-xs font-semibold text-navy-700 dark:text-slate-200">{RISK_CATEGORY_LABELS[r.category]}</p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">{r.risk_percent}% · {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
