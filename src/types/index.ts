export type Role = 'super_admin' | 'hospital_admin' | 'doctor' | 'lab_tech' | 'patient';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  hospital_id: string | null;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  country: string;
  created_at: string;
}

export interface Patient {
  id: string;
  hospital_id: string | null;
  doctor_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  email: string | null;
  diabetes_type: 'type_1' | 'type_2' | 'gestational' | 'other' | null;
  diabetes_duration_years: number | null;
  created_at: string;
}

export type DRStage = 'no_dr' | 'mild' | 'moderate' | 'severe' | 'proliferative';

export interface RetinalScan {
  id: string;
  patient_id: string;
  doctor_id: string;
  image_url: string;
  prediction: DRStage;
  confidence: number;
  risk_level: 'low' | 'moderate' | 'high';
  heatmap_url: string | null;
  ai_analysis: string;
  contributing_factors: string[];
  created_at: string;
}

export type RiskCategory =
  | 'neuropathy'
  | 'foot'
  | 'kidney'
  | 'cardiovascular'
  | 'stroke'
  | 'vision_loss';

export interface RiskAssessment {
  id: string;
  patient_id: string;
  doctor_id: string;
  category: RiskCategory;
  risk_level: 'low' | 'moderate' | 'high';
  risk_percent: number;
  top_factors: { factor: string; contribution: number; detail: string }[];
  inputs: Record<string, number | string>;
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  doctor_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_url: string | null;
  raw_text: string | null;
  extracted: Record<string, number | string> | null;
  confirmed: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  content: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  doctor: 'Doctor',
  lab_tech: 'Lab Technician',
  patient: 'Patient',
};

export const DR_STAGE_LABELS: Record<DRStage, string> = {
  no_dr: 'No Diabetic Retinopathy',
  mild: 'Mild DR',
  moderate: 'Moderate DR',
  severe: 'Severe DR',
  proliferative: 'Proliferative DR',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  neuropathy: 'Diabetic Neuropathy',
  foot: 'Foot Complications',
  kidney: 'Kidney Disease',
  cardiovascular: 'Cardiovascular Disease',
  stroke: 'Stroke',
  vision_loss: 'Vision Loss',
};
