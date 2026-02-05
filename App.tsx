
import React, { useState, useEffect, useMemo } from 'react';
import { Budget, BudgetStatus } from './types';
import { STATUS_BG_COLORS, SELLER_DATA } from './constants';
import StatCard from './components/StatCard';
import DashboardCharts from './components/DashboardCharts';
import BudgetModal from './components/BudgetModal';
import { fetchBudgets, updateBudgetOnSheet } from './services/googleSheetService';

type SortConfig = {
  key: keyof Budget;
  direction: 'asc' | 'desc';
} | null;

const App: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('');
  const [filterSellerType, setFilterSellerType] = useState<string>(''); 
  const [filterSeccion, setFilterSeccion] = useState(''); // Restaurado: Filtro de sección
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');

  // Ordenación por defecto: Fecha más reciente primero
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fechaCreacion', direction: 'desc' });

  // Normalización de fechas para lógica interna
  const normalizeDate = (val: any): string => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).split(' ')[0];
    return d.toISOString().split('T')[0];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBudgets();
      const normalizedData = (data || []).map(b => ({
        ...b,
        fechaCreacion: normalizeDate(b.fechaCreacion)
      }));
      setBudgets(normalizedData);
    } catch (err) {
      console.error("Error al cargar presupuestos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Formato DD/MM/AAAA para visualización con máxima robustez
  const formatDateToES = (dateInput: any) => {
    if (!dateInput || dateInput === "null" || dateInput === "undefined") return '--/--/----';
    
    const input = String(dateInput).trim();

    // 1. Si ya tiene el formato DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input;

    // 2. Si es formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
      const parts = input.split('T')[0].split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // 3. Intento de parseo por Date (para casos como el string largo de la imagen)
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // 4. Limpieza básica de emergencia (tomar solo la primera parte si hay espacios)
    return input.split(' ')[0];
  };

  // Secciones únicas para el select (basado en SELLER_DATA y budgets)
  const uniqueSections = useMemo(() => {
    const sectionsFromData = budgets.map(b => {
      const sellerNameUpper = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
      return SELLER_DATA[sellerNameUpper]?.section || "Sin sección";
    });
    return Array.from(new Set(sectionsFromData)).sort();
  }, [budgets]);

  // Vendedores únicos para el select
  const uniqueSellers = useMemo(() => {
    const s = Array.from(new Set(budgets.map(b => b.vendedor))).filter(Boolean);
    return s.sort();
  }, [budgets]);

  // Lógica de filtrado y ordenación
  const filteredAndSortedBudgets = useMemo(() => {
    let result = budgets.filter(b => {
      const sellerNameUpper = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
      const sellerInfo = SELLER_DATA[sellerNameUpper];
      const sellerType = sellerInfo?.type || '';
      const sellerSection = sellerInfo?.section || "Sin sección";

      const cleanSearch = search.trim().toLowerCase();
      const matchesSearch = !cleanSearch || 
        b.id.toLowerCase().includes(cleanSearch) || 
        b.cliente.toLowerCase().includes(cleanSearch);

      const matchesVendedor = !filterVendedor || b.vendedor === filterVendedor;
      
      // Lógica de filtro especial: si se elige PRO, se filtra por b.isPro
      let matchesSellerType = true;
      if (filterSellerType === 'PRO') {
        matchesSellerType = !!b.isPro;
      } else if (filterSellerType) {
        matchesSellerType = sellerType === filterSellerType;
      }

      const matchesSeccion = !filterSeccion || sellerSection === filterSeccion;
      const matchesEstado = !filterEstado || b.estado === filterEstado;
      
      const budgetDate = b.fechaCreacion;
      const matchesFechaInicio = !filterFechaInicio || budgetDate >= filterFechaInicio;
      const matchesFechaFin = !filterFechaFin || budgetDate <= filterFechaFin;
      
      return matchesSearch && matchesVendedor && matchesSellerType && matchesSeccion && matchesEstado && 
             matchesFechaInicio && matchesFechaFin;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key] || '';
        let bValue: any = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'fechaCreacion') {
          aValue = new Date(aValue).getTime() || 0;
          bValue = new Date(bValue).getTime() || 0;
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [budgets, search, filterVendedor, filterSellerType, filterSeccion, filterEstado, filterFechaInicio, filterFechaFin, sortConfig]);

  const stats = useMemo(() => {
    const totalAmount = filteredAndSortedBudgets.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
    const byStatus = Object.values(BudgetStatus).map(status => {
      const filtered = filteredAndSortedBudgets.filter(b => b.estado === status);
      const amount = filtered.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
      return { 
        status, 
        amount, 
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0 
      };
    });
    return { totalAmount, byStatus };
  }, [filteredAndSortedBudgets]);

  const handleUpdate = async (id: string, status: BudgetStatus, notes: string, fechaGestion: string) => {
    await updateBudgetOnSheet(id, status, notes, fechaGestion);
    setBudgets(prev => prev.map(b => 
      b.id === id ? { ...b, estado: status, notas: notes, fechaGestion } : b
    ));
  };

  const requestSort = (key: keyof Budget) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-leroy-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-leroy-dark font-black uppercase tracking-widest text-[10px]">LEROY MERLIN - Sincronizando datos...</p>
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
          
          <div className="grid grid-cols-2 lg:flex items-center gap-2 flex-1 max-w-7xl">
             <input 
                type="text" placeholder="Acto o Cliente..."
                className="px-2 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all min-w-[100px]"
                value={search} onChange={e => setSearch(e.target.value)}
             />
             <select 
                className="px-2 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all min-w-[80px]"
                value={filterSellerType} onChange={e => setFilterSellerType(e.target.value)}
             >
                <option value="">Tipo</option>
                <option value="VP">VP</option>
                <option value="VE">VE</option>
                <option value="PRO">PRO</option>
             </select>
             <select 
                className="px-2 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all min-w-[120px]"
                value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}
             >
                <option value="">Sección (Todas)</option>
                {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <select 
                className="px-2 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all min-w-[100px]"
                value={filterVendedor} onChange={e => setFilterVendedor(e.target.value)}
             >
                <option value="">Vendedor</option>
                {uniqueSellers.map(v => <option key={v} value={v}>{v}</option>)}
             </select>
             <select 
                className="px-2 py-2 bg-slate-100 rounded border-2 border-transparent focus:border-leroy-green outline-none text-[10px] font-bold transition-all"
                value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
             >
                <option value="">Estado</option>
                {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             
             <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded min-w-[170px]">
                <div className="flex flex-col flex-1">
                  <span className="text-[7px] font-black uppercase text-slate-500 px-1 leading-none">Desde</span>
                  <input 
                    type="date" className="bg-transparent text-[9px] outline-none h-4 font-bold"
                    value={filterFechaInicio} onChange={e => setFilterFechaInicio(e.target.value)}
                  />
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex flex-col flex-1">
                  <span className="text-[7px] font-black uppercase text-slate-500 px-1 leading-none">Hasta</span>
                  <input 
                    type="date" className="bg-transparent text-[9px] outline-none h-4 font-bold"
                    value={filterFechaFin} onChange={e => setFilterFechaFin(e.target.value)}
                  />
                </div>
             </div>

             <button onClick={loadData} title="Refrescar" className="p-2 bg-leroy-green text-white rounded hover:bg-green-700 transition-all shadow-sm active:scale-95">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
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
                label="TOTAL FILTRADO" 
                value={`${new Intl.NumberFormat('es-ES').format(stats.totalAmount)} €`} 
                percentage={100}
                colorClass="bg-slate-200 text-slate-600 border-slate-300"
                textColorClass="text-slate-900"
              />
          </div>
          <DashboardCharts budgets={filteredAndSortedBudgets} />
        </section>

        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 font-black uppercase tracking-widest italic text-[9px]">
                    <th className="px-6 py-4">Ref. Acto</th>
                    <th 
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group border-l border-slate-100"
                      onClick={() => requestSort('fechaCreacion')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Fecha Crea.</span>
                        <span className="text-leroy-green group-hover:scale-125 transition-transform text-[14px]">
                          {sortConfig?.key === 'fechaCreacion' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Vendedor / Sección</th>
                    <th className="px-6 py-4">Notas de Gestión</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedBudgets.map((b) => {
                    const sellerNameClean = b.vendedor ? b.vendedor.trim().toUpperCase() : '';
                    const sellerInfo = SELLER_DATA[sellerNameClean];
                    const sellerType = sellerInfo?.type || '';
                    const sellerSection = sellerInfo?.section || "Sin sección";
                    
                    return (
                      <tr key={b.id} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">{b.id}</td>
                        <td className="px-6 py-4 border-l border-slate-50">
                          <span className="text-[10px] text-slate-700 font-black bg-slate-100 px-3 py-1.5 rounded shadow-sm border border-slate-200 inline-block min-w-[95px] text-center whitespace-nowrap">
                            {formatDateToES(b.fechaCreacion)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-leroy-dark uppercase leading-tight truncate max-w-[140px]">{b.cliente}</p>
                            {b.isPro && (
                              <span className="bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter shadow-sm">PRO</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
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
                          <p className="text-[10px] text-slate-500 font-medium italic truncate max-w-[200px]" title={b.notas}>
                            {b.notas || <span className="text-slate-300 italic">Sin observaciones...</span>}
                          </p>
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
