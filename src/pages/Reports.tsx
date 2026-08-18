import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download, AlertCircle, Stethoscope } from 'lucide-react';
import jsPDF from 'jspdf';
import { GlassCard, Spinner, EmptyState, RiskBadge, Badge } from '@/components/ui';
import {
  getPatients, getScans, getRiskAssessments, getMedications, getNotes,
} from '@/lib/data';
import type { Patient, RetinalScan, RiskAssessment, Medication, ClinicalNote } from '@/types';
import { DR_STAGE_LABELS, RISK_CATEGORY_LABELS } from '@/types';

export function Reports() {
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scans, setScans] = useState<RetinalScan[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    getPatients().then((ps) => setPatient(ps.find((p) => p.id === patientId) ?? null));
    Promise.all([
      getScans(patientId), getRiskAssessments(patientId), getMedications(patientId), getNotes(patientId),
    ]).then(([s, r, m, n]) => { setScans(s); setRisks(r); setMeds(m); setNotes(n); });
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const generatePdf = () => {
    const doc = new jsPDF();
    let y = 20;
    // Header
    doc.setFillColor(15, 29, 92);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('VisionDiab AI — Clinical Decision Support Report', 14, 14);
    doc.setFontSize(9);
    doc.text('AI-assisted report · Does not replace professional medical diagnosis', 14, 22);
    doc.setTextColor(20, 20, 20);
    y = 40;

    // Patient info
    doc.setFontSize(12);
    doc.text('Patient Information', 14, y); y += 6;
    doc.setFontSize(9);
    if (patient) {
      doc.text(`Name: ${patient.full_name}`, 14, y); y += 5;
      if (patient.gender) { doc.text(`Gender: ${patient.gender}`, 14, y); y += 5; }
      if (patient.diabetes_type) { doc.text(`Diabetes Type: ${patient.diabetes_type.replace('_', ' ')}`, 14, y); y += 5; }
      if (patient.diabetes_duration_years != null) { doc.text(`Diabetes Duration: ${patient.diabetes_duration_years} years`, 14, y); y += 5; }
    }
    y += 4;

    // Latest scan
    if (scans.length) {
      const s = scans[0];
      doc.setFontSize(12);
      doc.text('Latest Retinal Screening', 14, y); y += 6;
      doc.setFontSize(9);
      doc.text(`Prediction: ${DR_STAGE_LABELS[s.prediction]}`, 14, y); y += 5;
      doc.text(`Confidence: ${(s.confidence * 100).toFixed(1)}%`, 14, y); y += 5;
      doc.text(`Risk Level: ${s.risk_level}`, 14, y); y += 5;
      if (s.ai_analysis) {
        const lines = doc.splitTextToSize(`AI Analysis: ${s.ai_analysis}`, 180);
        doc.text(lines, 14, y); y += lines.length * 5;
      }
      if (Array.isArray(s.contributing_factors) && s.contributing_factors.length) {
        doc.text(`Contributing Factors: ${s.contributing_factors.join('; ')}`, 14, y); y += 5;
      }
      y += 4;
    }

    // Risk assessments
    if (risks.length) {
      doc.setFontSize(12);
      doc.text('Risk Assessments', 14, y); y += 6;
      doc.setFontSize(9);
      risks.slice(0, 6).forEach((r) => {
        doc.text(`${RISK_CATEGORY_LABELS[r.category]}: ${r.risk_percent}% (${r.risk_level})`, 14, y); y += 5;
      });
      y += 4;
    }

    // Medications
    if (meds.length) {
      doc.setFontSize(12);
      doc.text('Medications', 14, y); y += 6;
      doc.setFontSize(9);
      meds.forEach((m) => {
        doc.text(`${m.name} — ${m.dosage ?? ''} ${m.frequency ?? ''} (${m.active ? 'active' : 'inactive'})`, 14, y); y += 5;
      });
      y += 4;
    }

    // Notes
    if (notes.length) {
      doc.setFontSize(12);
      doc.text('Clinical Notes', 14, y); y += 6;
      doc.setFontSize(9);
      notes.slice(0, 3).forEach((n) => {
        const lines = doc.splitTextToSize(`- ${n.content}`, 180);
        doc.text(lines, 14, y); y += lines.length * 5;
      });
      y += 4;
    }

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const disclaimer = doc.splitTextToSize('Disclaimer: This report is AI-assisted and intended for clinical decision support only. It does not constitute a medical diagnosis. All predictions are screening or risk indicators. Final diagnosis and treatment decisions must be made by qualified healthcare professionals.', 180);
    doc.text(disclaimer, 14, y);

    doc.save(`VisionDiab_Report_${patient?.full_name?.replace(/\s/g, '_') ?? 'patient'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">AI-Assisted Reports</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Generate professional PDF clinical decision support reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          <button onClick={generatePdf} disabled={!patientId || (scans.length === 0 && risks.length === 0)} className="btn-primary text-sm">
            <Download className="h-4 w-4" /> Generate PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        Reports are AI-assisted and do not replace professional medical diagnosis.
      </div>

      {scans.length === 0 && risks.length === 0 ? (
        <EmptyState icon={FileText} title="No data for report" description="Run a retinal scan or risk assessment first to generate a report." />
      ) : (
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Report Preview</h3>
              <p className="text-sm text-navy-500 dark:text-slate-400">{patient?.full_name} · {scans.length} scans · {risks.length} risk assessments · {meds.length} medications</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {scans[0] && (
              <div className="rounded-xl border border-navy-100 p-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Latest Retinal Screening</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-semibold text-navy-900 dark:text-white">{DR_STAGE_LABELS[scans[0].prediction]}</p>
                  <RiskBadge level={scans[0].risk_level as 'low' | 'moderate' | 'high'} />
                </div>
                <p className="mt-1 text-sm text-navy-600 dark:text-slate-300">Confidence: {(scans[0].confidence * 100).toFixed(1)}%</p>
                {scans[0].ai_analysis && <p className="mt-2 text-xs text-navy-500 dark:text-slate-400">{scans[0].ai_analysis}</p>}
              </div>
            )}

            {risks.length > 0 && (
              <div className="rounded-xl border border-navy-100 p-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Risk Assessments</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {risks.slice(0, 6).map((r) => (
                    <Badge key={r.id} tone={r.risk_level === 'high' ? 'rose' : r.risk_level === 'moderate' ? 'amber' : 'green'}>
                      {RISK_CATEGORY_LABELS[r.category]}: {r.risk_percent}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {meds.length > 0 && (
              <div className="rounded-xl border border-navy-100 p-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Medications</p>
                <div className="mt-2 space-y-1">
                  {meds.map((m) => <p key={m.id} className="text-sm text-navy-700 dark:text-slate-300">{m.name} — {m.dosage} {m.frequency}</p>)}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
