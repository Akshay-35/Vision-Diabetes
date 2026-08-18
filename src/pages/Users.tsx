import { useEffect, useState } from 'react';
import { ShieldCheck, Mail, Building2 } from 'lucide-react';
import { GlassCard, Spinner, EmptyState, Badge } from '@/components/ui';
import { getProfiles, updateProfileRole, getHospitals } from '@/lib/data';
import type { Profile, Hospital, Role } from '@/types';
import { ROLE_LABELS } from '@/types';

export function Users() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getProfiles(), getHospitals()]).then(([p, h]) => { setProfiles(p); setHospitals(h); }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const hospitalName = (id: string | null) => hospitals.find((h) => h.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{profiles.length} users · manage roles</p>
      </div>

      {profiles.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No users" description="Users will appear here once they sign up." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <GlassCard key={p.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 font-bold text-white">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{p.full_name}</p>
                    <p className="flex items-center gap-1 text-xs text-navy-500 dark:text-slate-400"><Mail className="h-3 w-3" /> {p.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone="royal">{ROLE_LABELS[p.role]}</Badge>
                <span className="flex items-center gap-1 text-xs text-navy-500 dark:text-slate-400"><Building2 className="h-3 w-3" /> {hospitalName(p.hospital_id)}</span>
              </div>
              <div className="mt-3">
                <label className="label text-xs">Role</label>
                <select
                  value={p.role}
                  onChange={(e) => updateProfileRole(p.id, e.target.value as Role).then(load)}
                  className="input py-2 text-sm"
                >
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
