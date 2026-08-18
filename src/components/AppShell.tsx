import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, LayoutDashboard, Users, ScanLine, HeartPulse, Pill, FileText,
  FlaskConical, CalendarDays, Stethoscope, ShieldCheck, LogOut, Moon, Sun,
  Brain, LineChart, Building2, ScrollText, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ROLE_LABELS, type Role } from '@/types';

type IconType = typeof LayoutDashboard;

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  roles: Role[];
  group: string;
}

const nav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'hospital_admin', 'doctor', 'lab_tech', 'patient'], group: 'Overview' },
  { to: '/app/patients', label: 'Patients', icon: Users, roles: ['super_admin', 'hospital_admin', 'doctor', 'lab_tech'], group: 'Clinical' },
  { to: '/app/screening', label: 'Retinal Screening', icon: ScanLine, roles: ['doctor', 'hospital_admin'], group: 'Clinical' },
  { to: '/app/risk', label: 'Risk Prediction', icon: HeartPulse, roles: ['doctor', 'hospital_admin'], group: 'Clinical' },
  { to: '/app/progression', label: 'Progression', icon: LineChart, roles: ['doctor', 'patient', 'hospital_admin'], group: 'Clinical' },
  { to: '/app/explainable', label: 'Explainable AI', icon: Brain, roles: ['doctor', 'hospital_admin'], group: 'Clinical' },
  { to: '/app/medications', label: 'Medications', icon: Pill, roles: ['doctor', 'patient'], group: 'Patient Care' },
  { to: '/app/labs', label: 'Lab Reports', icon: FlaskConical, roles: ['doctor', 'lab_tech', 'patient'], group: 'Patient Care' },
  { to: '/app/appointments', label: 'Appointments', icon: CalendarDays, roles: ['doctor', 'patient', 'hospital_admin'], group: 'Patient Care' },
  { to: '/app/records', label: 'Health Records', icon: Stethoscope, roles: ['doctor', 'patient', 'hospital_admin'], group: 'Patient Care' },
  { to: '/app/reports', label: 'Reports', icon: FileText, roles: ['doctor', 'patient'], group: 'Patient Care' },
  { to: '/app/assistant', label: 'AI Assistant', icon: Brain, roles: ['doctor', 'patient', 'hospital_admin'], group: 'Insights' },
  { to: '/app/analytics', label: 'Analytics', icon: LineChart, roles: ['super_admin', 'hospital_admin', 'doctor'], group: 'Insights' },
  { to: '/app/hospitals', label: 'Hospitals', icon: Building2, roles: ['super_admin'], group: 'Administration' },
  { to: '/app/users', label: 'Users', icon: ShieldCheck, roles: ['super_admin', 'hospital_admin'], group: 'Administration' },
  { to: '/app/audit', label: 'Audit Logs', icon: ScrollText, roles: ['super_admin'], group: 'Administration' },
];

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const groups = Array.from(new Set(items.map((i) => i.group)));
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3 no-scrollbar">
      {groups.map((group) => (
        <div key={group}>
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-400 dark:text-slate-500">{group}</p>
          <div className="space-y-0.5">
            {items.filter((i) => i.group === group).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-royal-700 dark:text-cyan-200'
                      : 'text-navy-600 hover:bg-navy-50 dark:text-slate-300 dark:hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-royal-500/15 to-cyan-500/10 shadow-glow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <item.icon className={`relative h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-royal-600 dark:text-cyan-300' : ''}`} />
                    <span className="relative">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserCard({ profile, onSignOut }: { profile: NonNullable<ReturnType<typeof useAuth>['profile']>; onSignOut: () => void }) {
  return (
    <div className="border-t border-navy-100 p-3 dark:border-white/10">
      <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 text-sm font-bold text-white">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{profile.full_name}</p>
          <p className="truncate text-xs text-navy-500 dark:text-slate-400">{ROLE_LABELS[profile.role]}</p>
        </div>
        <button
          onClick={onSignOut}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-navy-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, toggle, className = '' }: { theme: string; toggle: () => void; className?: string }) {
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`grid h-9 w-9 place-items-center rounded-xl border border-navy-200 text-navy-700 transition hover:bg-navy-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 ${className}`}
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function AppShell() {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!profile) return null;
  const items = nav.filter((n) => n.roles.includes(profile.role));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-navy-50/40 dark:bg-navy-950">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-navy-100 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/60 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-royal-600 to-cyan-500 shadow-glow-sm">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-base font-bold text-navy-900 dark:text-white">
            VisionDiab <span className="text-gradient">AI</span>
          </span>
        </div>
        <NavLinks items={items} />
        <UserCard profile={profile} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/60 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-royal-600 to-cyan-500">
            <Eye className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-sm font-bold text-navy-900 dark:text-white">VisionDiab AI</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} toggle={toggle} />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-xl border border-navy-200 text-navy-700 dark:border-white/10 dark:text-slate-200"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-navy-100 bg-white dark:border-white/10 dark:bg-navy-900 lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-royal-600 to-cyan-500">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display text-sm font-bold text-navy-900 dark:text-white">VisionDiab AI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavLinks items={items} onNavigate={() => setMobileOpen(false)} />
              <UserCard profile={profile} onSignOut={handleSignOut} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
        <ThemeToggle theme={theme} toggle={toggle} className="shadow-card" />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
