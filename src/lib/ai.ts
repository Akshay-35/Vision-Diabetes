import { supabase } from './supabase';
import type { DRStage, RiskCategory } from '@/types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visiondiab-ai`;

async function callFunction(path: string, body: unknown) {
  const { data: session } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  const res = await fetch(`${FUNCTION_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`AI service error (${res.status}): ${txt}`);
  }
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

export interface RetinaResult {
  prediction: DRStage;
  confidence: number;
  risk_level: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  ai_analysis: string;
  heatmap_region: { cx: number; cy: number; radius: number };
}

export interface RiskResult {
  risk_percent: number;
  risk_level: 'low' | 'moderate' | 'high';
  top_factors: { factor: string; contribution: number; detail: string }[];
}

export async function classifyRetina(imageId: string): Promise<RetinaResult> {
  return callFunction('/classify', { image_id: imageId });
}

export async function assessRisk(
  inputs: Record<string, number | string>,
  category: RiskCategory,
): Promise<RiskResult> {
  return callFunction('/risk', { inputs, category });
}
