import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: 'from-slate-900/90 to-slate-900/50 border-slate-800 text-slate-100 hover:border-slate-700',
    amber: 'from-amber-950/40 to-slate-900/60 border-amber-900/40 text-amber-100 hover:border-amber-700/60',
    emerald: 'from-emerald-950/40 to-slate-900/60 border-emerald-900/40 text-emerald-100 hover:border-emerald-700/60',
    rose: 'from-rose-950/40 to-slate-900/60 border-rose-900/40 text-rose-100 hover:border-rose-700/60',
    blue: 'from-blue-950/40 to-slate-900/60 border-blue-900/40 text-blue-100 hover:border-blue-700/60',
  };

  const iconColors = {
    default: 'bg-slate-800 text-amber-400 border-slate-700',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 backdrop-blur-md transition-all duration-200 ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold font-heading tracking-tight text-white">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl border p-2.5 ${iconColors[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isNeutral
                ? 'bg-slate-800 text-slate-300'
                : trend.isPositive
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-[11px] text-slate-400">vs target / previous</span>
        </div>
      )}
    </div>
  );
};
