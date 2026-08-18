import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Plus, X, Check, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, Spinner, EmptyState, Badge } from '@/components/ui';
import { getPatients, getAppointments, createAppointment, updateAppointment } from '@/lib/data';
import type { Patient, Appointment } from '@/types';

export function Appointments() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getAppointments(patientId || undefined).then(setAppts).catch(() => setAppts([]));
  }, [patientId]);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const isDoctor = profile?.role === 'doctor';
  const upcoming = appts.filter((a) => new Date(a.scheduled_at) > new Date() && a.status === 'scheduled');
  const past = appts.filter((a) => new Date(a.scheduled_at) <= new Date() || a.status !== 'scheduled');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Appointments</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Schedule and manage patient visits.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDoctor && <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-auto">
            <option value="">All patients</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>}
          {isDoctor && <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Schedule</button>}
        </div>
      </div>

      {appts.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" description={isDoctor ? 'Schedule a visit to get started.' : 'Your appointments will appear here.'} />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">Upcoming</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((a) => <ApptCard key={a.id} appt={a} isDoctor={isDoctor} onComplete={() => updateAppointment(a.id, { status: 'completed' }).then(() => getAppointments(patientId || undefined).then(setAppts))} />)}
            </div>
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-slate-400">History</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((a) => <ApptCard key={a.id} appt={a} isDoctor={false} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && <ApptForm patientId={patientId} doctorId={profile?.id ?? ''} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); getAppointments(patientId || undefined).then(setAppts); }} />}
    </div>
  );
}

function ApptCard({ appt, isDoctor, onComplete }: { appt: Appointment; isDoctor: boolean; onComplete?: () => void }) {
  const statusTone = appt.status === 'completed' ? 'green' : appt.status === 'cancelled' ? 'rose' : 'royal';
  return (
    <GlassCard hover>
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
          <CalendarDays className="h-5 w-5" />
        </div>
        <Badge tone={statusTone as 'green' | 'rose' | 'royal'}>{appt.status}</Badge>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-navy-900 dark:text-white">{appt.reason || 'Follow-up'}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600 dark:text-slate-300"><Clock className="h-3.5 w-3.5" /> {new Date(appt.scheduled_at).toLocaleString()}</p>
      {appt.notes && <p className="mt-2 text-xs text-navy-400 dark:text-slate-500">{appt.notes}</p>}
      {isDoctor && appt.status === 'scheduled' && onComplete && (
        <button onClick={onComplete} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5" /> Mark Completed
        </button>
      )}
    </GlassCard>
  );
}

function ApptForm({ patientId, doctorId, onClose, onSaved }: { patientId: string; doctorId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ scheduled_at: '', reason: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAppointment({
        patient_id: patientId, doctor_id: doctorId,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        reason: form.reason, status: 'scheduled', notes: form.notes || null,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Schedule Appointment</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label">Date & Time</label><input type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="input" /></div>
          <div><label className="label">Reason</label><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input" placeholder="Retinal screening follow-up" /></div>
          <div><label className="label">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
