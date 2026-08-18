import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pill, Plus, X, Check, Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, Spinner, EmptyState, Badge } from '@/components/ui';
import { getPatients, getMedications, createMedication, updateMedication } from '@/lib/data';
import type { Patient, Medication } from '@/types';

export function Medications() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!patientId) return;
    getMedications(patientId).then(setMeds).catch(() => setMeds([]));
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const isDoctor = profile?.role === 'doctor';
  const active = meds.filter((m) => m.active);
  const inactive = meds.filter((m) => !m.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Medication Monitoring</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Track prescriptions, adherence, and reminders.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          {isDoctor && <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add</button>}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        VisionDiab AI does not prescribe, change, or stop medication. Doctors must review all medication-related concerns.
      </div>

      {meds.length === 0 ? (
        <EmptyState icon={Pill} title="No medications" description={isDoctor ? 'Add a prescription to get started.' : 'Your doctor will add medications here.'} />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Active</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((m) => <MedCard key={m.id} med={m} isDoctor={isDoctor} onToggle={() => updateMedication(m.id, { active: !m.active }).then(() => getMedications(patientId).then(setMeds))} />)}
            </div>
          </div>
          {inactive.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Inactive</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactive.map((m) => <MedCard key={m.id} med={m} isDoctor={isDoctor} onToggle={() => updateMedication(m.id, { active: !m.active }).then(() => getMedications(patientId).then(setMeds))} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && <MedForm patientId={patientId} doctorId={profile?.id ?? ''} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); getMedications(patientId).then(setMeds); }} />}
    </div>
  );
}

function MedCard({ med, isDoctor, onToggle }: { med: Medication; isDoctor: boolean; onToggle: () => void }) {
  return (
    <GlassCard hover>
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
          <Pill className="h-5 w-5" />
        </div>
        {med.active ? <Badge tone="green">Active</Badge> : <Badge tone="slate">Inactive</Badge>}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-navy-900 dark:text-white">{med.name}</h3>
      <div className="mt-2 space-y-1 text-sm text-navy-600 dark:text-slate-300">
        {med.dosage && <p>Dosage: {med.dosage}</p>}
        {med.frequency && <p>Frequency: {med.frequency}</p>}
        {med.duration && <p>Duration: {med.duration}</p>}
        {med.notes && <p className="text-xs text-navy-400 dark:text-slate-500">{med.notes}</p>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-300"><Bell className="h-3 w-3" /> Adherence reminder</span>
      </div>
      {isDoctor && (
        <button onClick={onToggle} className="mt-3 w-full rounded-xl bg-navy-50 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-100 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
          {med.active ? 'Mark Inactive' : 'Reactivate'}
        </button>
      )}
    </GlassCard>
  );
}

function MedForm({ patientId, doctorId, onClose, onSaved }: { patientId: string; doctorId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', duration: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMedication({ patient_id: patientId, doctor_id: doctorId, ...form, active: true });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Add Medication</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label">Medication Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Dosage</label><input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="input" placeholder="500mg" /></div>
            <div><label className="label">Frequency</label><input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="input" placeholder="2x daily" /></div>
          </div>
          <div><label className="label">Duration</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input" placeholder="30 days" /></div>
          <div><label className="label">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
