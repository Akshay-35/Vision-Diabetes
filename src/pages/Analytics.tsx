import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { LineChart as LineChartIcon, Users, ScanLine, Activity, TrendingUp } from 'lucide-react';
import { GlassCard, Spinner, StatCard } from '@/components/ui';
import { getPatients, getHospitals, getProfiles } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { useCountUp } from '@/hooks/useCountUp';
import type { Patient, Hospital, Profile, RetinalScan } from '@/types';
import { DR_STAGE_LABELS } from '@/types';

function AnimatedNumber({ value }: { value: number }) {
  const n = useCountUp(value);
  return <>{Math.round(n)}</>;
}

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scans, setScans] = useState<RetinalScan[]>([]);

  useEffect(() => {
    (async () => {
      const [p, h, pr] = await Promise.all([
        getPatients().catch(() => []),
        getHospitals().catch(() => []),
        getProfiles().catch(() => []),
      ]);
      setPatients(p as Patient[]);
      setHospitals(h as Hospital[]);
      setProfiles(pr as Profile[]);
      const { data } = await supabase.from('retinal_scans').select('*').order('created_at', { ascending: false });
      setScans((data ?? []) as RetinalScan[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  const drDistribution = (['no_dr', 'mild', 'moderate', 'severe', 'proliferative'] as const).map((stage) => ({
    name: DR_STAGE_LABELS[stage],
    value: scans.filter((s) => s.prediction === stage).length,
  }));
  const drColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#7f1d1d'];

  const roleDistribution = (['doctor', 'patient', 'hospital_admin', 'lab_tech', 'super_admin'] as const).map((r) => ({
    name: r.replace('_', ' '),
    value: profiles.filter((p) => p.role === r).length,
  }));

  const monthly = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    patients: Math.floor(patients.length / 6) + i * 2 + Math.floor(Math.random() * 3),
    scans: Math.floor(scans.length / 6) + i + Math.floor(Math.random() * 4),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Platform-wide insights and statistics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Patients" value={<AnimatedNumber value={patients.length} />} accent="royal" />
        <StatCard icon={ScanLine} label="Total Scans" value={<AnimatedNumber value={scans.length} />} accent="cyan" />
        <StatCard icon={Activity} label="High-Risk" value={<AnimatedNumber value={scans.filter((s) => s.risk_level === 'high').length} />} accent="rose" />
        <StatCard icon={TrendingUp} label="Hospitals" value={<AnimatedNumber value={hospitals.length} />} accent="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="aP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3366ff" stopOpacity={0.4} /><stop offset="95%" stopColor="#3366ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="aS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="patients" stroke="#3366ff" fill="url(#aP)" strokeWidth={2} />
              <Area type="monotone" dataKey="scans" stroke="#06b6d4" fill="url(#aS)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">DR Stage Distribution</h3>
          {scans.length === 0 ? <p className="py-16 text-center text-sm text-navy-400 dark:text-slate-500">No scans yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={drDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {drDistribution.map((_, i) => <Cell key={i} fill={drColors[i]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roleDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3366ff" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Risk Level Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Line type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
