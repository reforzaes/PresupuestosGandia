
import React, { useState, useEffect, useMemo } from 'react';
import { Budget, BudgetStatus } from './types';
import { STATUS_BG_COLORS } from './constants';
import StatCard from './components/StatCard';
import DashboardCharts from './components/DashboardCharts';
import BudgetModal from './components/BudgetModal';
import { fetchBudgets, updateBudgetOnSheet } from './services/googleSheetService';

const App: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  
  // Filtros de búsqueda y segmentación
  const [search, setSearch] = useState('');
  const [filterSeccion, setFilterSeccion] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterFechaCrea, setFilterFechaCrea] = useState('');
  const [filterFechaGest, setFilterFechaGest] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBudgets();
      setBudgets(data || []);
    } catch (err) {
      console.error("Error al cargar presupuestos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Obtener secciones únicas para el filtro
  const sections = useMemo(() => {
    const s = Array.from(new Set(budgets.map(b => b.seccion).filter(Boolean)));
    return s.sort();
  }, [budgets]);

  // Lógica de filtrado combinada
  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = 
      b.cliente.toLowerCase().includes(search.toLowerCase()) || 
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeccion = !filterSeccion || b.seccion === filterSeccion;
    const matchesEstado = !filterEstado || b.estado === filterEstado;
    const matchesFechaCrea = !filterFechaCrea || (b.fechaCreacion && b.fechaCreacion.includes(filterFechaCrea));
    const matchesFechaGest = !filterFechaGest || (b.fechaGestion && b.fechaGestion.includes(filterFechaGest));
    return matchesSearch && matchesSeccion && matchesEstado && matchesFechaCrea && matchesFechaGest;
  });

  // Estadísticas globales para las tarjetas superiores
  const stats = useMemo(() => {
    const totalAmount = budgets.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
    const byStatus = Object.values(BudgetStatus).map(status => {
      const filtered = budgets.filter(b => b.estado === status);
      const amount = filtered.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
      return { 
        status, 
        amount, 
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0 
      };
    });
    return { totalAmount, byStatus };
  }, [budgets]);

  const handleUpdate = async (id: string, status: BudgetStatus, notes: string, fechaGestion: string) => {
    // Sincronización con Google Sheets
    await updateBudgetOnSheet(id, status, notes, fechaGestion);
    
    // Actualización del estado local para feedback inmediato
    setBudgets(prev => prev.map(b => 
      b.id === id ? { ...b, estado: status, notas: notes, fechaGestion } : b
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-leroy-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-leroy-dark font-black uppercase tracking-widest text-[10px]">LEROY MERLIN - Gandía - Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="bg-white border-b-4 border-leroy-green sticky top-0 z-30 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-10 bg-leroy-green flex items-center justify-center shadow-inner">
               <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current"><path d="M12 3L2 12h3v8h14v-8h3L12 3z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-leroy-dark leading-none uppercase">
                <span className="text-leroy-green">Leroy</span> Merlin
              </h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Sede Gandía</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:flex items-center gap-2 flex-1 max-w-5xl">
             <div className="relative flex-1 min-w-[120px]">
                <input 
                  type="text" placeholder="Buscar Cliente / Acto"
                  className="w-full px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-xs transition-all"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
             </div>
             <select 
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-xs transition-all font-bold"
                value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}
             >
                <option value="">Todas las Secciones</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <select 
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-xs transition-all font-bold"
                value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
             >
                <option value="">Cualquier Estado</option>
                {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <div className="flex flex-col bg-slate-50 border border-slate-200 p-1 rounded min-w-[90px]">
                <span className="text-[7px] font-black uppercase text-slate-500 px-1">Creación</span>
                <input 
                  type="date" className="bg-transparent text-[10px] outline-none"
                  value={filterFechaCrea} onChange={e => setFilterFechaCrea(e.target.value)}
                />
             </div>
             <div className="flex flex-col bg-slate-50 border border-slate-200 p-1 rounded min-w-[90px]">
                <span className="text-[7px] font-black uppercase text-slate-500 px-1">Gestión</span>
                <input 
                  type="date" className="bg-transparent text-[10px] outline-none"
                  value={filterFechaGest} onChange={e => setFilterFechaGest(e.target.value)}
                />
             </div>
             <button onClick={loadData} title="Refrescar datos" className="p-2 bg-leroy-green text-white rounded hover:bg-green-700 transition-all shadow-sm active:scale-95">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.byStatus.map((s, i) => (
              <StatCard 
                key={i} label={s.status} 
                value={`${new Intl.NumberFormat('es-ES').format(s.amount)} €`} 
                percentage={s.percentage}
                colorClass={STATUS_BG_COLORS[s.status as BudgetStatus]}
                textColorClass={s.status === BudgetStatus.TRANSFORMADO ? 'text-leroy-green' : 'text-slate-800'}
              />
            ))}
          </div>
          <DashboardCharts budgets={budgets} />
        </section>

        <section>
          <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 font-black uppercase tracking-widest italic">
                    <th className="px-6 py-4">Ref. Acto</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Vendedor Sección</th>
                    <th className="px-6 py-4">Fechas (Crea / Gest)</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBudgets.map((b) => (
                    <tr key={b.id} className="hover:bg-green-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{b.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-leroy-dark uppercase leading-tight">{b.cliente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 uppercase leading-tight">{b.vendedor}</p>
                        <p className="text-[9px] text-leroy-green font-black uppercase tracking-tighter">{b.seccion}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 leading-tight">
                           <span className="text-[9px] text-slate-400">Crea: {b.fechaCreacion || '--'}</span>
                           <span className={`text-[9px] font-bold ${b.fechaGestion ? 'text-leroy-green' : 'text-slate-300'}`}>
                             Gest: {b.fechaGestion || (
                               (b.estado === BudgetStatus.ANULADO || b.estado === BudgetStatus.TRANSFORMADO) 
                               ? '--' 
                               : 'Pendiente'
                             )}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase border ${STATUS_BG_COLORS[b.estado]}`}>
                          {b.estado}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-black text-right ${b.total < 600 ? 'text-red-600' : 'text-leroy-dark'}`}>
                        {new Intl.NumberFormat('es-ES').format(b.total)} €
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedBudget(b)}
                          className="px-4 py-2 bg-leroy-green text-white rounded text-[10px] font-black uppercase shadow-sm hover:bg-green-700 transition-all active:scale-95"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBudgets.length === 0 && (
              <div className="p-16 text-center text-slate-300 uppercase font-black text-[11px] tracking-[0.2em] bg-slate-50/50">
                Sin resultados con los filtros actuales
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedBudget && (
        <BudgetModal 
          budget={selectedBudget} 
          isOpen={!!selectedBudget} 
          onClose={() => setSelectedBudget(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
};

export default App;
