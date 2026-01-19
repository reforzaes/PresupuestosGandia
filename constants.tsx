
import { BudgetStatus, Budget } from './types';

export const STATUS_COLORS: Record<BudgetStatus, string> = {
  [BudgetStatus.EN_CURSO]: '#3b82f6',
  [BudgetStatus.GESTIONANDO]: '#f59e0b',
  [BudgetStatus.TRANSFORMADO]: '#669900', // Leroy Green
  [BudgetStatus.ANULADO]: '#ef4444',
};

export const STATUS_BG_COLORS: Record<BudgetStatus, string> = {
  [BudgetStatus.EN_CURSO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [BudgetStatus.GESTIONANDO]: 'bg-amber-100 text-amber-800 border-amber-200',
  [BudgetStatus.TRANSFORMADO]: 'bg-green-100 text-green-800 border-green-200',
  [BudgetStatus.ANULADO]: 'bg-red-100 text-red-800 border-red-200',
};

export const MOCK_DATA: Budget[] = [
  { id: '513497', multiActo: '', cliente: 'ROBLES GOM', vendedor: 'GRAU ANDRE', seccion: 'Madera', fechaCreacion: '2025-01-12', dispoEl: '', tipo: 'Presupuesto', estado: BudgetStatus.EN_CURSO, fechaGestion: '', total: 234.57, notas: '' },
  { id: '513544', multiActo: '', cliente: 'BOLO ESTEVE', vendedor: 'MORENO MA', seccion: 'Sanitarios', fechaCreacion: '2025-01-12', dispoEl: '', tipo: 'Presupuesto', estado: BudgetStatus.ANULADO, fechaGestion: '2025-01-13', total: 193.80, notas: 'Precio alto' },
  { id: '513725', multiActo: '', cliente: 'RAQUEL PRO', vendedor: 'RAQUEL', seccion: 'Jardín', fechaCreacion: '2025-01-15', dispoEl: '', tipo: 'Presupuesto', estado: BudgetStatus.GESTIONANDO, fechaGestion: '2025-01-16', total: 15234.57, notas: 'Revisando stock' },
];
