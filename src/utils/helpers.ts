import { TankType, PARAMETER_RANGES, WaterTest } from '../types';

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  if (format === 'relative') {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  }

  if (format === 'long') return d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export type ParameterStatus = 'ideal' | 'acceptable' | 'warning' | 'critical';

export interface ParameterAnalysis {
  status: ParameterStatus; message: string; color: string; bgColor: string; score: number;
}

export function analyzeParameter(paramName: string, value: number, tankType: TankType): ParameterAnalysis {
  const range = PARAMETER_RANGES[tankType]?.[paramName];
  if (!range) return { status: 'acceptable', message: 'Sem ref.', color: 'text-slate-400', bgColor: 'bg-slate-500/20', score: 0 };
  
  if ((range.critical_high && value > range.critical_high) || (range.critical_low && value < range.critical_low)) {
    return { status: 'critical', message: 'Crítico!', color: 'text-rose-400', bgColor: 'bg-rose-500/20', score: 0 };
  }

  if (value >= range.ideal_min && value <= range.ideal_max) {
    return { status: 'ideal', message: 'Ideal', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', score: 100 };
  }

  if (value >= range.min && value <= range.max) {
    return { status: 'acceptable', message: 'Aceitável', color: 'text-amber-400', bgColor: 'bg-amber-500/20', score: 70 };
  }
  
  return { status: 'warning', message: 'Alerta', color: 'text-orange-400', bgColor: 'bg-orange-500/20', score: 40 };
}

export function calculateHealthScore(latestTest: WaterTest | null, tankType: TankType): { score: number; status: string; color: string } {
  if (!latestTest) return { score: 0, status: 'Sem Dados', color: 'text-slate-500' };

  const paramsToCheck = ['ph', 'ammonia', 'nitrite', 'nitrate', 'temperature'];
  let totalScore = 0;
  let count = 0;

  paramsToCheck.forEach(key => {
    // @ts-ignore
    const val = latestTest[key];
    if (val !== undefined && val !== null) {
       const analysis = analyzeParameter(key, Number(val), tankType);
       totalScore += analysis.score;
       count++;
    }
  });

  if (count === 0) return { score: 0, status: 'Insuficiente', color: 'text-slate-500' };

  const finalScore = Math.round(totalScore / count);

  let status = 'Crítico';
  let color = 'text-rose-500';

  if (finalScore >= 90) { status = 'Excelente'; color = 'text-emerald-400'; }
  else if (finalScore >= 70) { status = 'Bom'; color = 'text-[#4fb7b3]'; }
  else if (finalScore >= 50) { status = 'Atenção'; color = 'text-amber-400'; }

  return { score: finalScore, status, color };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}