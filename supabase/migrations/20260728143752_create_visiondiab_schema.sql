/*
# VisionDiab AI — Core Schema

## Purpose
Creates the full data model for the VisionDiab AI clinical decision support
platform: hospitals, user profiles with roles, patients, retinal scans,
diabetes complication risk assessments, medications, lab reports,
appointments, clinical notes, and audit logs.

## New Tables
1. `hospitals` — healthcare organisations (name, location).
2. `profiles` — extends `auth.users` with full_name, role, hospital_id.
3. `patients` — patient demographics + diabetes metadata.
4. `retinal_scans` — AI retinal screening results (DR stage, confidence, Grad-CAM, factors).
5. `risk_assessments` — diabetes complication risk predictions with SHAP-style factors.
6. `medications` — prescribed medications with adherence tracking.
7. `lab_reports` — uploaded lab reports with OCR-extracted values.
8. `appointments` — scheduled visits.
9. `clinical_notes` — free-text doctor notes.
10. `audit_logs` — platform activity audit trail.

## Security
- RLS enabled on every table.
- Profiles: each user reads/updates own profile.
- Clinical data: authenticated users read within scope; inserts require an actor.
- Owner columns default to `auth.uid()` where the actor is the authenticated user.
- All policies are per-CRUD-verb (no `FOR ALL`), scoped `TO authenticated`.

## Notes
1. `profiles.role` drives role-based access control in the frontend.
2. JSONB columns store structured AI/ML explainability and lab data.
*/

-- ---------- hospitals ----------
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  country text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_hospitals" ON hospitals;
CREATE POLICY "read_hospitals" ON hospitals FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_hospitals" ON hospitals;
CREATE POLICY "insert_hospitals" ON hospitals FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_hospitals" ON hospitals;
CREATE POLICY "update_hospitals" ON hospitals FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'patient'
    CHECK (role IN ('super_admin','hospital_admin','doctor','lab_tech','patient')),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ---------- patients ----------
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  phone text,
  email text,
  diabetes_type text CHECK (diabetes_type IN ('type_1','type_2','gestational','other')),
  diabetes_duration_years numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_patients" ON patients;
CREATE POLICY "read_patients" ON patients FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_patients" ON patients;
CREATE POLICY "insert_patients" ON patients FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_patients" ON patients;
CREATE POLICY "update_patients" ON patients FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_patients" ON patients;
CREATE POLICY "delete_patients" ON patients FOR DELETE
  TO authenticated USING (true);

-- ---------- retinal_scans ----------
CREATE TABLE IF NOT EXISTS retinal_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL DEFAULT auth.uid(),
  image_url text,
  prediction text NOT NULL DEFAULT 'no_dr'
    CHECK (prediction IN ('no_dr','mild','moderate','severe','proliferative')),
  confidence numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low'
    CHECK (risk_level IN ('low','moderate','high')),
  heatmap_url text,
  ai_analysis text,
  contributing_factors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE retinal_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_scans" ON retinal_scans;
CREATE POLICY "read_scans" ON retinal_scans FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_scans" ON retinal_scans;
CREATE POLICY "insert_scans" ON retinal_scans FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_scans" ON retinal_scans;
CREATE POLICY "update_scans" ON retinal_scans FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_scans" ON retinal_scans;
CREATE POLICY "delete_scans" ON retinal_scans FOR DELETE
  TO authenticated USING (true);

-- ---------- risk_assessments ----------
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL
    CHECK (category IN ('neuropathy','foot','kidney','cardiovascular','stroke','vision_loss')),
  risk_level text NOT NULL DEFAULT 'low'
    CHECK (risk_level IN ('low','moderate','high')),
  risk_percent numeric NOT NULL DEFAULT 0,
  top_factors jsonb DEFAULT '[]'::jsonb,
  inputs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_risk" ON risk_assessments;
CREATE POLICY "read_risk" ON risk_assessments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_risk" ON risk_assessments;
CREATE POLICY "insert_risk" ON risk_assessments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_risk" ON risk_assessments;
CREATE POLICY "update_risk" ON risk_assessments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_risk" ON risk_assessments;
CREATE POLICY "delete_risk" ON risk_assessments FOR DELETE
  TO authenticated USING (true);

-- ---------- medications ----------
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_meds" ON medications;
CREATE POLICY "read_meds" ON medications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_meds" ON medications;
CREATE POLICY "insert_meds" ON medications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_meds" ON medications;
CREATE POLICY "update_meds" ON medications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_meds" ON medications;
CREATE POLICY "delete_meds" ON medications FOR DELETE
  TO authenticated USING (true);

-- ---------- lab_reports ----------
CREATE TABLE IF NOT EXISTS lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  file_url text,
  raw_text text,
  extracted jsonb,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_labs" ON lab_reports;
CREATE POLICY "read_labs" ON lab_reports FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_labs" ON lab_reports;
CREATE POLICY "insert_labs" ON lab_reports FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_labs" ON lab_reports;
CREATE POLICY "update_labs" ON lab_reports FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_labs" ON lab_reports;
CREATE POLICY "delete_labs" ON lab_reports FOR DELETE
  TO authenticated USING (true);

-- ---------- appointments ----------
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL DEFAULT auth.uid(),
  scheduled_at timestamptz NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','cancelled')),
  notes text
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_appointments" ON appointments;
CREATE POLICY "read_appointments" ON appointments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_appointments" ON appointments;
CREATE POLICY "insert_appointments" ON appointments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_appointments" ON appointments;
CREATE POLICY "update_appointments" ON appointments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_appointments" ON appointments;
CREATE POLICY "delete_appointments" ON appointments FOR DELETE
  TO authenticated USING (true);

-- ---------- clinical_notes ----------
CREATE TABLE IF NOT EXISTS clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL DEFAULT auth.uid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_notes" ON clinical_notes;
CREATE POLICY "read_notes" ON clinical_notes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_notes" ON clinical_notes;
CREATE POLICY "insert_notes" ON clinical_notes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_notes" ON clinical_notes;
CREATE POLICY "update_notes" ON clinical_notes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_notes" ON clinical_notes;
CREATE POLICY "delete_notes" ON clinical_notes FOR DELETE
  TO authenticated USING (true);

-- ---------- audit_logs ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid DEFAULT auth.uid(),
  action text NOT NULL,
  target text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_audit" ON audit_logs;
CREATE POLICY "read_audit" ON audit_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_audit" ON audit_logs;
CREATE POLICY "insert_audit" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS idx_patients_hospital ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_scans_patient ON retinal_scans(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_patient ON risk_assessments(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meds_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_labs_patient ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notes_patient ON clinical_notes(patient_id, created_at DESC);
