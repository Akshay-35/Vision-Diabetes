import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { GlassCard, Spinner, EmptyState, Badge } from '@/components/ui';
import { getAuditLogs } from '@/lib/data';
import type { AuditLog } from '@/types';

export function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAuditLogs().then(setLogs).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="py-20"><Spinner className="mx-auto h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">Platform activity trail · last 100 events</p>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit logs" description="Activity will be logged here as users interact with the platform." />
      ) : (
        <GlassCard>
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-royal-50 text-royal-600 dark:bg-royal-500/10 dark:text-royal-300">
                    <ScrollText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{l.action}</p>
                    {l.target && <p className="text-xs text-navy-500 dark:text-slate-400">target: {l.target}</p>}
                  </div>
                </div>
                <Badge tone="slate">{new Date(l.created_at).toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
