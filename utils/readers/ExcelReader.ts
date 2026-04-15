/**
 * @file ExcelReader.ts
 * @description Lector de archivos Excel (.xlsx) para obtener datos de columnas específicas.
 * Busca la columna por nombre de encabezado y retorna los valores de esa columna
 * hasta el límite especificado.
 *
 * @example
 * const reader = new ExcelReader();
 * const unidades = await reader.readColumnFile(
 *   'Plantilla Propiedades Comunidad CC.xlsx',
 *   'Unidad',
 *   5
 * );
 * // => ["Torre A Depto 101", "Torre A Depto 102", ...]
 */
import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export class ExcelReader {
  /** Directorio base donde se buscan los archivos Excel de prueba */
  private readonly BASE_PATH: string = path.resolve(
    process.cwd(), 'test-data', 'files', 'documents'
  );

  /**
   * Lee los valores de una columna específica de un archivo Excel.
   * Busca la columna dinámicamente por su nombre de encabezado (fila 1).
   *
   * @param fileName - Nombre del archivo Excel (ej: "Plantilla Propiedades Comunidad CC.xlsx").
   * @param columnName - Nombre del encabezado de la columna a leer.
   * @param limit - Número máximo de registros a retornar.
   * @returns Array de strings con los valores de la columna (sin encabezado).
   * @throws Error si el archivo no existe o la columna no se encuentra.
   */
  async readColumnFile(fileName: string, columnName: string, limit: number): Promise<string[]> {
    const filePath = path.join(this.BASE_PATH, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Archivo Excel no encontrado: ${filePath}. ` +
        'Asegúrate de que el archivo está en test-data/files/documents/'
      );
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error(`El archivo "${fileName}" no contiene hojas de cálculo.`);
    }

    // Leer encabezados desde la primera fila
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value ?? '').trim();
    });

    const colIndex = headers.indexOf(columnName);
    if (colIndex === -1) {
      throw new Error(
        `Columna "${columnName}" no encontrada en el archivo "${fileName}". ` +
        `Encabezados disponibles: [${headers.join(', ')}]`
      );
    }

    // Extraer valores de la columna (desde fila 2, excluyendo encabezado)
    const values: string[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 || values.length >= limit) return;
      const cell = row.getCell(colIndex + 1); // exceljs usa índice 1-based
      const val = String(cell.value ?? '').trim();
      if (val !== '') values.push(val);
    });

    console.log(`[ExcelReader] Leídas ${values.length} entradas de columna "${columnName}" en "${fileName}"`);
    return values;
  }

  /**
   * Lee todos los valores de una columna sin límite artificial.
   * Equivalente a readColumnFile con limit=Infinity.
   *
   * @param fileName - Nombre del archivo Excel.
   * @param columnName - Nombre del encabezado de la columna.
   * @returns Array de strings con todos los valores no vacíos de la columna.
   */
  async readAllColumnValues(fileName: string, columnName: string): Promise<string[]> {
    return this.readColumnFile(fileName, columnName, Number.MAX_SAFE_INTEGER);
  }

  /**
   * Suma los valores numéricos de una columna completa.
   * Ignora celdas vacías o no numéricas (las trata como 0 con log de advertencia).
   *
   * @param fileName - Nombre del archivo Excel.
   * @param columnName - Nombre del encabezado de la columna.
   * @returns Suma numérica de todos los valores de la columna.
   */
  async sumColumn(fileName: string, columnName: string): Promise<number> {
    const values = await this.readAllColumnValues(fileName, columnName);
    let sum = 0;
    for (const raw of values) {
      const num = parseFloat(raw.replace(',', '.'));
      if (isNaN(num)) {
        console.warn(`[ExcelReader] Valor no numérico ignorado en "${columnName}": "${raw}"`);
      } else {
        sum += num;
      }
    }
    console.log(`[ExcelReader] Suma de "${columnName}" en "${fileName}": ${sum.toFixed(6)}`);
    return sum;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/readers/ExcelReader.ts
// Nota: requiere que los archivos existan en test-data/files/documents/
if (require.main === module) {
  (async () => {
    console.log('=== ExcelReader ===');
    const reader = new ExcelReader();

    // readColumnFile — primeras 3 unidades CC
    const units = await reader.readColumnFile(
      'Plantilla Propiedades Comunidad CC.xlsx', 'property[address]', 3
    );
    console.log('readColumnFile (property[address], limit=3):', units);

    // readAllColumnValues — todas las unidades CC
    const allUnits = await reader.readAllColumnValues(
      'Plantilla Propiedades Comunidad CC.xlsx', 'property[address]'
    );
    console.log('readAllColumnValues — total registros:', allUnits.length);

    // sumColumn — suma de prorrateos CC
    const total = await reader.sumColumn(
      'Plantilla Propiedades Comunidad CC.xlsx', 'property[size]'
    );
    console.log('sumColumn (property[size]):', total.toFixed(6));

    // sumColumn — suma de saldos CC
    const balanceSum = await reader.sumColumn(
      'Plantilla Saldos Comunidades CC.xlsx', 'common_expense[price]'
    );
    console.log('sumColumn (common_expense[price]):', balanceSum.toFixed(2));
  })();
}
