import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/types';

export function SignIn() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else nav('/app');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your VisionDiab AI account">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@hospital.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign In'} {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-royal-600 hover:underline dark:text-cyan-300">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function SignUp() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('doctor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) setError(error);
    else setDone(true);
  };

  if (done) {
    return (
      <AuthShell title="Account created" subtitle="Check your email to confirm, then sign in">
        <Link to="/signin" className="btn-primary w-full">Go to Sign In</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Join VisionDiab AI as part of the care team">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className="label">Full Name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Dr. Jane Smith" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@hospital.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 6 characters" />
        </div>
        <div>
          <label className="label">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create Account'} {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/signin" className="font-semibold text-royal-600 hover:underline dark:text-cyan-300">Sign in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12 dark:bg-navy-950">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-royal-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[25rem] w-[25rem] rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-royal-600 to-cyan-500 shadow-glow-sm">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-navy-900 dark:text-white">
            VisionDiab <span className="text-gradient">AI</span>
          </span>
        </Link>
        <div className="glass-card p-8">
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
