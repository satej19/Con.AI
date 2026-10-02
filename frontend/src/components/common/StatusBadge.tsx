import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status?.toLowerCase() || '';

  let bgClass = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotClass = 'bg-slate-400';

  if (['active', 'received', 'completed', 'healthy', 'approved', 'admin'].includes(normalized)) {
    bgClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
    dotClass = 'bg-emerald-400';
  } else if (
    ['planning', 'partially_received', 'low', 'manager', 'on_hold', 'waiting'].includes(normalized)
  ) {
    bgClass = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
    dotClass = 'bg-amber-400';
  } else if (
    ['cancelled', 'out_of_stock', 'damaged', 'defective', 'expired', 'overrun'].includes(normalized)
  ) {
    bgClass = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
    dotClass = 'bg-rose-400';
  } else if (['draft', 'spillage', 'other'].includes(normalized)) {
    bgClass = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
    dotClass = 'bg-blue-400';
  } else if (['user', 'natural_loss'].includes(normalized)) {
    bgClass = 'bg-purple-950/60 text-purple-400 border-purple-800/60';
    dotClass = 'bg-purple-400';
  }

  const formatText = (txt: string) => {
    return txt.replace(/_/g, ' ').toUpperCase();
  };

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bgClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
      {formatText(status)}
    </span>
  );
};
