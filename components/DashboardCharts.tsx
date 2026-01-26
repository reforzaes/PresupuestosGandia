
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Budget, BudgetStatus } from '../types';
import { STATUS_COLORS, SELLER_DATA } from '../constants';

interface Props {
  budgets: Budget[];
}

const DashboardCharts: React.FC<Props> = ({ budgets }) => {
  const totalAmountAll = budgets.reduce((acc, b) => acc + (Number(b.total) || 0), 0);

  // 1. Distribución por Estado (Importe + %)
  const statusData = Object.values(BudgetStatus).map(status => {
    const filtered = budgets.filter(b => b.estado === status);
    const amount = filtered.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const percentage = totalAmountAll > 0 ? (amount / totalAmountAll) * 100 : 0;
    return {
      name: status,
      value: filtered.length,
      amount: amount,
      percentage: percentage
    };
  });

  // 2. Carga por Sección (Agrupado por mapeo oficial con Importe + %)
  const sectionCounts: Record<string, any> = {};
  
  budgets.forEach(b => {
    const sellerName = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
    const info = SELLER_DATA[sellerName];
    const sectionName = info?.section || "Sin sección";
    
    if (!sectionCounts[sectionName]) {
      sectionCounts[sectionName] = { name: sectionName, totalSection: 0 };
      Object.values(BudgetStatus).forEach(s => sectionCounts[sectionName][s] = 0);
    }
    const val = (Number(b.total) || 0);
    sectionCounts[sectionName][b.estado] += val;
    sectionCounts[sectionName].totalSection += val;
  });

  const sectionData = Object.values(sectionCounts).map(section => {
    const pcts: any = {};
    Object.values(BudgetStatus).forEach(s => {
      pcts[`${s}_pct`] = section.totalSection > 0 ? (section[s] / section.totalSection * 100) : 0;
    });
    return { ...section, ...pcts };
  }).sort((a, b) => b.totalSection - a.totalSection);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  // Custom Tooltip for Bar Chart to show Amount and %
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sectionTotal = payload[0].payload.totalSection;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2 border-b pb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const statusName = entry.name;
              const value = entry.value;
              const pct = sectionTotal > 0 ? (value / sectionTotal * 100).toFixed(1) : 0;
              if (value === 0) return null;
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">{statusName}:</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-800">{formatCurrency(value)}</span>
                    <span className="text-[9px] font-medium text-slate-400 ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
            <div className="pt-1 mt-1 border-t flex justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase">Total:</span>
              <span className="text-[10px] font-black text-leroy-green">{formatCurrency(sectionTotal)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill || STATUS_COLORS[data.name as BudgetStatus] }}></div>
            <p className="text-[10px] font-black uppercase text-slate-800">{data.name}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-slate-900 italic">{formatCurrency(data.amount)}</span>
            <span className="text-[10px] font-bold text-leroy-green">{data.percentage.toFixed(1)}% del total</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Distribución por Estado */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-leroy-green rounded-full mr-2"></span>
            Distribución por estado (Importe + %)
          </div>
          <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 italic">Total: {formatCurrency(totalAmountAll)}</span>
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="amount"
                label={({ name, percentage }) => percentage > 5 ? `${percentage.toFixed(0)}%` : ''}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as BudgetStatus]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carga por Sección */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Carga por sección (Importe y %)
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sectionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={110} 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', fill: '#64748b' }}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{fill: '#f8fafc', opacity: 0.4}} />
              <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'}} />
              {Object.values(BudgetStatus).map(status => (
                <Bar 
                  key={status} 
                  dataKey={status} 
                  name={status}
                  stackId="a" 
                  fill={STATUS_COLORS[status]} 
                  radius={[0, 2, 2, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
