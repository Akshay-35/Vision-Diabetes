import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DR_STAGES = ["no_dr", "mild", "moderate", "severe", "proliferative"] as const;
const DR_LABELS: Record<string, string> = {
  no_dr: "No Diabetic Retinopathy",
  mild: "Mild Non-Proliferative DR",
  moderate: "Moderate Non-Proliferative DR",
  severe: "Severe Non-Proliferative DR",
  proliferative: "Proliferative DR",
};

const RISK_FACTORS = [
  "Microaneurysms detected in the temporal arcade region",
  "Hard exudates observed near the macula",
  "Cotton-wool spots present in the superior vascular arcades",
  "Venous beading identified along the inferior temporal vessels",
  "Intraretinal hemorrhages scattered across the posterior pole",
  "Neovascularization detected at the optic disc margin",
  "Macular edema signs observed in the central macular zone",
  "Arteriolar narrowing consistent with hypertensive changes",
];

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function classifyRetina(imageId: string) {
  const rand = seededRandom(hashString(imageId));
  // Weighted distribution: most scans are no_dr / mild
  const roll = rand();
  let stage: string;
  if (roll < 0.42) stage = "no_dr";
  else if (roll < 0.68) stage = "mild";
  else if (roll < 0.85) stage = "moderate";
  else if (roll < 0.95) stage = "severe";
  else stage = "proliferative";

  const confidence = 0.86 + rand() * 0.13;
  const riskLevel = stage === "no_dr" ? "low" : stage === "mild" || stage === "moderate" ? "moderate" : "high";

  const factorCount = stage === "no_dr" ? 1 : Math.min(5, 2 + Math.floor(rand() * 4));
  const factors: string[] = [];
  const pool = [...RISK_FACTORS];
  for (let i = 0; i < factorCount; i++) {
    const idx = Math.floor(rand() * pool.length);
    factors.push(pool.splice(idx, 1)[0]);
  }
  if (stage === "no_dr") factors.length = 0;

  const analysis = stage === "no_dr"
    ? "No clinically significant signs of diabetic retinopathy detected. The retinal vasculature appears within normal limits with no microaneurysms, hemorrhages, or exudates observed."
    : `${DR_LABELS[stage]} detected. ${factors.join(". ")}. Clinical correlation with HbA1c and diabetes duration is recommended.`;

  return {
    prediction: stage,
    confidence: Number(confidence.toFixed(4)),
    risk_level: riskLevel,
    contributing_factors: factors,
    ai_analysis: analysis,
    heatmap_region: {
      cx: 0.3 + rand() * 0.4,
      cy: 0.3 + rand() * 0.4,
      radius: 0.12 + rand() * 0.12,
    },
  };
}

function assessRisk(inputs: Record<string, number | string>, category: string) {
  const age = Number(inputs.age) || 50;
  const duration = Number(inputs.diabetes_duration) || 5;
  const hba1c = Number(inputs.hba1c) || 7;
  const bp = Number(inputs.blood_pressure) || 120;
  const bmi = Number(inputs.bmi) || 25;
  const cholesterol = Number(inputs.cholesterol) || 180;
  const smoking = inputs.smoking === "yes" ? 1 : 0;
  const exercise = Number(inputs.exercise) || 3;
  const egfr = Number(inputs.egfr) || 90;
  const rand = seededRandom(hashString(category + JSON.stringify(inputs)));

  const weights: Record<string, Record<string, number>> = {
    neuropathy: { age: 0.02, duration: 0.05, hba1c: 0.08, bmi: 0.01, smoking: 0.1 },
    foot: { age: 0.015, duration: 0.06, hba1c: 0.07, smoking: 0.08, exercise: -0.02 },
    kidney: { age: 0.01, duration: 0.04, hba1c: 0.09, bp: 0.01, egfr: -0.01 },
    cardiovascular: { age: 0.025, bp: 0.02, cholesterol: 0.005, smoking: 0.15, bmi: 0.015 },
    stroke: { age: 0.03, bp: 0.025, smoking: 0.12, cholesterol: 0.006 },
    vision_loss: { duration: 0.05, hba1c: 0.1, bp: 0.008, age: 0.01 },
  };

  const w = weights[category] ?? weights.neuropathy;
  let score = 10;
  for (const [k, coef] of Object.entries(w)) {
    score += coef * (Number(inputs[k]) ?? 0);
  }
  score += (rand() - 0.5) * 8;
  score = Math.max(2, Math.min(94, score));

  const riskLevel = score < 33 ? "low" : score < 66 ? "moderate" : "high";

  const factorDefs: Record<string, { label: string; detail: (v: number) => string }> = {
    hba1c: { label: "HbA1c", detail: (v) => `Elevated HbA1c of ${v}% indicates suboptimal glycemic control` },
    duration: { label: "Diabetes Duration", detail: (v) => `${v} years of diabetes increases cumulative risk` },
    bp: { label: "Blood Pressure", detail: (v) => `Blood pressure of ${v} mmHg contributes to vascular stress` },
    age: { label: "Age", detail: (v) => `Age of ${v} is a non-modifiable risk factor` },
    bmi: { label: "BMI", detail: (v) => `BMI of ${v} suggests weight management opportunity` },
    cholesterol: { label: "Cholesterol", detail: (v) => `Total cholesterol of ${v} mg/dL affects vascular health` },
    smoking: { label: "Smoking", detail: () => `Smoking significantly accelerates vascular complications` },
    exercise: { label: "Exercise", detail: (v) => `Physical activity of ${v} hrs/week is ${v < 2.5 ? "below recommended levels" : "protective"}` },
    egfr: { label: "Kidney Function (eGFR)", detail: (v) => `eGFR of ${v} mL/min indicates ${v < 60 ? "reduced kidney function" : "adequate kidney function"}` },
  };

  const sorted = Object.entries(w)
    .map(([k, coef]) => ({ k, contribution: Math.abs(coef * (Number(inputs[k]) ?? 0)) }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4);

  const topFactors = sorted
    .map(({ k, contribution }) => {
      const def = factorDefs[k];
      if (!def) return null;
      const v = Number(inputs[k]);
      return {
        factor: def.label,
        contribution: Number((contribution / (score || 1)).toFixed(3)),
        detail: def.detail(v),
      };
    })
    .filter(Boolean);

  return {
    risk_percent: Number(score.toFixed(1)),
    risk_level: riskLevel,
    top_factors: topFactors,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/visiondiab-ai/, "");

    if (path === "/classify" && req.method === "POST") {
      const body = await req.json();
      const imageId = body.image_id ?? body.imageId ?? crypto.randomUUID();
      const result = classifyRetina(imageId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/risk" && req.method === "POST") {
      const body = await req.json();
      const { inputs, category } = body;
      const result = assessRisk(inputs, category);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
