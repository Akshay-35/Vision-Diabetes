import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['diabetic retinopathy', 'dr', 'retinopathy'],
    answer: 'Diabetic retinopathy is a diabetes complication that affects the eyes, caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina). It can develop in anyone with type 1 or type 2 diabetes. The longer you have diabetes and the less controlled your blood sugar, the more likely you are to develop this complication. VisionDiab AI classifies it into five stages: No DR, Mild, Moderate, Severe, and Proliferative.',
  },
  {
    keywords: ['hba1c', 'a1c'],
    answer: 'HbA1c (glycated hemoglobin) measures your average blood glucose over the past 2-3 months. For most adults with diabetes, a target of below 7% is recommended. Higher HbA1c levels indicate poorer long-term blood sugar control and increase the risk of complications including retinopathy, neuropathy, and kidney disease.',
  },
  {
    keywords: ['glaucoma'],
    answer: 'Glaucoma is a group of eye conditions that damage the optic nerve, often caused by abnormally high pressure inside the eye. VisionDiab AI is designed to support future screening research for glaucoma where suitable datasets and validated models become available. Any systemic health predictions from retinal images are presented only as screening or risk indicators.',
  },
  {
    keywords: ['cataract', 'cataracts'],
    answer: 'A cataract is a clouding of the lens of the eye that leads to decreased vision. It commonly develops with age but can be accelerated by diabetes. VisionDiab AI is architected to support future multi-disease retinal screening including cataracts when validated models are available.',
  },
  {
    keywords: ['neuropathy', 'nerve'],
    answer: 'Diabetic neuropathy is nerve damage caused by chronically high blood sugar. It most commonly affects the legs and feet, causing tingling, numbness, burning, or pain. Risk increases with diabetes duration and poor glycemic control. VisionDiab AI predicts neuropathy risk using factors like HbA1c, diabetes duration, and smoking status.',
  },
  {
    keywords: ['kidney', 'nephropathy', 'egfr'],
    answer: 'Diabetic kidney disease (nephropathy) is damage to the kidneys caused by diabetes. The eGFR (estimated glomerular filtration rate) measures kidney function — below 60 mL/min indicates reduced function. VisionDiab AI uses eGFR, HbA1c, blood pressure, and diabetes duration to estimate kidney disease risk.',
  },
  {
    keywords: ['cardiovascular', 'heart', 'stroke'],
    answer: 'People with diabetes have a higher risk of cardiovascular disease and stroke. Key risk factors include high blood pressure, high cholesterol, smoking, and obesity. VisionDiab AI predicts cardiovascular and stroke risk using these clinical inputs and presents them as screening indicators for clinical decision support.',
  },
  {
    keywords: ['lifestyle', 'diet', 'exercise', 'prevention'],
    answer: 'Lifestyle management is central to diabetes care: maintain a balanced diet rich in vegetables and whole grains, aim for at least 150 minutes of moderate exercise weekly, avoid smoking, limit alcohol, and keep HbA1c and blood pressure within target. These are supportive guidance and not a replacement for professional medical advice.',
  },
  {
    keywords: ['report', 'ai report', 'prediction'],
    answer: 'VisionDiab AI reports include the retinal image, AI prediction, confidence score, Grad-CAM heatmap, risk assessment, contributing factors, and clinical notes. All reports are AI-assisted and clearly state they do not replace professional medical diagnosis.',
  },
];

const DEFAULT_ANSWER = "I can explain diabetes, diabetic retinopathy, AI-generated reports, risk factors, and preventive health. Try asking about HbA1c, retinopathy stages, neuropathy, kidney disease, or lifestyle recommendations. Remember: I provide general health education only and do not provide definitive diagnoses.";

export function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm the VisionDiab AI health education assistant. I can explain diabetes, diabetic retinopathy, AI reports, and preventive health. How can I help?" },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const respond = (q: string): string => {
    const lower = q.toLowerCase();
    for (const entry of KNOWLEDGE) {
      if (entry.keywords.some((k) => lower.includes(k))) return entry.answer;
    }
    return DEFAULT_ANSWER;
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: respond(userMsg.text) }]);
      setThinking(false);
    }, 800);
  };

  const suggestions = ['What is diabetic retinopathy?', 'Explain HbA1c', 'How does AI predict neuropathy risk?', 'Lifestyle recommendations'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">AI Healthcare Assistant</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-slate-400">General health education about diabetes, retinopathy, and AI reports.</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        This assistant provides general health education only. It does not provide definitive diagnosis or replace doctors.
      </div>

      <GlassCard className="flex flex-col" >
        <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === 'user' ? 'bg-royal-500 text-white' : 'bg-gradient-to-br from-royal-600 to-cyan-500 text-white'}`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-royal-500/10 text-navy-900 dark:text-white' : 'glass text-navy-700 dark:text-slate-200'}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-royal-600 to-cyan-500 text-white"><Brain className="h-4 w-4" /></div>
              <div className="glass rounded-2xl px-4 py-3 text-sm text-navy-500 dark:text-slate-400">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-royal-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-royal-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-royal-400" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)} className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 transition hover:bg-royal-50 hover:text-royal-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
              <Sparkles className="mr-1 inline h-3 w-3" /> {s}
            </button>
          ))}
        </div>

        <form onSubmit={send} className="mt-4 flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about diabetes, retinopathy, AI reports…" className="input" />
          <button type="submit" className="btn-primary shrink-0"><Send className="h-4 w-4" /></button>
        </form>
      </GlassCard>
    </div>
  );
}
