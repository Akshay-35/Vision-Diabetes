import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Search, X, Phone, Mail, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, EmptyState, Spinner, Badge } from '@/components/ui';
import { getPatients, createPatient } from '@/lib/data';
import type { Patient } from '@/types';

export function Patients() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => getPatients().then(setPatients).catch(() => setPatients([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (p.email ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Patients</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{patients.length} registered</p>
        </div>
        {profile?.role === 'doctor' && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Register Patient
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="input pl-11"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={query ? 'Try a different search.' : 'Register your first patient to get started.'}
          action={profile?.role === 'doctor' && !query ? <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Register Patient</button> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <GlassCard hover>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 font-bold text-white">
                      {p.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-white">{p.full_name}</p>
                      {p.diabetes_type && <Badge tone="royal">{p.diabetes_type.replace('_', ' ')}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-navy-600 dark:text-slate-300">
                  {p.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-navy-400" /> {p.email}</p>}
                  {p.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-navy-400" /> {p.phone}</p>}
                  {p.diabetes_duration_years != null && <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-navy-400" /> {p.diabetes_duration_years} years diabetes</p>}
                </div>
                <button
                  onClick={() => nav(`/app/records?patient=${p.id}`)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-50 py-2 text-sm font-semibold text-royal-700 hover:bg-royal-50 dark:bg-white/5 dark:text-cyan-200 dark:hover:bg-white/10"
                >
                  <Activity className="h-3.5 w-3.5" /> View Records
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && <PatientForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function PatientForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: 'male', phone: '', email: '',
    diabetes_type: 'type_2', diabetes_duration_years: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createPatient({
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender as Patient['gender'],
        phone: form.phone || null,
        email: form.email || null,
        diabetes_type: form.diabetes_type as Patient['diabetes_type'],
        diabetes_duration_years: form.diabetes_duration_years ? Number(form.diabetes_duration_years) : null,
        doctor_id: profile?.id ?? null,
        hospital_id: profile?.hospital_id ?? null,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Register Patient</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Diabetes Type</label>
              <select value={form.diabetes_type} onChange={(e) => setForm({ ...form, diabetes_type: e.target.value })} className="input">
                <option value="type_1">Type 1</option>
                <option value="type_2">Type 2</option>
                <option value="gestational">Gestational</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Diabetes Duration (years)</label>
              <input type="number" min="0" value={form.diabetes_duration_years} onChange={(e) => setForm({ ...form, diabetes_duration_years: e.target.value })} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Patient'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
