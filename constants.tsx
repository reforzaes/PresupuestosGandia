
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

// Mapeo exhaustivo de vendedores: Categoría y Sección (Normalizado)
export const SELLER_DATA: Record<string, { type: 'VP' | 'VE', section: string }> = {
  'TODOLI MIGUEL': { type: 'VP', section: 'Carpintería y Madera' },
  'FUSTER JORGE': { type: 'VP', section: 'Carpintería y Madera' },
  'FEMENIA FRANK': { type: 'VP', section: 'Carpintería y Madera' },
  'VIDAL PABLO': { type: 'VE', section: 'Carpintería y Madera' },
  'POSADA JUAN DIEGO': { type: 'VE', section: 'Carpintería y Madera' },
  'MONTOYA IVAN': { type: 'VE', section: 'Carpintería y Madera' },
  'QUILEZ ANA ISABEL': { type: 'VE', section: 'Carpintería y Madera' },
  'ANDRADE RODRIGO': { type: 'VE', section: 'Carpintería y Madera' },
  'PRIETO DAVID': { type: 'VE', section: 'Carpintería y Madera' },
  'MORENO JUAN': { type: 'VE', section: 'Carpintería y Madera' },
  'HERNANDEZ RAQUEL': { type: 'VP', section: 'Renovables Confort' },
  'KONIETZKO NATASCHA': { type: 'VP', section: 'Renovables Confort' },
  'MARTINEZ EDGAR': { type: 'VE', section: 'Renovables Confort' },
  'PEREZ CRISTIAN': { type: 'VE', section: 'Renovables Confort' },
  'RIOS ANILIN': { type: 'VE', section: 'Renovables Confort' },
  'DAUDER JUAN MANUEL': { type: 'VP', section: 'Cerámica' },
  'HERRERA MIGUEL ANGEL': { type: 'VP', section: 'Sanitario' },
  'MORENO MARIA CRISTINA': { type: 'VP', section: 'Sanitario' },
  'ROIG BEGONA': { type: 'VE', section: 'Sanitario' },
  'NAVARRO JOSE': { type: 'VE', section: 'Sanitario' },
  'MALONDA BLANCA': { type: 'VE', section: 'Sanitario' },
  'GARCIA ALEXANDRA': { type: 'VE', section: 'Sanitario' },
  'DE RAMOS PABLO': { type: 'VE', section: 'Sanitario' },
  'GRAU ANDREA': { type: 'VE', section: 'Sanitario' },
  'CEREZO MAYBETH': { type: 'VP', section: 'Cocinas y Armarios' },
  'COMPANY RAQUEL': { type: 'VP', section: 'Cocinas y Armarios' },
  'VAZQUEZ LARA PALMIRA': { type: 'VP', section: 'Cocinas y Armarios' },
  'LLOPIS LAURA': { type: 'VE', section: 'Cocinas y Armarios' },
  'CASTELLA JORGE': { type: 'VE', section: 'Cocinas y Armarios' },
  'VILLAR DANIEL': { type: 'VE', section: 'Cocinas y Armarios' },
  'SANCHEZ SILVIA': { type: 'VE', section: 'Cocinas y Armarios' },
  'PAREDES ANALIA': { type: 'VE', section: 'Cocinas y Armarios' },
  'APARICIO ALBERTO': { type: 'VP', section: 'Jardín' }
};

export const MOCK_DATA: Budget[] = [
  { id: '513497', multiActo: '', cliente: 'EJEMPLO CARPINTERIA', vendedor: 'TODOLI MIGUEL', seccion: 'Carpintería y Madera', fechaCreacion: '2025-01-12', dispoEl: '', tipo: 'Presupuesto', estado: BudgetStatus.EN_CURSO, fechaGestion: '', total: 850.00, notas: '' },
  { id: '513544', multiActo: '', cliente: 'EJEMPLO COCINAS', vendedor: 'CEREZO MAYBETH', seccion: 'Cocinas y Armarios', fechaCreacion: '2025-01-13', dispoEl: '', tipo: 'Presupuesto', estado: BudgetStatus.GESTIONANDO, fechaGestion: '', total: 540.20, notas: '' },
];
