
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  percentage?: number;
  colorClass: string;
  textColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, colorClass, textColorClass }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        {percentage !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold italic ${textColorClass}`}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
