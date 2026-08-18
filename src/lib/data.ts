import { supabase } from './supabase';
import type {
  Patient, RetinalScan, RiskAssessment, Medication, LabReport,
  Appointment, ClinicalNote, Hospital, Profile, AuditLog,
} from '@/types';

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Patient[];
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Patient | null;
}

export async function createPatient(p: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase.from('patients').insert(p).select().single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, p: Partial<Patient>): Promise<void> {
  const { error } = await supabase.from('patients').update(p).eq('id', id);
  if (error) throw error;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
}

export async function getScans(patientId: string): Promise<RetinalScan[]> {
  const { data, error } = await supabase.from('retinal_scans').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as RetinalScan[];
}

export async function createScan(s: Partial<RetinalScan>): Promise<RetinalScan> {
  const { data, error } = await supabase.from('retinal_scans').insert(s).select().single();
  if (error) throw error;
  return data as RetinalScan;
}

export async function getRiskAssessments(patientId: string): Promise<RiskAssessment[]> {
  const { data, error } = await supabase.from('risk_assessments').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as RiskAssessment[];
}

export async function createRiskAssessment(r: Partial<RiskAssessment>): Promise<RiskAssessment> {
  const { data, error } = await supabase.from('risk_assessments').insert(r).select().single();
  if (error) throw error;
  return data as RiskAssessment;
}

export async function getMedications(patientId: string): Promise<Medication[]> {
  const { data, error } = await supabase.from('medications').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Medication[];
}

export async function createMedication(m: Partial<Medication>): Promise<Medication> {
  const { data, error } = await supabase.from('medications').insert(m).select().single();
  if (error) throw error;
  return data as Medication;
}

export async function updateMedication(id: string, m: Partial<Medication>): Promise<void> {
  const { error } = await supabase.from('medications').update(m).eq('id', id);
  if (error) throw error;
}

export async function getLabReports(patientId: string): Promise<LabReport[]> {
  const { data, error } = await supabase.from('lab_reports').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as LabReport[];
}

export async function createLabReport(l: Partial<LabReport>): Promise<LabReport> {
  const { data, error } = await supabase.from('lab_reports').insert(l).select().single();
  if (error) throw error;
  return data as LabReport;
}

export async function updateLabReport(id: string, l: Partial<LabReport>): Promise<void> {
  const { error } = await supabase.from('lab_reports').update(l).eq('id', id);
  if (error) throw error;
}

export async function getAppointments(patientId?: string): Promise<Appointment[]> {
  let q = supabase.from('appointments').select('*').order('scheduled_at', { ascending: true });
  if (patientId) q = q.eq('patient_id', patientId);
  const { data, error } = await q;
  if (error) throw error;
  return data as Appointment[];
}

export async function createAppointment(a: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase.from('appointments').insert(a).select().single();
  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(id: string, a: Partial<Appointment>): Promise<void> {
  const { error } = await supabase.from('appointments').update(a).eq('id', id);
  if (error) throw error;
}

export async function getNotes(patientId: string): Promise<ClinicalNote[]> {
  const { data, error } = await supabase.from('clinical_notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as ClinicalNote[];
}

export async function createNote(n: Partial<ClinicalNote>): Promise<ClinicalNote> {
  const { data, error } = await supabase.from('clinical_notes').insert(n).select().single();
  if (error) throw error;
  return data as ClinicalNote;
}

export async function getHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase.from('hospitals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Hospital[];
}

export async function createHospital(h: Partial<Hospital>): Promise<Hospital> {
  const { data, error } = await supabase.from('hospitals').insert(h).select().single();
  if (error) throw error;
  return data as Hospital;
}

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfileRole(id: string, role: Profile['role']): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data as AuditLog[];
}

export async function logAudit(action: string, target?: string): Promise<void> {
  await supabase.from('audit_logs').insert({ action, target });
}

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
