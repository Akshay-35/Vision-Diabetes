import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye,
  ScanLine,
  Brain,
  Activity,
  ShieldCheck,
  FileText,
  LineChart,
  Users,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Database,
  Stethoscope,
  Microscope,
  Bell,
  Moon,
  Sun,
  Lock,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { SectionHeading } from '@/components/ui';

const features = [
  { icon: ScanLine, title: 'AI Retinal Screening', desc: 'Deep-learning classification of diabetic retinopathy across five severity stages with Grad-CAM explainability.' },
  { icon: HeartPulse, title: 'Complication Risk Prediction', desc: 'ML-powered risk assessment for neuropathy, kidney disease, cardiovascular events, stroke, and vision loss.' },
  { icon: Brain, title: 'Explainable AI', desc: 'Grad-CAM heatmaps and SHAP-style feature attribution make every prediction transparent and auditable.' },
  { icon: LineChart, title: 'Disease Progression', desc: 'Interactive timelines compare scans, HbA1c, glucose, and risk scores to track stable, improving, or progressing conditions.' },
  { icon: Database, title: 'Digital Health Records', desc: 'A unified patient timeline of scans, labs, prescriptions, notes, and AI predictions — all in one secure record.' },
  { icon: FileText, title: 'AI-Assisted Reports', desc: 'Professional PDF reports with predictions, confidence, heatmaps, risk factors, and clear clinical disclaimers.' },
];

const steps = [
  { icon: Users, title: 'Register Patient', desc: 'Doctors create a secure digital health record in seconds.' },
  { icon: ScanLine, title: 'Upload Retinal Scan', desc: 'Fundus images are sent to the AI model service for analysis.' },
  { icon: Brain, title: 'AI Analysis', desc: 'Deep learning predicts DR stage with Grad-CAM explainability.' },
  { icon: HeartPulse, title: 'Risk Assessment', desc: 'Clinical inputs generate complication risk with SHAP-style factors.' },
  { icon: FileText, title: 'Generate Report', desc: 'A clinical decision support report is produced for the physician.' },
];

const roles = [
  { icon: ShieldCheck, label: 'Super Admin', desc: 'Platform, users, hospitals, audit logs' },
  { icon: Stethoscope, label: 'Doctor', desc: 'Screening, risk, records, reports' },
  { icon: Users, label: 'Hospital Admin', desc: 'Doctors, patients, appointments' },
  { icon: Microscope, label: 'Lab Technician', desc: 'Lab reports, OCR, test results' },
  { icon: HeartPulse, label: 'Patient', desc: 'Records, results, medications' },
];

export function Landing() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how', label: 'How It Works' },
    { href: '#roles', label: 'Roles' },
    { href: '#disclaimer', label: 'About' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white dark:bg-navy-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-royal-500/20 blur-[120px] dark:bg-royal-500/25" />
        <div className="absolute top-1/3 right-0 h-[35rem] w-[35rem] rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-500/20" />
        <div className="absolute inset-0 bg-grid opacity-60" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-white/40 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-royal-600 to-cyan-500 shadow-glow-sm">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 dark:text-white">
              VisionDiab <span className="text-gradient">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-navy-600 dark:text-slate-300 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="relative transition-colors hover:text-royal-600 dark:hover:text-cyan-300 after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-royal-500 after:transition-all after:duration-300 hover:after:w-full">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-xl border border-navy-200 text-navy-700 transition hover:bg-navy-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
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
            <Link to="/signin" className="btn-ghost hidden text-sm sm:inline-flex">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-xl border border-navy-200 text-navy-700 dark:border-white/10 dark:text-slate-200 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white p-6 dark:bg-navy-900 md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-navy-900 dark:text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-navy-50 dark:hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-navy-600 transition hover:bg-royal-50 hover:text-royal-700 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mt-6 space-y-3 border-t border-navy-100 pt-6 dark:border-white/10">
                <Link to="/signin" onClick={() => setMobileOpen(false)} className="btn-ghost w-full text-sm">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-sm">Get Started</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" /> Clinical Decision Support System
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-navy-900 dark:text-white sm:text-6xl lg:text-7xl">
              See Beyond <br className="hidden sm:block" /> the Eye.
              <br />
              <span className="text-gradient">Predict. Prevent.</span>
              <br />
              Protect.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy-600 dark:text-slate-300">
              An intelligent AI-powered clinical decision support platform combining retinal image analysis, diabetes complication risk prediction, and digital patient health intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary">
                Explore VisionDiab AI <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="btn-ghost">
                How It Works
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-navy-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-royal-500" /> HIPAA-aware design</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-500" /> Explainable AI</div>
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-royal-500" /> Multi-disease ready</div>
            </div>
          </motion.div>

          {/* Animated retinal visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-royal-500/30 to-cyan-500/30 blur-2xl" />
            <div className="relative h-full w-full rounded-full border border-white/40 bg-gradient-to-br from-navy-800 to-navy-950 p-8 dark:border-white/10">
              {/* Retina mock */}
              <div className="relative h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,80,80,0.9),rgba(180,40,40,0.7)_30%,rgba(80,20,20,0.5)_60%,rgba(10,10,30,0.95))]">
                <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-glow" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-900" />
                {/* Vessels */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-70">
                  {[0, 60, 120, 180, 240, 300].map((a) => (
                    <line key={a} x1="100" y1="100" x2={100 + 80 * Math.cos((a * Math.PI) / 180)} y2={100 + 80 * Math.sin((a * Math.PI) / 180)} stroke="rgba(255,200,200,0.4)" strokeWidth="1.5" />
                  ))}
                </svg>
                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-cyan-300 shadow-glow-cyan"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Floating glass cards */}
              <motion.div
                className="absolute -left-6 top-6 w-44 glass-card p-3"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500">DR Prediction</p>
                <p className="mt-1 font-display text-sm font-bold text-navy-900 dark:text-white">Moderate DR</p>
              </motion.div>
              <motion.div
                className="absolute -right-4 top-1/3 w-40 glass-card p-3"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-royal-500">Confidence</p>
                <p className="mt-1 font-display text-sm font-bold text-navy-900 dark:text-white">94.2%</p>
              </motion.div>
              <motion.div
                className="absolute -left-2 bottom-4 w-44 glass-card p-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">Complication Risk</p>
                <p className="mt-1 font-display text-sm font-bold text-navy-900 dark:text-white">High · 72%</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-navy-100 dark:border-white/10 bg-navy-50/50 dark:bg-navy-900/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {[
            { v: '5', l: 'DR Severity Stages' },
            { v: '6', l: 'Complication Risks' },
            { v: '5', l: 'Role-Based Dashboards' },
            { v: 'XAI', l: 'Explainable AI' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-4xl font-bold text-gradient">{s.v}</p>
              <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          center
          eyebrow="Why VisionDiab AI"
          title="A complete AI clinical decision support platform"
          subtitle="From retinal screening to complication risk prediction, explainable AI, and digital health records — unified in one premium experience."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass-card p-6 transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-navy-600 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-navy-100 dark:border-white/10 bg-navy-50/40 dark:bg-navy-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading
            center
            eyebrow="How It Works"
            title="From scan to clinical insight in five steps"
            subtitle="A clean model-service architecture lets real trained models integrate later without redesign."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative glass-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-royal-600 to-cyan-500 text-white">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl font-bold text-navy-200 dark:text-white/15">0{i + 1}</span>
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold text-navy-900 dark:text-white">{s.title}</h3>
                <p className="mt-1 text-xs text-navy-500 dark:text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          center
          eyebrow="Role-Based Access"
          title="Built for every member of the care team"
          subtitle="Secure JWT authentication with role-based access control across five specialized dashboards."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {roles.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass-card p-5 text-center"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-royal-500/20 to-cyan-500/20 text-royal-600 dark:text-cyan-300">
                <r.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-navy-900 dark:text-white">{r.label}</h3>
              <p className="mt-1 text-xs text-navy-500 dark:text-slate-400">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section id="disclaimer" className="border-t border-navy-100 dark:border-white/10 bg-navy-50/40 dark:bg-navy-900/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-navy-900 dark:text-white">Clinical Decision Support, Not a Diagnosis</h2>
          <p className="mt-4 text-navy-600 dark:text-slate-300">
            VisionDiab AI is a clinical decision support system. It does not replace doctors or provide definitive medical diagnoses.
            All AI predictions are screening or risk indicators. Final diagnosis and treatment decisions remain with qualified healthcare professionals.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-royal-900 to-navy-800 p-12 text-center shadow-glow sm:p-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">Ready to see beyond the eye?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-navy-200">
            Join the next generation of AI-assisted clinical decision support. Create your account and explore the platform.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-primary">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/signin" className="btn-ghost border-white/20 text-white hover:bg-white/10">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-100 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-royal-600 to-cyan-500">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-navy-900 dark:text-white">VisionDiab AI</span>
          </div>
          <p className="text-sm text-navy-500 dark:text-slate-400">See Beyond the Eye. Predict. Prevent. Protect.</p>
          <p className="text-xs text-navy-400 dark:text-slate-500">Clinical Decision Support System · Not a medical device</p>
        </div>
      </footer>
    </div>
  );
}
