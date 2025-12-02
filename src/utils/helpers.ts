import { TankType, PARAMETER_RANGES } from '../types';

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  if (format === 'long') return d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return d.toLocaleDateString('pt-BR');
}

export type ParameterStatus = 'ideal' | 'acceptable' | 'warning' | 'critical';

export interface ParameterAnalysis {
  status: ParameterStatus; message: string; color: string; bgColor: string;
}

export function analyzeParameter(paramName: string, value: number, tankType: TankType): ParameterAnalysis {
  const range = PARAMETER_RANGES[tankType]?.[paramName];
  if (!range) return { status: 'acceptable', message: 'Sem referência', color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
  
  if (range.critical_high && value > range.critical_high) return { status: 'critical', message: 'Crítico!', color: 'text-rose-400', bgColor: 'bg-rose-500/20' };
  if (value >= range.ideal_min && value <= range.ideal_max) return { status: 'ideal', message: 'Ideal ✓', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  if (value >= range.min && value <= range.max) return { status: 'acceptable', message: 'Aceitável', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
  return { status: 'warning', message: 'Fora do range', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}