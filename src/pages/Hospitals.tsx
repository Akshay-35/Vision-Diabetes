import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Plus, X, MapPin } from 'lucide-react';
import { GlassCard, Spinner, EmptyState } from '@/components/ui';
import { getHospitals, createHospital } from '@/lib/data';
import type { Hospital } from '@/types';

export function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => getHospitals().then(setHospitals).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Hospitals</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{hospitals.length} registered</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Hospital</button>
      </div>

      {hospitals.length === 0 ? (
        <EmptyState icon={Building2} title="No hospitals" description="Add your first hospital to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h) => (
            <GlassCard key={h.id} hover>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-navy-900 dark:text-white">{h.name}</h3>
              {(h.city || h.country) && <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500 dark:text-slate-400"><MapPin className="h-3.5 w-3.5" /> {[h.city, h.country].filter(Boolean).join(', ')}</p>}
              <p className="mt-2 text-xs text-navy-400 dark:text-slate-500">Added {new Date(h.created_at).toLocaleDateString()}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && <HospitalForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function HospitalForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', city: '', country: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await createHospital(form); onSaved(); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Add Hospital</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label">Hospital Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div><label className="label">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></div>
          <div><label className="label">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
