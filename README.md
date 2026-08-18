# VisionDiab AI — Full-Stack Setup Guide

**An Intelligent Multi-Disease Retinal Screening and Diabetes Complication Risk Prediction Platform**

> See Beyond the Eye. Predict. Prevent. Protect.

VisionDiab AI is a full-stack clinical decision support platform combining retinal fundus image analysis, diabetic retinopathy detection, diabetes complication risk prediction, explainable AI, and digital patient health intelligence.

---

## Architecture Overview

```
visiondiab-ai/
├── src/                          # FRONTEND (React + TypeScript + Vite)
│   ├── components/
│   │   ├── AppShell.tsx          # Sidebar nav, mobile drawer, layout
│   │   ├── RetinalHeatmap.tsx    # Grad-CAM heatmap overlay component
│   │   └── ui.tsx                # Reusable UI primitives (cards, badges, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx       # Supabase auth + role-based access
│   │   └── ThemeContext.tsx      # Dark/light mode
│   ├── hooks/
│   │   └── useCountUp.ts         # Animated number counter
│   ├── lib/
│   │   ├── ai.ts                 # AI model service client (calls edge function)
│   │   ├── data.ts               # Database CRUD layer (Supabase queries)
│   │   └── supabase.ts           # Supabase client initialization
│   ├── pages/                    # 15 feature pages
│   │   ├── Landing.tsx           # Cinematic marketing page
│   │   ├── Auth.tsx              # Sign in / Sign up
│   │   ├── Dashboard.tsx         # Role-adaptive dashboard
│   │   ├── Patients.tsx          # Patient management
│   │   ├── Screening.tsx         # AI retinal screening + Grad-CAM
│   │   ├── RiskPrediction.tsx    # Diabetes complication risk (6 categories)
│   │   ├── Progression.tsx       # Disease progression charts
│   │   ├── Explainable.tsx       # XAI / SHAP-style explanations
│   │   ├── Medications.tsx       # Medication tracking
│   │   ├── Labs.tsx              # Lab reports + OCR extraction
│   │   ├── Appointments.tsx      # Appointment scheduling
│   │   ├── Records.tsx           # Digital health records + timeline
│   │   ├── Reports.tsx           # PDF report generation
│   │   ├── Assistant.tsx         # AI healthcare assistant
│   │   ├── Analytics.tsx         # Analytics dashboards
│   │   ├── Hospitals.tsx         # Hospital management (super admin)
│   │   ├── Users.tsx             # User management
│   │   └── Audit.tsx             # Audit logs
│   ├── types/index.ts            # TypeScript types
│   ├── App.tsx                   # Router + route guards
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Tailwind + custom styles
│
├── supabase/                     # BACKEND (Supabase)
│   ├── migrations/
│   │   └── 20260728143752_create_visiondiab_schema.sql   # Full database schema + RLS
│   └── functions/
│       └── visiondiab-ai/
│           └── index.ts          # AI model service (edge function)
│
├── .env                          # Environment variables (Supabase URL + keys)
├── package.json                  # Dependencies + scripts
├── vite.config.ts                # Vite config
├── tailwind.config.js           # Tailwind theme
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Tech Stack

| Layer        | Technology                                              |
|--------------|--------------------------------------------------------|
| Frontend     | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Charts       | Recharts                                               |
| Icons        | Lucide React                                           |
| PDF          | jsPDF + html2canvas                                    |
| Backend      | Supabase (PostgreSQL, Auth, Edge Functions, Storage)  |
| AI Service   | Supabase Edge Function (Deno runtime)                 |
| Database     | PostgreSQL with Row-Level Security (RLS)              |

---

## Prerequisites

- **Node.js** v18 or higher — download from https://nodejs.org
- **npm** (comes with Node.js)

---

## Setup Instructions

### Step 1: Unzip and install dependencies

```bash
unzip visiondiab-ai.zip
cd visiondiab-ai
npm install
```

### Step 2: Configure environment variables

The `.env` file is included with pre-configured Supabase credentials. It contains:

```
VITE_SUPABASE_URL=https://onztbdqrldlmoezcqusq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These connect to the already-provisioned Supabase project with the database schema and AI edge function deployed. No additional setup needed.

### Step 3: Run the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### Step 4: Create your first account

1. Open http://localhost:5173 in your browser
2. Click "Get Started" on the landing page
3. Sign up with any email and password
4. You'll be assigned the "patient" role by default
5. To access doctor/admin features, change your role in the Supabase dashboard (profiles table)

---

## Available Commands

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start dev server (http://localhost:5173) |
| `npm run build`      | Production build to `dist/` folder   |
| `npm run typecheck`  | TypeScript type checking             |
| `npm run lint`       | ESLint code checking                 |
| `npm run preview`    | Preview the production build locally |

---

## Backend Details

### Database Schema (10 tables)

The migration file `supabase/migrations/20260728143752_create_visiondiab_schema.sql` creates:

1. **hospitals** — healthcare organizations
2. **profiles** — user accounts with roles (super_admin, hospital_admin, doctor, lab_tech, patient)
3. **patients** — patient demographics + diabetes metadata
4. **retinal_scans** — AI screening results (DR stage, confidence, Grad-CAM data, factors)
5. **risk_assessments** — diabetes complication risk predictions with SHAP-style factors
6. **medications** — prescribed medications
7. **lab_reports** — lab reports with OCR-extracted values
8. **appointments** — scheduled visits
9. **clinical_notes** — doctor's notes
10. **audit_logs** — activity audit trail

Every table has **Row-Level Security (RLS)** enabled with per-CRUD-verb policies.

### AI Model Service (Edge Function)

Location: `supabase/functions/visiondiab-ai/index.ts`

Two endpoints:

- **POST /classify** — Retinal DR classification
  - Input: `{ image_id: string }`
  - Output: prediction, confidence, risk level, contributing factors, AI analysis, heatmap region

- **POST /risk** — Diabetes complication risk assessment
  - Input: `{ inputs: {...}, category: string }`
  - Output: risk percent, risk level, top contributing factors with SHAP-style scores

The edge function uses a seeded-deterministic mock model with realistic clinical output. The architecture is designed so real TensorFlow/PyTorch models can replace the mock without frontend changes.

---

## Roles & Permissions

| Role            | Access                                                        |
|-----------------|---------------------------------------------------------------|
| Super Admin     | Everything + hospitals, users, audit logs                     |
| Hospital Admin  | Dashboard, patients, screening, risk, analytics, users       |
| Doctor          | Clinical features, patient care, reports, assistant          |
| Lab Tech        | Patients, lab reports                                         |
| Patient         | Own records, medications, appointments, progression, reports |

---

## Features

- Cinematic landing page with animated retinal AI visual
- JWT authentication with role-based access control
- Role-based adaptive dashboards
- AI Retinal Screening with Grad-CAM heatmap explainability
- Diabetes Complication Risk Prediction (6 categories) with SHAP-style charts
- Disease Progression Monitoring with interactive charts
- Medication & Health Monitoring
- Digital Patient Health Records with unified timeline
- OCR Laboratory Report extraction with doctor confirmation
- AI Healthcare Assistant
- PDF Report generation
- Analytics dashboards
- Audit logs
- Dark / Light mode
- Fully responsive (mobile, tablet, desktop)

---

## Important Disclaimer

VisionDiab AI is a **Clinical Decision Support System**. It does **not** replace doctors or provide definitive medical diagnoses. All AI predictions are screening or risk indicators. Final diagnosis and treatment decisions remain with qualified healthcare professionals.

---

## Troubleshooting

**"npm install fails"**
- Ensure Node.js v18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then retry

**"Blank page on localhost"**
- Check that `.env` file exists with correct Supabase URL and anon key
- Check browser console for errors

**"Cannot connect to database"**
- The Supabase project is cloud-hosted and should be accessible
- Verify your internet connection
- The credentials in `.env` are pre-configured and valid

**"AI screening returns error"**
- The edge function is deployed and running
- Ensure you're signed in (the function requires authentication)
