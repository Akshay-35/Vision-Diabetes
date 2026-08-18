import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Brain, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, Spinner, EmptyState, RiskBadge, Badge } from '@/components/ui';
import { getPatients, getRiskAssessments, createRiskAssessment } from '@/lib/data';
import { assessRisk, type RiskResult } from '@/lib/ai';
import { logAudit } from '@/lib/data';
import type { Patient, RiskAssessment, RiskCategory } from '@/types';
import { RISK_CATEGORY_LABELS } from '@/types';

const CATEGORIES = Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[];

export function RiskPrediction() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, RiskResult> | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputs, setInputs] = useState<Record<string, string>>({
    age: '58', gender: 'male', diabetes_duration: '12', blood_glucose: '180',
    hba1c: '8.5', blood_pressure: '145', bmi: '29', cholesterol: '220',
    smoking: 'no', exercise: '1.5', egfr: '75',
  });

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    getRiskAssessments(patientId).then(setAssessments).catch(() => setAssessments([]));
  }, [patientId]);

  const analyze = async () => {
    if (!patientId) return;
    setAnalyzing(true);
    setError(null);
    setSaved(false);
    try {
      const numericInputs: Record<string, number | string> = {
        age: Number(inputs.age), gender: inputs.gender,
        diabetes_duration: Number(inputs.diabetes_duration),
        blood_glucose: Number(inputs.blood_glucose),
        hba1c: Number(inputs.hba1c), blood_pressure: Number(inputs.blood_pressure),
        bmi: Number(inputs.bmi), cholesterol: Number(inputs.cholesterol),
        smoking: inputs.smoking, exercise: Number(inputs.exercise),
        egfr: Number(inputs.egfr),
      };
      const all: Record<string, RiskResult> = {};
      for (const cat of CATEGORIES) {
        all[cat] = await assessRisk(numericInputs, cat);
      }
      setResults(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!results || !patientId || !profile) return;
    try {
      for (const cat of CATEGORIES) {
        const r = results[cat];
        await createRiskAssessment({
          patient_id: patientId, doctor_id: profile.id,
          category: cat, risk_level: r.risk_level, risk_percent: r.risk_percent,
          top_factors: r.top_factors, inputs,
        });
      }
      await logAudit('risk_assessment_saved', patientId);
      setSaved(true);
      getRiskAssessments(patientId).then(setAssessments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const fields: { key: string; label: string; type?: string }[] = [
    { key: 'age', label: 'Age' }, { key: 'gender', label: 'Gender' },
    { key: 'diabetes_duration', label: 'Diabetes Duration (yrs)' },
    { key: 'blood_glucose', label: 'Blood Glucose (mg/dL)' },
    { key: 'hba1c', label: 'HbA1c (%)' }, { key: 'blood_pressure', label: 'Systolic BP (mmHg)' },
    { key: 'bmi', label: 'BMI' }, { key: 'cholesterol', label: 'Cholesterol (mg/dL)' },
    { key: 'smoking', label: 'Smoking' }, { key: 'exercise', label: 'Exercise (hrs/wk)' },
    { key: 'egfr', label: 'eGFR (mL/min)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Diabetes Complication Risk Prediction</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          ML-powered risk assessment across six complication categories with SHAP-style explainability.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        Risk indicators only — not a diagnosis. Clinical correlation required.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Patient Inputs</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input">
                {patients.length === 0 && <option value="">No patients</option>}
                {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  {f.key === 'gender' ? (
                    <select value={inputs[f.key]} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })} className="input">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : f.key === 'smoking' ? (
                    <select value={inputs[f.key]} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })} className="input">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : (
                    <input type="number" step="0.1" value={inputs[f.key]} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })} className="input" />
                  )}
                </div>
              ))}
            </div>
            <button onClick={analyze} disabled={!patientId || analyzing} className="btn-primary w-full">
              {analyzing ? <><Spinner /> Assessing…</> : <><Brain className="h-4 w-4" /> Predict Risk</>}
            </button>
            {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Risk Results</h3>
          {!results && !analyzing ? (
            <div className="py-10"><EmptyState icon={HeartPulse} title="No assessment yet" description="Enter patient data and predict risk to see results." /></div>
          ) : analyzing ? (
            <div className="flex flex-col items-center py-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-royal-500/20 border-t-royal-500" />
              <p className="mt-4 text-sm text-navy-500 dark:text-slate-400">Computing risk scores…</p>
            </div>
          ) : results ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="space-y-2">
                {CATEGORIES.map((cat) => {
                  const r = results[cat];
                  const color = r.risk_level === 'high' ? '#ef4444' : r.risk_level === 'moderate' ? '#f59e0b' : '#10b981';
                  return (
                    <div key={cat} className="rounded-xl border border-navy-100 p-3 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-navy-900 dark:text-white">{RISK_CATEGORY_LABELS[cat]}</p>
                        <RiskBadge level={r.risk_level} />
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-white/10">
                        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${r.risk_percent}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <p className="mt-1 text-xs text-navy-500 dark:text-slate-400">{r.risk_percent}% estimated risk</p>
                    </div>
                  );
                })}
              </div>

              {saved ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Saved to patient record
                </div>
              ) : (
                <button onClick={save} className="btn-primary w-full text-sm">Save Assessment</button>
              )}
            </motion.div>
          ) : null}
        </GlassCard>
      </div>

      {/* SHAP-style explainability */}
      {results && (
        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Explainable AI — Feature Importance</h3>
          <p className="text-xs text-navy-500 dark:text-slate-400">SHAP-style attribution showing which factors drove each prediction.</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const r = results[cat];
              const data = r.top_factors.map((f) => ({ name: f.factor, value: f.contribution }));
              return (
                <div key={cat}>
                  <p className="mb-2 text-sm font-semibold text-navy-800 dark:text-white">{RISK_CATEGORY_LABELS[cat]}</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={['#3366ff', '#06b6d4', '#8b5cf6', '#f59e0b'][i % 4]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {r.top_factors.map((f, i) => (
                      <p key={i} className="text-xs text-navy-500 dark:text-slate-400"><TrendingUp className="mr-1 inline h-3 w-3" />{f.detail}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* History */}
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Assessment History</h3>
        {assessments.length === 0 ? (
          <EmptyState icon={HeartPulse} title="No assessments yet" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {assessments.slice(0, 12).map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-xl border border-navy-100 px-3 py-2 dark:border-white/10">
                <span className="text-xs font-semibold text-navy-700 dark:text-slate-200">{RISK_CATEGORY_LABELS[a.category]}</span>
                <Badge tone={a.risk_level === 'high' ? 'rose' : a.risk_level === 'moderate' ? 'amber' : 'green'}>{a.risk_percent}%</Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
