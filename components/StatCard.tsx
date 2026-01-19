
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  percentage?: number;
  colorClass: string;
  textColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, colorClass, textColorClass }) => {
  // Extraer color de fondo base para el porcentaje si existe
  const badgeBg = colorClass.split(' ')[0] || 'bg-slate-100';
  const badgeText = colorClass.split(' ')[1] || 'text-slate-600';

  return (
    <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md hover:border-leroy-green/20 min-h-[120px]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</span>
        {percentage !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeBg} ${badgeText} bg-opacity-10`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-black italic tracking-tight ${textColorClass} truncate`}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
