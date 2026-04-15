/**
 * @file GoogleSheetsService.ts
 * @description Servicio para gestión de datos de prueba en Google Sheets y Google Drive.
 *
 * Funcionalidades principales:
 * - getFileIdByName: Busca un spreadsheet por nombre en Google Drive.
 * - saveDataInLastEmptyRow: Inserta una fila nueva al final de la hoja con mapeo automático por encabezado.
 * - getAndLockRowByStatus: Obtiene una fila aleatoria por estado y la bloquea con "IN_PROGRESS - [QAName]".
 * - updateOrSaveData: Elimina el registro anterior (si existe) e inserta el actualizado.
 *
 * Equivalente a GoogleSheetsService.java del proyecto Selenium.
 *
 * @example
 * // Guardar datos de comunidad creada
 * await GoogleSheetsService.saveDataInLastEmptyRow('ComunidadesCL', dataMap);
 *
 * // Obtener y bloquear comunidad disponible
 * const data = await GoogleSheetsService.getAndLockRowByStatus('ComunidadesCL', 'ReadyForImpersonation');
 */
import { google, sheets_v4 } from 'googleapis';
import { PropertiesManager } from '@config/PropertiesManager';
import { CredentialsManager } from '@config/CredentialsManager';

/** Scopes requeridos */
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

// =============================================================================
// HELPERS INTERNOS
// =============================================================================

/**
 * Crea un cliente autenticado de Google Sheets usando Service Account.
 * @returns Cliente de Google Sheets autenticado.
 */
async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const credPath = PropertiesManager.getGoogleCredentialsPath();
  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: [SHEETS_SCOPE],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.sheets({ version: 'v4', auth: await auth.getClient() as any });
}

/**
 * Crea un cliente autenticado de Google Drive para búsqueda de archivos.
 * @returns Cliente de Google Drive autenticado.
 */
async function getDriveClient() {
  const credPath = PropertiesManager.getGoogleCredentialsPath();
  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: [DRIVE_SCOPE],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.drive({ version: 'v3', auth: await auth.getClient() as any });
}

/**
 * Convierte un índice de columna numérico (0-indexed) a su letra de Excel.
 * Equivalente al metodo getColumnLetter() en Java.
 *
 * @param column - Índice base 0.
 * @returns Letra(s) de columna (ej: 0 -> 'A', 26 -> 'AA').
 */
function getColumnLetter(column: number): string {
  let letter = '';
  let col = column;

  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }

  return letter;
}

// =============================================================================
// SERVICIO PRINCIPAL
// =============================================================================

export class GoogleSheetsService {
  /**
   * Busca el ID de un archivo Google Sheets por su nombre en Google Drive.
   * Emula el comportamiento de `gspread.client.open(fileName)` en Python.
   *
   * @param fileName - Nombre exacto del archivo en Google Drive.
   * @returns ID único del spreadsheet.
   * @throws Error si el archivo no se encuentra.
   */
  static async getFileIdByName(fileName: string): Promise<string> {
    const drive = await getDriveClient();

    const query = [
      `name = '${fileName}'`,
      `mimeType = 'application/vnd.google-apps.spreadsheet'`,
      `trashed = false`,
    ].join(' and ');

    const response = await drive.files.list({
      q: query,
      fields: 'files(id)',
    });

    const files = response.data.files ?? [];

    if (files.length === 0) {
      throw new Error(
        `Archivo de Google Sheets no encontrado en Drive: "${fileName}". ` +
        'Verifica que el Service Account tenga acceso al archivo.'
      );
    }

    return files[0].id as string;
  }

  /**
   * Guarda datos en la primera fila vacía después de la última fila con datos.
   * Mapea automáticamente cada dato al índice de columna correcto según el encabezado.
   *
   * @param sheetName - Nombre de la pestaña (hoja) donde se guardarán los datos.
   * @param dataToSave - Objeto con {NombreColumna: Valor}.
   * @throws Error si la hoja está vacía o no tiene encabezados.
   */
  static async saveDataInLastEmptyRow(
    sheetName: string,
    dataToSave: Record<string, string>
  ): Promise<void> {
    const fileName = PropertiesManager.getGoogleSheetsDatabaseName();
    const spreadsheetId = await this.getFileIdByName(fileName);
    const sheets = await getSheetsClient();

    // Leer solo la fila de encabezados — más liviano que traer todos los datos
    // y suficiente para construir el mapeo de columnas
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:ZZ1`,
    });

    const headerRow = headerResponse.data.values?.[0];

    if (!headerRow || headerRow.length === 0) {
      throw new Error(
        `La hoja "${sheetName}" está vacía o no tiene fila de encabezados.`
      );
    }

    // Preparar la fila con el tamaño exacto de los encabezados
    const rowData: string[] = new Array(headerRow.length).fill('');

    // Mapeo inteligente: colocar cada dato en su columna correspondiente
    for (const [key, value] of Object.entries(dataToSave)) {
      const colIndex = headerRow.indexOf(key);
      if (colIndex !== -1) {
        rowData[colIndex] = value;
      } else {
        console.warn(
          `[GoogleSheetsService] Encabezado "${key}" no encontrado en la hoja "${sheetName}".`
        );
      }
    }

    // append determina la última fila con datos del lado del servidor en una
    // sola llamada atómica — elimina la ventana de colisión entre workers
    // que existía con el patrón GET (calcular nextRow) + UPDATE
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowData] },
    });

    console.log(
      `[GoogleSheetsService] Registro guardado al final de "${sheetName}" en "${fileName}".`
    );
  }

  /**
   * Busca una fila aleatoria que coincida con el estado dado, la bloquea
   * actualizando StatusCommunity a "IN_PROGRESS - [QAName]" y retorna sus datos.
   *
   * El mecanismo de bloqueo previene que dos QA simultáneos trabajen con la misma data.
   *
   * @param sheetName - Nombre de la pestaña (hoja).
   * @param statusValue - Estado a buscar (ej: "ReadyForImpersonation").
   * @returns Record con los datos de la fila seleccionada, o null si no hay coincidencias.
   * @throws Error si la columna StatusCommunity no existe en la hoja.
   */
  static async getAndLockRowByStatus(
    sheetName: string,
    statusValue: string
  ): Promise<Record<string, string> | null> {
    const fileName = PropertiesManager.getGoogleSheetsDatabaseName();
    const spreadsheetId = await this.getFileIdByName(fileName);
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:ZZ`,
    });

    const allValues = response.data.values;

    if (!allValues || allValues.length < 2) {
      return null;
    }

    const headers = allValues[0];
    const statusColIndex = (headers as string[]).indexOf('StatusCommunity');

    if (statusColIndex === -1) {
      throw new Error(
        `La columna "StatusCommunity" no existe en la hoja "${sheetName}".`
      );
    }

    // Filtrar filas que coincidan con el estado buscado
    const matchingIndices: number[] = [];
    for (let i = 1; i < allValues.length; i++) {
      const row = allValues[i];
      const cellValue = row[statusColIndex]?.toString() ?? '';
      if (cellValue.toLowerCase() === statusValue.toLowerCase()) {
        matchingIndices.push(i);
      }
    }

    if (matchingIndices.length === 0) {
      console.warn(
        `[GoogleSheetsService] No se encontró ninguna fila con status ` +
        `"${statusValue}" en la hoja "${sheetName}".`
      );
      return null;
    }

    // Selección aleatoria de una fila coincidente
    const randomIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
    const selectedRow = allValues[randomIndex];

    // Bloquear la fila actualizando el estado
    const qaName = CredentialsManager.getQaName();
    const newStatus = `IN_PROGRESS - ${qaName}`;
    const columnLetter = getColumnLetter(statusColIndex);
    const cellAddress = `${sheetName}!${columnLetter}${randomIndex + 1}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellAddress,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newStatus]] },
    });

    console.log(
      `[GoogleSheetsService] Fila bloqueada para: ${qaName} en celda ${cellAddress}`
    );

    // Convertir la fila a Record<string, string>
    const result: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      result[headers[i] as string] = i < selectedRow.length
        ? String(selectedRow[i] ?? '')
        : '';
    }

    return result;
  }

  /**
   * Busca un registro existente por EmailCommunity + IdCommunity.
   * Si lo encuentra, elimina la fila antigua (para evitar duplicados)
   * y guarda los datos actualizados al final de la hoja.
   *
   * @param sheetName - Nombre de la pestaña (hoja).
   * @param dataToSave - Datos actualizados a persistir.
   * @throws Error si ocurre algún fallo en la API de Google.
   */
  static async updateOrSaveData(
    sheetName: string,
    dataToSave: Record<string, string>
  ): Promise<void> {
    const fileName = PropertiesManager.getGoogleSheetsDatabaseName();
    const spreadsheetId = await this.getFileIdByName(fileName);
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:ZZ`,
    });

    const allValues = response.data.values;

    if (!allValues || allValues.length === 0) {
      await this.saveDataInLastEmptyRow(sheetName, dataToSave);
      return;
    }

    const headers = allValues[0] as string[];
    const emailIdx = headers.indexOf('EmailCommunity');
    const idCommIdx = headers.indexOf('IdCommunity');

    const targetEmail = dataToSave['EmailCommunity'] ?? '';
    const targetId = dataToSave['IdCommunity'] ?? '';

    let rowToDelete: number | null = null;

    // Buscar coincidencia exacta por Email + ID
    for (let i = 1; i < allValues.length; i++) {
      const row = allValues[i];
      const rowEmail = row[emailIdx]?.toString() ?? '';
      const rowId = row[idCommIdx]?.toString() ?? '';

      if (rowEmail === targetEmail && rowId === targetId) {
        rowToDelete = i;
        break;
      }
    }

    // Eliminar la fila antigua si existe
    if (rowToDelete !== null) {
      const spreadsheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetMeta = spreadsheetMeta.data.sheets?.find(
        s => s.properties?.title === sheetName
      );

      if (!sheetMeta?.properties?.sheetId) {
        throw new Error(
          `No se encontró la pestaña "${sheetName}" en los metadatos del spreadsheet.`
        );
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetMeta.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowToDelete,
                endIndex: rowToDelete + 1,
              },
            },
          }],
        },
      });

      console.log(
        `[GoogleSheetsService] Fila duplicada eliminada (índice ${rowToDelete}). ` +
        'Guardando registro actualizado...'
      );
    }

    // Insertar los datos actualizados al final
    await this.saveDataInLastEmptyRow(sheetName, dataToSave);
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/services/GoogleSheetsService.ts
// Nota: requiere credenciales de Google en config/ y .env configurado
if (require.main === module) {
  (async () => {
    console.log('=== GoogleSheetsService ===');

    try {
      const sheetName = 'ComunidadesCL';

      const data = await GoogleSheetsService.getAndLockRowByStatus(sheetName, 'ReadyForImpersonation');
      if (data) {
        console.log('Fila obtenida y bloqueada:', data);
      } else {
        console.log(`Sin filas disponibles con status "ReadyForImpersonation" en "${sheetName}"`);
      }
    } catch (e) {
      console.error('Error:', (e as Error).message);
    }
  })();
}
