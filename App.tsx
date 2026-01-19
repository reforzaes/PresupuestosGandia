
import React, { useState, useEffect, useMemo } from 'react';
import { Budget, BudgetStatus } from './types';
import { STATUS_BG_COLORS, SELLER_DATA } from './constants';
import StatCard from './components/StatCard';
import DashboardCharts from './components/DashboardCharts';
import BudgetModal from './components/BudgetModal';
import { fetchBudgets, updateBudgetOnSheet } from './services/googleSheetService';

const App: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [filterSeccion, setFilterSeccion] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterSellerType, setFilterSellerType] = useState<string>(''); 
  const [filterFechaCrea, setFilterFechaCrea] = useState('');

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

  // Secciones oficiales únicas
  const sections = useMemo(() => {
    const s = Array.from(new Set(Object.values(SELLER_DATA).map(d => d.section)));
    return s.sort();
  }, []);

  // Lógica de filtrado corregida y estricta
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      // Normalización para comparación
      const vendedorName = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
      const sellerInfo = SELLER_DATA[vendedorName];
      
      // La SECCIÓN se toma de la base de datos oficial del vendedor
      const officialSection = sellerInfo?.section || b.seccion;
      const sellerType = sellerInfo?.type || '';

      // Filtro de búsqueda: prioriza Acto exacto o Cliente que contenga el texto
      const cleanSearch = search.trim().toLowerCase();
      const matchesSearch = !cleanSearch || 
        b.id.toLowerCase().includes(cleanSearch) || 
        b.cliente.toLowerCase().includes(cleanSearch);

      // Filtro de sección: debe coincidir con la oficial del vendedor
      const matchesSeccion = !filterSeccion || officialSection === filterSeccion;
      
      const matchesEstado = !filterEstado || b.estado === filterEstado;
      const matchesSellerType = !filterSellerType || sellerType === filterSellerType;
      const matchesFechaCrea = !filterFechaCrea || (b.fechaCreacion && b.fechaCreacion.includes(filterFechaCrea));
      
      return matchesSearch && matchesSeccion && matchesEstado && matchesSellerType && matchesFechaCrea;
    });
  }, [budgets, search, filterSeccion, filterEstado, filterSellerType, filterFechaCrea]);

  // Estadísticas basadas en los presupuestos FILTRADOS
  const stats = useMemo(() => {
    const totalAmount = filteredBudgets.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
    const byStatus = Object.values(BudgetStatus).map(status => {
      const filtered = filteredBudgets.filter(b => b.estado === status);
      const amount = filtered.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
      return { 
        status, 
        amount, 
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0 
      };
    });
    return { totalAmount, byStatus };
  }, [filteredBudgets]);

  const handleUpdate = async (id: string, status: BudgetStatus, notes: string, fechaGestion: string) => {
    await updateBudgetOnSheet(id, status, notes, fechaGestion);
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
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900 font-sans">
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
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Gestión Gandía</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:flex items-center gap-2 flex-1 max-w-5xl">
             <input 
                type="text" placeholder="Acto o Cliente..."
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all min-w-[140px]"
                value={search} onChange={e => setSearch(e.target.value)}
             />
             <select 
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all"
                value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}
             >
                <option value="">Sección (Todas)</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <select 
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all"
                value={filterSellerType} onChange={e => setFilterSellerType(e.target.value)}
             >
                <option value="">VP / VE (Todos)</option>
                <option value="VP">Vendedor Proyecto (VP)</option>
                <option value="VE">Vendedor Especialista (VE)</option>
             </select>
             <select 
                className="px-3 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all"
                value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
             >
                <option value="">Estado (Cualquiera)</option>
                {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <div className="flex flex-col bg-slate-50 border border-slate-200 p-1 rounded min-w-[90px]">
                <span className="text-[7px] font-black uppercase text-slate-500 px-1 leading-none">Creado</span>
                <input 
                  type="date" className="bg-transparent text-[10px] outline-none h-4"
                  value={filterFechaCrea} onChange={e => setFilterFechaCrea(e.target.value)}
                />
             </div>
             <button onClick={loadData} title="Refrescar" className="p-2 bg-leroy-green text-white rounded hover:bg-green-700 transition-all shadow-sm active:scale-95">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* KPI Summary Row */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.byStatus.map((s, i) => (
              <StatCard 
                key={i} label={s.status} 
                value={`${new Intl.NumberFormat('es-ES').format(s.amount)} €`} 
                percentage={s.percentage}
                colorClass={STATUS_BG_COLORS[s.status as BudgetStatus]}
                textColorClass={s.status === BudgetStatus.TRANSFORMADO ? 'text-leroy-green' : 'text-slate-800'}
              />
            ))}
            <StatCard 
                label="TOTAL GENERAL" 
                value={`${new Intl.NumberFormat('es-ES').format(stats.totalAmount)} €`} 
                percentage={100}
                colorClass="bg-slate-200 text-slate-600 border-slate-300"
                textColorClass="text-slate-900"
              />
          </div>
          {/* Gráficos reactivos al filtrado */}
          <DashboardCharts budgets={filteredBudgets} />
        </section>

        {/* Results Table */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 font-black uppercase tracking-widest italic text-[9px]">
                    <th className="px-6 py-4">Ref. Acto</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Colaborador / Sección Oficial</th>
                    <th className="px-6 py-4">Creación</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBudgets.map((b) => {
                    const sellerNameClean = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
                    const sellerInfo = SELLER_DATA[sellerNameClean];
                    const sellerType = sellerInfo?.type || '';
                    const sellerSection = sellerInfo?.section || b.seccion;
                    
                    return (
                      <tr key={b.id} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{b.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-leroy-dark uppercase leading-tight truncate max-w-[180px]">{b.cliente}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="font-bold text-slate-700 uppercase leading-tight">{b.vendedor}</p>
                            {sellerType && (
                              <span className={`px-1.5 py-0.5 rounded-[2px] text-[7px] font-black ${sellerType === 'VP' ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>
                                {sellerType}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-leroy-green font-black uppercase tracking-tighter">{sellerSection}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-slate-400 font-medium">{b.fechaCreacion || '--'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase border ${STATUS_BG_COLORS[b.estado]}`}>
                            {b.estado}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-black text-right text-[13px] ${b.total < 600 ? 'text-red-600' : 'text-leroy-dark italic'}`}>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredBudgets.length === 0 && (
              <div className="p-20 text-center text-slate-300 uppercase font-black text-[10px] tracking-[0.3em] bg-slate-50/50">
                Sin resultados para esta búsqueda
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
