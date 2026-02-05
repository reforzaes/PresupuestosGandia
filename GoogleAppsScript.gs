
/**
 * LEROY MERLIN - SCRIPT DE SINCRONIZACIÓN v3.8
 */

const SHEET_NAME = "Presupuestos";

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return createJsonResponse({ error: "No se encuentra la hoja '" + SHEET_NAME + "'" });
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createJsonResponse([]); // Solo cabeceras

  // Filtramos para ignorar filas donde la columna A (Acto) esté vacía
  const rows = data.slice(1).filter(row => row[0] && String(row[0]).trim() !== "");
  
  const result = rows.map(row => {
    // Columna M es el índice 12. Verificamos si contiene la palabra "PRO"
    const proValue = String(row[12] || "").toUpperCase();
    const isPro = proValue.includes("PRO") || proValue === "SÍ" || proValue === "SI" || proValue === "X";

    return {
      id: String(row[0] || ""),           // A: Acto
      multiActo: String(row[1] || ""),    // B: MultiActo
      cliente: String(row[2] || ""),      // C: Cliente
      vendedor: String(row[3] || ""),     // D: Vendedor
      seccion: String(row[4] || ""),      // E: Sección
      fechaCreacion: formatDate(row[5]),  // F: Fecha Creación
      dispoEl: String(row[6] || ""),      // G: Dispo
      tipo: String(row[7] || ""),         // H: Tipo
      estado: String(row[8] || "En curso"), // I: Estado
      fechaGestion: formatDate(row[9]),   // J: Fecha Gestión
      total: parseFloat(row[10]) || 0,    // K: Total
      notas: String(row[11] || ""),       // L: Notas
      isPro: isPro                        // M: PRO
    };
  });
  
  return createJsonResponse(result);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { id, status, notes, fechaGestion } = params;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    let rowFound = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        rowFound = i + 1; 
        break;
      }
    }
    
    if (rowFound !== -1) {
      sheet.getRange(rowFound, 9).setValue(status);       // Col I: Estado
      sheet.getRange(rowFound, 10).setValue(fechaGestion); // Col J: Fecha Gestión
      sheet.getRange(rowFound, 12).setValue(notes);        // Col L: Notas
      
      return createJsonResponse({ success: true });
    }
    
    return createJsonResponse({ success: false, error: "Referencia de Acto no encontrada: " + id });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Formatea valores de fecha para que sean consistentes (YYYY-MM-DD)
 */
function formatDate(val) {
  if (!val) return "";
  
  // Si es un objeto Date de Google Sheets
  if (val instanceof Date) {
    try {
      return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } catch (e) {
      return val.toISOString().split('T')[0];
    }
  }

  let sVal = String(val).trim();
  
  // Si ya viene como string largo de sistema (GMT...)
  if (sVal.length > 15 && (sVal.includes('GMT') || sVal.includes('UTC'))) {
    const d = new Date(sVal);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }

  // Si es un formato común de string DD/MM/YYYY
  if (sVal.includes('/')) {
    let parts = sVal.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
  }
  
  // Si es un ISO string con tiempo T00:00:00
  if (sVal.includes('T')) {
    return sVal.split('T')[0];
  }

  return sVal;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
