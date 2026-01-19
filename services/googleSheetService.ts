import { Budget, BudgetStatus } from "../types";
import { MOCK_DATA } from "../constants";

// Nueva URL definitiva de sincronización
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybcGDYPrATb8cZdTVwBR3Rv3Mb1eYq10HRJVKevAucXboWo5iAQn2Z3IPOYwHL7ybVxg/exec";

export const fetchBudgets = async (): Promise<Budget[]> => {
  try {
    const urlWithCacheBuster = `${SCRIPT_URL}?t=${Date.now()}`;
    
    const response = await fetch(urlWithCacheBuster, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    // Fallback a MOCK_DATA en caso de error de red o permisos
    return MOCK_DATA;
  }
};

export const updateBudgetOnSheet = async (id: string, status: BudgetStatus, notes: string, fechaGestion: string): Promise<boolean> => {
  try {
    const payload = JSON.stringify({ id, status, notes, fechaGestion });
    
    // El modo 'no-cors' es vital para evitar errores de pre-flight con Google Apps Script en peticiones POST
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' 
      },
      body: payload
    });
    
    return true; 
  } catch (error) {
    console.error("Sheet Update Error:", error);
    return false;
  }
};
