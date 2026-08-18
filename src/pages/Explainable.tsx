import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, ScanLine, HeartPulse, Lightbulb, Eye } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { GlassCard, Spinner, EmptyState, RiskBadge } from '@/components/ui';
import { RetinalHeatmap } from '@/components/RetinalHeatmap';
import { getPatients, getScans, getRiskAssessments } from '@/lib/data';
import type { Patient, RetinalScan, RiskAssessment } from '@/types';
import { DR_STAGE_LABELS, RISK_CATEGORY_LABELS } from '@/types';

export function Explainable() {
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
    Promise.all([getScans(patientId), getRiskAssessments(patientId)]).then(([s, r]) => { setScans(s); setRisks(r); });
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const latestScan = scans[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Explainable AI</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Grad-CAM visualizations and SHAP-style feature attribution for every prediction.</p>
        </div>
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
          {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      {scans.length === 0 && risks.length === 0 ? (
        <EmptyState icon={Brain} title="No explainable data" description="Run a retinal scan or risk assessment to see explainability." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Grad-CAM */}
          <GlassCard>
            <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Grad-CAM Retinal Visualization</h3>
            <p className="text-xs text-navy-500 dark:text-slate-400">Regions that most influenced the AI prediction.</p>
            {latestScan ? (
              <div className="mt-4">
                <RetinalHeatmap imageUrl={latestScan.image_url} region={{ cx: 0.5, cy: 0.45, radius: 0.15 }} className="aspect-square w-full" />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{DR_STAGE_LABELS[latestScan.prediction]}</p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">{(latestScan.confidence * 100).toFixed(1)}% confidence</p>
                  </div>
                  <RiskBadge level={latestScan.risk_level as 'low' | 'moderate' | 'high'} />
                </div>
                {Array.isArray(latestScan.contributing_factors) && latestScan.contributing_factors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Highlighted Features</p>
                    <div className="mt-2 space-y-1">
                      {latestScan.contributing_factors.map((f, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-xs text-navy-600 dark:text-slate-300"><Eye className="h-3 w-3 text-royal-500" /> {f}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-navy-400 dark:text-slate-500">No scans available</p>
            )}
          </GlassCard>

          {/* SHAP */}
          <GlassCard>
            <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">SHAP-style Feature Importance</h3>
            <p className="text-xs text-navy-500 dark:text-slate-400">Which patient factors drove each risk prediction.</p>
            {risks.length > 0 ? (
              <div className="mt-4 space-y-5">
                {risks.slice(0, 4).map((r) => {
                  const factors = Array.isArray(r.top_factors) ? r.top_factors : [];
                  const data = factors.map((f: { factor: string; contribution: number }) => ({ name: f.factor, value: f.contribution }));
                  return (
                    <div key={r.id}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-semibold text-navy-800 dark:text-white">{RISK_CATEGORY_LABELS[r.category]}</p>
                        <RiskBadge level={r.risk_level as 'low' | 'moderate' | 'high'} />
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                          <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                          <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={['#3366ff', '#06b6d4', '#8b5cf6', '#f59e0b'][i % 4]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-navy-400 dark:text-slate-500">No risk assessments available</p>
            )}
          </GlassCard>

          {/* Plain-language explanation */}
          {risks.length > 0 && (
            <GlassCard className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Plain-Language Explanation</h3>
              <div className="mt-3 space-y-3">
                {risks.slice(0, 3).map((r) => {
                  const factors = Array.isArray(r.top_factors) ? r.top_factors : [];
                  const top = factors.slice(0, 2).map((f: { factor: string }) => f.factor).join(' and ');
                  return (
                    <div key={r.id} className="flex items-start gap-3 rounded-xl border border-navy-100 p-4 dark:border-white/10">
                      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900 dark:text-white">{RISK_CATEGORY_LABELS[r.category]} — {r.risk_level} risk ({r.risk_percent}%)</p>
                        <p className="mt-1 text-sm text-navy-600 dark:text-slate-300">
                          {r.risk_level === 'high'
                            ? `High risk is associated with ${top}. Clinical correlation and proactive management are recommended.`
                            : r.risk_level === 'moderate'
                            ? `Moderate risk is associated with ${top}. Monitoring and lifestyle optimization are suggested.`
                            : `Low risk. ${top ? `Protective factors include ${top}.` : 'Continue current management.'}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
