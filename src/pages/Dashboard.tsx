import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ScanLine, AlertTriangle, CalendarDays, Activity, TrendingUp,
  Building2, ShieldCheck, Stethoscope, Brain,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { StatCard, GlassCard, RiskBadge, EmptyState, Spinner } from '@/components/ui';
import { getPatients, getHospitals, getProfiles, getAppointments } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { useCountUp } from '@/hooks/useCountUp';
import type { Patient, RetinalScan, Hospital, Profile, Appointment } from '@/types';
import { DR_STAGE_LABELS } from '@/types';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const n = useCountUp(value);
  return <>{Math.round(n)}{suffix}</>;
}

export function Dashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scans, setScans] = useState<RetinalScan[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, h, pr, ap] = await Promise.all([
          getPatients().catch(() => []),
          getHospitals().catch(() => []),
          getProfiles().catch(() => []),
          getAppointments().catch(() => []),
        ]);
        setPatients(p as Patient[]);
        const { data: scanData } = await supabase.from('retinal_scans').select('*').order('created_at', { ascending: false });
        setScans((scanData ?? []) as RetinalScan[]);
        setHospitals(h as Hospital[]);
        setProfiles(pr as Profile[]);
        setAppointments(ap as Appointment[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;
  if (!profile) return null;

  const highRiskScans = scans.filter((s) => s.risk_level === 'high');
  const upcoming = appointments.filter((a) => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date());

  // Chart data
  const drDistribution = (['no_dr', 'mild', 'moderate', 'severe', 'proliferative'] as const).map((stage) => ({
    name: DR_STAGE_LABELS[stage],
    value: scans.filter((s) => s.prediction === stage).length,
  }));
  const drColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#7f1d1d'];

  const trend = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    scans: Math.floor(Math.random() * 20) + 5 + i * 2,
    risk: Math.floor(Math.random() * 10) + 2 + i,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
          Welcome back, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">
          Here's your {profile.role.replace('_', ' ')} overview.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Patients" value={<AnimatedNumber value={patients.length} />} accent="royal" />
        <StatCard icon={ScanLine} label="Retinal Scans" value={<AnimatedNumber value={scans.length} />} accent="cyan" />
        <StatCard icon={AlertTriangle} label="High-Risk Patients" value={<AnimatedNumber value={highRiskScans.length} />} accent="rose" />
        <StatCard icon={CalendarDays} label="Upcoming Appointments" value={<AnimatedNumber value={upcoming.length} />} accent="amber" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Screening Activity</h3>
              <p className="text-xs text-navy-500 dark:text-slate-400">Scans and high-risk detections over time</p>
            </div>
            <Activity className="h-5 w-5 text-royal-500" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3366ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3366ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="scans" stroke="#3366ff" fill="url(#gScans)" strokeWidth={2} />
              <Area type="monotone" dataKey="risk" stroke="#06b6d4" fill="url(#gRisk)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold text-navy-900 dark:text-white">DR Distribution</h3>
          <p className="text-xs text-navy-500 dark:text-slate-400">Across all scans</p>
          {scans.length === 0 ? (
            <div className="py-10 text-center text-sm text-navy-400 dark:text-slate-500">No scans yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={drDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {drDistribution.map((_, i) => (
                    <Cell key={i} fill={drColors[i]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(15,29,92,0.95)', border: 'none', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Recent AI predictions + appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Recent AI Predictions</h3>
          {scans.length === 0 ? (
            <EmptyState icon={Brain} title="No predictions yet" description="Upload a retinal scan to see AI results here." />
          ) : (
            <div className="space-y-3">
              {scans.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{DR_STAGE_LABELS[s.prediction]}</p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">
                      {new Date(s.created_at).toLocaleDateString()} · {(s.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                  <RiskBadge level={s.risk_level as 'low' | 'moderate' | 'high'} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900 dark:text-white">Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No appointments" description="Scheduled visits will appear here." />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{a.reason || 'Follow-up'}</p>
                    <p className="text-xs text-navy-500 dark:text-slate-400">{new Date(a.scheduled_at).toLocaleString()}</p>
                  </div>
                  <span className="badge bg-royal-50 text-royal-700 dark:bg-royal-500/15 dark:text-royal-300">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Admin extras */}
      {(profile.role === 'super_admin' || profile.role === 'hospital_admin') && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Building2} label="Hospitals" value={hospitals.length} accent="royal" />
          <StatCard icon={ShieldCheck} label="Users" value={profiles.length} accent="cyan" />
          <StatCard icon={Stethoscope} label="Doctors" value={profiles.filter((p) => p.role === 'doctor').length} accent="green" />
        </div>
      )}
    </div>
  );
}

