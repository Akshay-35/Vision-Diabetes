import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, ScanLine, HeartPulse, Pill, FlaskConical, FileText, CalendarDays,
  Activity, User,
} from 'lucide-react';
import { GlassCard, Spinner, EmptyState, RiskBadge, Badge } from '@/components/ui';
import {
  getPatients, getScans, getRiskAssessments, getMedications,
  getLabReports, getAppointments, getNotes, createNote,
} from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import type { Patient, RetinalScan, RiskAssessment, Medication, LabReport, Appointment, ClinicalNote } from '@/types';
import { DR_STAGE_LABELS, RISK_CATEGORY_LABELS } from '@/types';

interface TimelineEntry {
  id: string;
  date: string;
  type: 'scan' | 'risk' | 'med' | 'lab' | 'appt' | 'note';
  title: string;
  detail: string;
  icon: typeof ScanLine;
  tone: string;
}

export function Records() {
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scans, setScans] = useState<RetinalScan[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [labs, setLabs] = useState<LabReport[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      getPatients(),
    ]).then(() => {});
    getPatients().then((ps) => setPatient(ps.find((p) => p.id === patientId) ?? null));
    Promise.all([
      getScans(patientId), getRiskAssessments(patientId), getMedications(patientId),
      getLabReports(patientId), getAppointments(patientId), getNotes(patientId),
    ]).then(([s, r, m, l, a, n]) => {
      setScans(s); setRisks(r); setMeds(m); setLabs(l); setAppts(a); setNotes(n);
    });
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const timeline: TimelineEntry[] = [
    ...scans.map((s) => ({ id: s.id, date: s.created_at, type: 'scan' as const, title: DR_STAGE_LABELS[s.prediction], detail: `${(s.confidence * 100).toFixed(1)}% confidence`, icon: ScanLine, tone: 'royal' })),
    ...risks.map((r) => ({ id: r.id, date: r.created_at, type: 'risk' as const, title: RISK_CATEGORY_LABELS[r.category], detail: `${r.risk_percent}% risk`, icon: HeartPulse, tone: 'rose' })),
    ...meds.map((m) => ({ id: m.id, date: m.created_at, type: 'med' as const, title: m.name, detail: `${m.dosage ?? ''} ${m.frequency ?? ''}`.trim(), icon: Pill, tone: 'cyan' })),
    ...labs.map((l) => ({ id: l.id, date: l.created_at, type: 'lab' as const, title: 'Lab Report', detail: l.confirmed ? 'Confirmed' : 'Pending review', icon: FlaskConical, tone: 'amber' })),
    ...appts.map((a) => ({ id: a.id, date: a.scheduled_at, type: 'appt' as const, title: a.reason || 'Appointment', detail: a.status, icon: CalendarDays, tone: 'royal' })),
    ...notes.map((n) => ({ id: n.id, date: n.created_at, type: 'note' as const, title: 'Clinical Note', detail: n.content.slice(0, 80), icon: FileText, tone: 'slate' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const addNote = async () => {
    if (!noteText.trim() || !patientId || !profile) return;
    await createNote({ patient_id: patientId, doctor_id: profile.id, content: noteText });
    setNoteText('');
    getNotes(patientId).then(setNotes);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Digital Health Records</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">A unified patient timeline of scans, labs, medications, and AI insights.</p>
        </div>
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
          {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      {patient && (
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-royal-500 to-cyan-500 font-display text-xl font-bold text-white">
              {patient.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">{patient.full_name}</h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-navy-500 dark:text-slate-400">
                {patient.gender && <span className="capitalize">{patient.gender}</span>}
                {patient.diabetes_type && <Badge tone="royal">{patient.diabetes_type.replace('_', ' ')}</Badge>}
                {patient.diabetes_duration_years != null && <span>{patient.diabetes_duration_years} yrs diabetes</span>}
                {patient.email && <span>· {patient.email}</span>}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-4"><div className="flex items-center gap-2"><ScanLine className="h-4 w-4 text-royal-500" /><div><p className="text-xs text-navy-500 dark:text-slate-400">Scans</p><p className="font-display text-lg font-bold text-navy-900 dark:text-white">{scans.length}</p></div></div></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-rose-500" /><div><p className="text-xs text-navy-500 dark:text-slate-400">Risk Assessments</p><p className="font-display text-lg font-bold text-navy-900 dark:text-white">{risks.length}</p></div></div></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2"><Pill className="h-4 w-4 text-cyan-500" /><div><p className="text-xs text-navy-500 dark:text-slate-400">Medications</p><p className="font-display text-lg font-bold text-navy-900 dark:text-white">{meds.filter((m) => m.active).length} active</p></div></div></GlassCard>
        <GlassCard className="p-4"><div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-amber-500" /><div><p className="text-xs text-navy-500 dark:text-slate-400">Lab Reports</p><p className="font-display text-lg font-bold text-navy-900 dark:text-white">{labs.length}</p></div></div></GlassCard>
      </div>

      {/* Timeline */}
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Patient Timeline</h3>
        {timeline.length === 0 ? (
          <EmptyState icon={Activity} title="No records yet" description="Records will appear as the patient is screened and assessed." />
        ) : (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-2 h-[calc(100%-1rem)] w-px bg-navy-200 dark:bg-white/10" />
            {timeline.map((e, i) => (
              <motion.div key={`${e.type}-${e.id}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="relative">
                <div className={`absolute -left-5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-${e.tone}-500`}>
                  <e.icon className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{e.title}</p>
                    <span className="text-xs text-navy-400 dark:text-slate-500">{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-navy-500 dark:text-slate-400">{e.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Clinical notes */}
      {profile?.role === 'doctor' && (
        <GlassCard>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Clinical Notes</h3>
          <div className="flex gap-3">
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} className="input" rows={2} placeholder="Add a clinical note…" />
            <button onClick={addNote} disabled={!noteText.trim()} className="btn-primary text-sm whitespace-nowrap">Add Note</button>
          </div>
          <div className="mt-4 space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                <p className="text-sm text-navy-700 dark:text-slate-300">{n.content}</p>
                <p className="mt-1 text-xs text-navy-400 dark:text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
