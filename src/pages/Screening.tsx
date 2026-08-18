import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanLine, Upload, Brain, AlertCircle, CheckCircle2, Activity, Image as ImageIcon, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, Spinner, EmptyState, RiskBadge, Badge } from '@/components/ui';
import { RetinalHeatmap } from '@/components/RetinalHeatmap';
import { getPatients, getScans, createScan } from '@/lib/data';
import { classifyRetina, type RetinaResult } from '@/lib/ai';
import { logAudit } from '@/lib/data';
import type { Patient, RetinalScan } from '@/types';
import { DR_STAGE_LABELS } from '@/types';

const FUNDUS_SAMPLES = [
  'https://images.pexels.com/photos/7376/startup-photos.jpg?auto=compress&cs=tinysrgb&w=600',
];

export function Screening() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [scans, setScans] = useState<RetinalScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RetinaResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    getScans(patientId).then(setScans).catch(() => setScans([]));
  }, [patientId]);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setSaved(false);
  };

  const analyze = async () => {
    if (!imageUrl || !patientId) return;
    setAnalyzing(true);
    setError(null);
    setSaved(false);
    try {
      const imageId = `${patientId}-${Date.now()}`;
      const r = await classifyRetina(imageId);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!result || !patientId || !profile) return;
    try {
      await createScan({
        patient_id: patientId,
        doctor_id: profile.id,
        image_url: imageUrl ?? undefined,
        prediction: result.prediction,
        confidence: result.confidence,
        risk_level: result.risk_level,
        heatmap_url: null,
        ai_analysis: result.ai_analysis,
        contributing_factors: result.contributing_factors,
      });
      await logAudit('retinal_scan_saved', patientId);
      setSaved(true);
      getScans(patientId).then(setScans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">AI Retinal Screening</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Upload a fundus image for AI-assisted diabetic retinopathy classification with Grad-CAM explainability.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        Screening only — not a definitive diagnosis. Final decisions remain with qualified clinicians.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload + controls */}
        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">New Scan</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input">
                {patients.length === 0 && <option value="">No patients — register one first</option>}
                {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-200 px-6 py-10 text-center transition hover:border-royal-400 hover:bg-royal-50/40 dark:border-white/10 dark:hover:border-royal-500/40 dark:hover:bg-royal-500/5">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Upload className="h-8 w-8 text-royal-500" />
              <p className="mt-3 text-sm font-semibold text-navy-700 dark:text-slate-200">Upload retinal fundus image</p>
              <p className="text-xs text-navy-400 dark:text-slate-500">PNG, JPG up to 10MB</p>
            </label>

            {imageUrl && (
              <div className="relative">
                <img src={imageUrl} alt="fundus" className="h-40 w-full rounded-xl object-cover" />
                <button onClick={() => { setImageUrl(null); setResult(null); }} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-navy-900/60 text-white"><X className="h-4 w-4" /></button>
              </div>
            )}

            <button onClick={analyze} disabled={!imageUrl || !patientId || analyzing} className="btn-primary w-full">
              {analyzing ? <><Spinner /> Analyzing…</> : <><Brain className="h-4 w-4" /> Run AI Analysis</>}
            </button>

            {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}
          </div>
        </GlassCard>

        {/* Result */}
        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">AI Result</h3>
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-royal-500/20 border-t-royal-500" />
                <Brain className="absolute inset-0 m-auto h-8 w-8 text-royal-500" />
              </div>
              <p className="mt-4 text-sm text-navy-500 dark:text-slate-400">Running deep learning inference…</p>
            </div>
          ) : !result ? (
            <div className="py-10">
              <EmptyState icon={ImageIcon} title="No analysis yet" description="Upload an image and run AI analysis to see predictions, confidence, and Grad-CAM heatmap." />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-navy-500 dark:text-slate-400">Prediction</p>
                  <p className="font-display text-xl font-bold text-navy-900 dark:text-white">{DR_STAGE_LABELS[result.prediction]}</p>
                </div>
                <RiskBadge level={result.risk_level} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-navy-50 p-3 dark:bg-white/5">
                  <p className="text-xs text-navy-500 dark:text-slate-400">Confidence</p>
                  <p className="font-display text-lg font-bold text-navy-900 dark:text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="rounded-xl bg-navy-50 p-3 dark:bg-white/5">
                  <p className="text-xs text-navy-500 dark:text-slate-400">Risk Level</p>
                  <p className="font-display text-lg font-bold capitalize text-navy-900 dark:text-white">{result.risk_level}</p>
                </div>
              </div>

              <RetinalHeatmap imageUrl={imageUrl} region={result.heatmap_region} className="aspect-square w-full" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Grad-CAM Heatmap</p>
                <p className="mt-1 text-xs text-navy-400 dark:text-slate-500">Highlighted regions influenced the AI prediction.</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">AI Analysis</p>
                <p className="mt-1 text-sm text-navy-700 dark:text-slate-300">{result.ai_analysis}</p>
              </div>

              {result.contributing_factors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Contributing Factors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.contributing_factors.map((f, i) => <Badge key={i} tone="rose">{f}</Badge>)}
                  </div>
                </div>
              )}

              {saved ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Saved to patient record
                </div>
              ) : (
                <button onClick={save} className="btn-primary w-full text-sm">Save to Patient Record</button>
              )}
            </motion.div>
          )}
        </GlassCard>
      </div>

      {/* History */}
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Scan History</h3>
        {scans.length === 0 ? (
          <EmptyState icon={ScanLine} title="No scans yet" description="Saved scans for this patient will appear here." />
        ) : (
          <div className="space-y-3">
            {scans.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-royal-500" />
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{DR_STAGE_LABELS[s.prediction]}</p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">{new Date(s.created_at).toLocaleString()} · {(s.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <RiskBadge level={s.risk_level as 'low' | 'moderate' | 'high'} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
