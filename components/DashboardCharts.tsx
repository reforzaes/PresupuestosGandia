
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Budget, BudgetStatus } from '../types';
import { STATUS_COLORS, SELLER_DATA } from '../constants';

interface Props {
  budgets: Budget[];
}

const DashboardCharts: React.FC<Props> = ({ budgets }) => {
  // 1. Distribución por Estado (Importe)
  const statusData = Object.values(BudgetStatus).map(status => {
    const filtered = budgets.filter(b => b.estado === status);
    const amount = filtered.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    return {
      name: status,
      value: filtered.length,
      amount: amount
    };
  });

  // 2. Carga por Sección (Agrupado por mapeo oficial)
  const sectionCounts: Record<string, any> = {};
  
  budgets.forEach(b => {
    const sellerName = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
    const info = SELLER_DATA[sellerName];
    const sectionName = info?.section || b.seccion || "Otras";
    
    if (!sectionCounts[sectionName]) {
      sectionCounts[sectionName] = { name: sectionName };
      Object.values(BudgetStatus).forEach(s => sectionCounts[sectionName][s] = 0);
    }
    sectionCounts[sectionName][b.estado] += (Number(b.total) || 0);
  });

  const sectionData = Object.values(sectionCounts);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Distribución por Estado */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <span className="w-2 h-2 bg-leroy-green rounded-full mr-2"></span>
          Distribución por estado (Importe)
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
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as BudgetStatus]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carga por Sección */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Carga por sección
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
              <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'}} />
              {Object.values(BudgetStatus).map(status => (
                <Bar 
                  key={status} 
                  dataKey={status} 
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
