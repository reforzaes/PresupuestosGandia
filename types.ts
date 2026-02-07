
export enum BudgetStatus {
  EN_CURSO = 'En curso',
  GESTIONANDO = 'Gestionando',
  TRANSFORMADO = 'Transformado',
  ANULADO = 'Anulado'
}

export interface Budget {
  id: string; // Acto de venta
  multiActo: string;
  cliente: string;
  vendedor: string;
  seccion: string; // Columna E
  fechaCreacion: string; // Columna F
  dispoEl: string;
  tipo: string;
  estado: BudgetStatus; // Columna I
  fechaGestion: string; // Columna J
  total: number; // Columna K
  notas: string; // Columna L
  proStatus?: string; // Columna M: Captura "PRO" o "PRO Cartera"
}
