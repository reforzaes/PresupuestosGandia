
/**
 * LEROY MERLIN - SCRIPT DE SINCRONIZACIÓN v3.0
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. En tu Google Sheet, ve a "Extensiones" > "Apps Script".
 * 2. Borra todo el código existente y pega este bloque.
 * 3. Haz clic en el icono del disco (Guardar).
 * 4. Haz clic en el botón azul "Implementar" > "Nueva implementación".
 * 5. Tipo: "Aplicación web".
 * 6. Ejecutar como: "Yo".
 * 7. Quién tiene acceso: "Cualquiera".
 * 8. Copia la "URL de la aplicación web" y pégala en el archivo services/googleSheetService.ts de la app.
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

  const rows = data.slice(1);
  
  const result = rows.map(row => {
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
      notas: String(row[11] || "")        // L: Notas
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
        rowFound = i + 1; // +1 porque las filas en Sheets son 1-indexed
        break;
      }
    }
    
    if (rowFound !== -1) {
      // Actualizamos solo las columnas necesarias
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
  if (val instanceof Date) {
    return Utilities.formatDate(val, "GMT+1", "yyyy-MM-dd");
  }
  // Si ya es un string, intentamos limpiar si viene con hora
  if (typeof val === 'string' && val.includes('T')) {
    return val.split('T')[0];
  }
  return String(val);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
