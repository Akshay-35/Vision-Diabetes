import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

export function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`glass-card p-5 ${hover ? 'transition-all hover:shadow-glow hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'royal',
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  accent?: 'royal' | 'cyan' | 'green' | 'amber' | 'rose';
  sub?: string;
}) {
  const accents: Record<string, string> = {
    royal: 'from-royal-500/20 to-royal-500/5 text-royal-600 dark:text-royal-300',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-300',
    green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-300',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-300',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-300',
  };
  return (
    <GlassCard hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-navy-400 dark:text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-3 ${accents[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}

export function Badge({
  children,
  tone = 'royal',
}: {
  children: ReactNode;
  tone?: 'royal' | 'cyan' | 'green' | 'amber' | 'rose' | 'slate';
}) {
  const tones: Record<string, string> = {
    royal: 'bg-royal-50 text-royal-700 dark:bg-royal-500/15 dark:text-royal-300',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' }) {
  const map = {
    low: { tone: 'green' as const, label: 'Low Risk' },
    moderate: { tone: 'amber' as const, label: 'Moderate Risk' },
    high: { tone: 'rose' as const, label: 'High Risk' },
  };
  return <Badge tone={map[level].tone}>{map[level].label}</Badge>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-navy-600 dark:text-slate-300">{subtitle}</p>}
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 dark:border-white/10 px-6 py-16 text-center">
      <div className="rounded-2xl bg-royal-50 p-4 text-royal-500 dark:bg-royal-500/10 dark:text-royal-300">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-navy-800 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-navy-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 text-navy-500 dark:text-slate-400 ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
}
