
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

// Listado oficial de secciones para asegurar su visibilidad en filtros
export const OFFICIAL_SECTIONS = [
  "Carpintería y Madera",
  "Renovables Confort",
  "Cerámica",
  "Sanitario",
  "Cocinas y Armarios",
  "Jardín",
  "Materiales",
  "VAD",
  "CPC",
  "Ferretería",
  "PRO"
];

// Mapeo exhaustivo de vendedores v6.0 - Normalizado
export const SELLER_DATA: Record<string, { type: string, section: string }> = {
  // CARPINTERÍA
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
  'ROQUE FEMENÍA': { type: 'VE', section: 'Carpintería y Madera' },

  // RENOVABLES / CONFORT
  'HERNANDEZ RAQUEL': { type: 'VP', section: 'Renovables Confort' },
  'KONIETZKO NATASCHA': { type: 'VP', section: 'Renovables Confort' },
  'MARTINEZ EDGAR': { type: 'VE', section: 'Renovables Confort' },
  'PEREZ CRISTIAN': { type: 'VE', section: 'Renovables Confort' },
  'RIOS ANILIN': { type: 'VE', section: 'Renovables Confort' },
  'ENRIQUE ALCAÑIZ': { type: 'VE', section: 'Renovables Confort' },
  'PAU PERET': { type: 'VE', section: 'Renovables Confort' },
  'CABRAL MARCELO': { type: 'VE', section: 'Renovables Confort' },

  // CERÁMICA
  'DAUDER JUAN MANUEL': { type: 'VP', section: 'Cerámica' },
  'FRANCISCO GARCIA': { type: 'VE', section: 'Cerámica' },
  'MARIA JOSE ZEAS': { type: 'VE', section: 'Cerámica' },
  'VICENT DONET': { type: 'Mm', section: 'Cerámica' },
  'LLINARES MIGUEL': { type: 'VE', section: 'Cerámica' },

  // SANITARIO
  'HERRERA MIGUEL ANGEL': { type: 'VP', section: 'Sanitario' },
  'MORENO MARIA CRISTINA': { type: 'VP', section: 'Sanitario' },
  'ROIG BEGONA': { type: 'VE', section: 'Sanitario' },
  'NAVARRO JOSE': { type: 'VE', section: 'Sanitario' },
  'MALONDA BLANCA': { type: 'VE', section: 'Sanitario' },
  'GARCIA ALEXANDRA': { type: 'VE', section: 'Sanitario' },
  'DE RAMOS PABLO': { type: 'VE', section: 'Sanitario' },
  'GRAU ANDREA': { type: 'VE', section: 'Sanitario' },

  // COCINAS Y ARMARIOS
  'CEREZO MAYBETH': { type: 'VP', section: 'Cocinas y Armarios' },
  'COMPANY RAQUEL': { type: 'VP', section: 'Cocinas y Armarios' },
  'VAZQUEZ LARA PALMIRA': { type: 'VP', section: 'Cocinas y Armarios' },
  'LLOPIS LAURA': { type: 'VE', section: 'Cocinas y Armarios' },
  'CASTELLA JORGE': { type: 'VE', section: 'Cocinas y Armarios' },
  'VILLAR DANIEL': { type: 'VE', section: 'Cocinas y Armarios' },
  'SANCHEZ SILVIA': { type: 'VE', section: 'Cocinas y Armarios' },
  'PAREDES ANALIA': { type: 'VE', section: 'Cocinas y Armarios' },
  'MARIA VICTORIA ROGER': { type: 'Mm', section: 'Cocinas y Armarios' },

  // JARDÍN
  'APARICIO ALBERTO': { type: 'VP', section: 'Jardín' },
  'YOLANDA DIAZ': { type: 'VE', section: 'Jardín' },
  'ANA JULIA BULLETINI': { type: 'VE', section: 'Jardín' },
  'YUDTHI GARZON': { type: 'VE', section: 'Jardín' },
  'JOSE MANUEL PRIETO': { type: 'MM', section: 'Jardín' },
  'IKER ORTS': { type: 'VE', section: 'Jardín' },
  'SANDRA ULLAN': { type: 'VE', section: 'Jardín' },

  // MATERIALES
  'RUTH LANGO': { type: 'VE', section: 'Materiales' },
  'CLIMENT FRANCISCO': { type: 'VE', section: 'Materiales' },
  'PABLO MARCELO CASTANO': { type: 'VE', section: 'Materiales' },
  'JEREMIAS ESCRIVA': { type: 'Mm', section: 'Materiales' },

  // VAD
  'LETICIA GARCIA': { type: 'VE', section: 'VAD' },
  'FERNANDO GARCIA': { type: 'VE', section: 'VAD' },
  'ESTHER SIGUENZA': { type: 'VAD', section: 'VAD' },
  'DANIEL RUBIO DIAZ': { type: 'VAD', section: 'VAD' },
  'MICHEL FERNANDEZ': { type: 'VAD', section: 'VAD' },
  'JAVIER PEREZ': { type: 'VAD', section: 'VAD' },
  'VERONICA FERNANDEZ': { type: 'VAD', section: 'VAD' },
  'JUAN ALFREDO REYES': { type: 'VAD', section: 'VAD' },
  'LAURA RIOS': { type: 'VAD', section: 'VAD' },
  'SORAYA APARECIDA GRAM': { type: 'VAD', section: 'VAD' },

  // CPC
  'MARTÍ LAURA': { type: 'CPC', section: 'CPC' },
  'MORANTE JUAN ANTONIO': { type: 'CPC', section: 'CPC' },

  // FERRETERÍA
  'MARIO ISMAEL DIAZ': { type: 'VE', section: 'Ferretería' },
  'JAVIER MONTFERRER': { type: 'VE', section: 'Ferretería' },

  // PRO
  'CASTELLO RAFAEL': { type: 'PRO', section: 'PRO' },
  'MARIA GORETTI PORRERO': { type: 'PRO', section: 'PRO' },
  'CABRERA VICENTE JAVIER': { type: 'PRO', section: 'PRO' },
  'ROSELL JOSE ANTONIO': { type: 'PRO', section: 'PRO' }
};

export const MOCK_DATA: Budget[] = [];
