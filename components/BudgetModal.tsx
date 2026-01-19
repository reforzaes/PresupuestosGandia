
import React, { useState, useEffect } from 'react';
import { Budget, BudgetStatus } from '../types';
import { STATUS_BG_COLORS } from '../constants';

interface Props {
  budget: Budget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, status: BudgetStatus, notes: string, fechaGestion: string) => void;
}

const BudgetModal: React.FC<Props> = ({ budget, isOpen, onClose, onSave }) => {
  const [status, setStatus] = useState<BudgetStatus>(budget.estado);
  const [notes, setNotes] = useState(budget.notas);

  useEffect(() => {
    if (isOpen) {
      setStatus(budget.estado);
      setNotes(budget.notas);
    }
  }, [isOpen, budget]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Si el estado ha cambiado, generamos la fecha de gestión actual
    const hoy = new Date();
    const fechaFormatted = hoy.toISOString().split('T')[0];
    onSave(budget.id, status, notes, fechaFormatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border-t-8 border-leroy-green animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-leroy-dark uppercase tracking-tight italic">Gestión de Seguimiento</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-red-500 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Acto de Venta</p>
                <p className="text-md font-bold text-leroy-dark font-mono">{budget.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sección</p>
                <p className="text-md font-black text-leroy-green">{budget.seccion || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-leroy-dark uppercase tracking-widest mb-3">Nuevo Estado</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(BudgetStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-3 rounded text-[11px] font-black uppercase tracking-tighter border-2 transition-all ${
                    status === s 
                      ? `border-leroy-green bg-green-50 text-leroy-green shadow-sm` 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-leroy-dark uppercase tracking-widest mb-3">Notas del Colaborador</label>
            <textarea
              className="w-full h-40 p-4 rounded border-2 border-slate-100 focus:border-leroy-green outline-none transition-all resize-none text-sm text-slate-700 font-medium placeholder-slate-300"
              placeholder="Añade aquí los detalles de la gestión..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-4 bg-white border-2 border-slate-200 rounded text-slate-400 font-black uppercase text-xs hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 px-4 bg-leroy-green text-white rounded font-black uppercase text-xs shadow-lg shadow-green-200 hover:bg-green-700 transition-all hover:-translate-y-0.5"
          >
            Guardar Gestión
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
