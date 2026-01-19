
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Budget, BudgetStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface Props {
  budgets: Budget[];
}

const DashboardCharts: React.FC<Props> = ({ budgets }) => {
  // Process status distribution
  const statusData = Object.values(BudgetStatus).map(status => {
    const filtered = budgets.filter(b => b.estado === status);
    const amount = filtered.reduce((acc, curr) => acc + curr.total, 0);
    return {
      name: status,
      value: filtered.length,
      amount: amount
    };
  });

  // Process seller performance (Stacked Bar)
  const sellers = Array.from(new Set(budgets.map(b => b.vendedor)));
  const sellerData = sellers.map(seller => {
    const data: any = { name: seller };
    Object.values(BudgetStatus).forEach(status => {
      data[status] = budgets
        .filter(b => b.vendedor === seller && b.estado === status)
        .reduce((acc, curr) => acc + curr.total, 0);
    });
    return data;
  });

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k€`;
    return `${val.toFixed(0)}€`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Distribution Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
          Distribución por estado (Importe)
        </h3>
        <div className="h-[300px] w-full">
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
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seller Performance Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Carga de venta por vendedor
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sellerData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="rect" />
              {Object.values(BudgetStatus).map(status => (
                <Bar 
                  key={status} 
                  dataKey={status} 
                  stackId="a" 
                  fill={STATUS_COLORS[status]} 
                  radius={[0, 4, 4, 0]} 
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
