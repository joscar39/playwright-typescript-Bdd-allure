/**
 * @file CommunityDocumentValidator.ts
 * @description Validaciones de negocio para los datos de documentos cargados a una comunidad.
 * Encapsula las reglas de comparación entre los valores mostrados en la web y los datos
 * del Excel de referencia, usando ExcelReader para la lectura de archivos.
 *
 * Reglas por validación:
 *  - unitsMatchExcel        → cada unidad de la web debe existir en la columna property[address] del Excel.
 *  - apportionmentMatchesExcel → suma de property[size] del Excel ≈ total prorrateo de la web (tol. 0.1).
 *  - balancesMatchExcel     → valores de la web tienen signo invertido respecto al Excel (excepto cero).
 */
import { ExcelReader } from '@utils/readers/ExcelReader';

// ── Archivos Excel por tipo de comunidad ─────────────────────────────────────
const FILES: Record<'CC' | 'SC', { properties: string; balances: string }> = {
  CC: {
    properties: 'Plantilla Propiedades Comunidad CC.xlsx',
    balances:   'Plantilla Saldos Comunidades CC.xlsx',
  },
  SC: {
    properties: 'Plantilla Propiedades Comunidad SC.xlsx',
    balances:   'Plantilla Saldos Comunidad SC.xlsx',
  },
};

// ── Nombres de columnas ───────────────────────────────────────────────────────
const COL_ADDRESS     = 'property[address]';
const COL_SIZE        = 'property[size]';
const COL_BALANCE     = 'common_expense[price]';

/** Tolerancia máxima permitida entre la suma del Excel y el total de prorrateo en la web. */
const APPORTIONMENT_TOLERANCE = 0.1;

export class CommunityDocumentValidator {
  private readonly reader = new ExcelReader();

  // ── Helper privado ─────────────────────────────────────────────────────────

  /**
   * Parsea un texto numérico proveniente de la web a un número flotante.
   * Maneja formatos como "$1.500,75", "-1500", "0,7", etc.
   */
  private parseWebNumber(text: string): number {
    // 1. Quitar símbolos de moneda y espacios
    // 2. Quitar puntos usados como separadores de miles (punto seguido de 3 dígitos)
    // 3. Reemplazar coma decimal por punto
    const clean = text
      .replace(/[^0-9.,-]/g, '')
      .replace(/\.(?=\d{3}(,|$))/g, '')
      .replace(',', '.');
    return parseFloat(clean);
  }

  private resolveFiles(communityType: string): { properties: string; balances: string } {
    const key = communityType as 'CC' | 'SC';
    if (!FILES[key]) {
      throw new Error(
        `Tipo de comunidad no reconocido: "${communityType}". Valores válidos: CC, SC`
      );
    }
    return FILES[key];
  }

  // ── Validaciones públicas ──────────────────────────────────────────────────

  /**
   * Verifica que cada unidad/propiedad visible en la web exista en la columna
   * property[address] del Excel de propiedades de la comunidad.
   * Solo evalúa los registros de la primera página (paginación de la web).
   *
   * @param webUnits      - Textos de la columna "Unidad" extraídos de la web.
   * @param communityType - 'CC' o 'SC'.
   * @returns true si todos los valores web se encuentran en el Excel.
   */
  async unitsMatchExcel(webUnits: string[], communityType: string): Promise<boolean> {
    const { properties: fileName } = this.resolveFiles(communityType);
    const excelUnits = await this.reader.readAllColumnValues(fileName, COL_ADDRESS);

    console.log(`[CommunityDocumentValidator] Web: ${webUnits.length} unidades | Excel: ${excelUnits.length} registros`);

    const notFound = webUnits.filter(
      webUnit => !excelUnits.some(excelUnit => excelUnit.trim() === webUnit.trim())
    );

    if (notFound.length > 0) {
      console.error(`[CommunityDocumentValidator] Unidades no encontradas en Excel: ${notFound.join(', ')}`);
      return false;
    }

    console.log('[CommunityDocumentValidator] ✓ Todas las unidades web coinciden con el Excel.');
    return true;
  }

  /**
   * Verifica que el total de prorrateo mostrado en la web coincida (dentro de la tolerancia)
   * con la suma de la columna property[size] del Excel de propiedades.
   *
   * Tolerancia: 0.1 — cubre el redondeo que aplica el front cuando el decimal ≥ 0.095.
   *
   * @param webTotalText  - Texto del total de prorrateo extraído de la web.
   * @param communityType - 'CC' o 'SC'.
   * @returns true si |webTotal - excelSum| <= 0.1.
   */
  async apportionmentMatchesExcel(webTotalText: string, communityType: string): Promise<boolean> {
    const { properties: fileName } = this.resolveFiles(communityType);

    const webTotal = this.parseWebNumber(webTotalText);
    const excelSum = await this.reader.sumColumn(fileName, COL_SIZE);
    const diff = Math.abs(webTotal - excelSum);

    console.log(
      `[CommunityDocumentValidator] Prorrateo — web: ${webTotal} | excel: ${excelSum.toFixed(6)} | diff: ${diff.toFixed(6)}`
    );

    if (diff > APPORTIONMENT_TOLERANCE) {
      console.error('[CommunityDocumentValidator] Prorrateo NO coincide con el Excel (fuera de tolerancia).');
      return false;
    }

    console.log('[CommunityDocumentValidator] ✓ Prorrateo web coincide con la suma del Excel.');
    return true;
  }

  /**
   * Verifica que los saldos mostrados en la web correspondan (con inversión de signo)
   * a los valores de la columna common_expense[price] del Excel de saldos.
   *
   * Regla de inversión:
   *   - Excel negativo → web positivo
   *   - Excel positivo → web negativo
   *   - Excel cero    → web cero
   *
   * Solo evalúa los registros de la primera página (paginación de la web).
   *
   * @param webBalanceTexts - Textos de la columna "Balance" extraídos de la web.
   * @param communityType   - 'CC' o 'SC'.
   * @returns true si todos los saldos web cumplen la regla de inversión respecto al Excel.
   */
  async balancesMatchExcel(webBalanceTexts: string[], communityType: string): Promise<boolean> {
    const { balances: fileName } = this.resolveFiles(communityType);

    const webValues = webBalanceTexts.map(t => this.parseWebNumber(t));
    const excelRaw  = await this.reader.readAllColumnValues(fileName, COL_BALANCE);
    const excelValues = excelRaw.map(s => parseFloat(s.replace(',', '.')));

    console.log(
      `[CommunityDocumentValidator] Saldos — web: ${webValues.length} valores | excel: ${excelValues.length} registros`
    );

    const nonMatching: number[] = [];
    for (const webVal of webValues) {
      if (isNaN(webVal)) continue;

      if (webVal === 0) {
        if (!excelValues.some(e => e === 0)) nonMatching.push(webVal);
      } else {
        // El valor en el Excel debe tener el signo opuesto al de la web
        const expectedInExcel = -webVal;
        const found = excelValues.some(e => Math.abs(e - expectedInExcel) < 0.01);
        if (!found) nonMatching.push(webVal);
      }
    }

    if (nonMatching.length > 0) {
      console.error(
        `[CommunityDocumentValidator] Saldos sin coincidencia inversa en Excel: ${nonMatching.join(', ')}`
      );
      return false;
    }

    console.log('[CommunityDocumentValidator] ✓ Todos los saldos web coinciden (inversión de signo) con el Excel.');
    return true;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/validators/CommunityDocumentValidator.ts
// Nota: requiere los archivos Excel en test-data/files/{documents,imagen}/
if (require.main === module) {
  (async () => {
    console.log('=== CommunityDocumentValidator ===');
    const validator = new CommunityDocumentValidator();

    // Simula valores que vendrían de la web (primera página)
    const mockUnits    = ['Torre A Depto 101', 'Torre A Depto 102'];
    const mockTotal    = '1.0';
    const mockBalances = ['1500', '0', '-200'];

    console.log('\n--- unitsMatchExcel (CC) ---');
    const unitsOk = await validator.unitsMatchExcel(mockUnits, 'CC');
    console.log('Resultado:', unitsOk);

    console.log('\n--- apportionmentMatchesExcel (CC) ---');
    const apportOk = await validator.apportionmentMatchesExcel(mockTotal, 'CC');
    console.log('Resultado:', apportOk);

    console.log('\n--- balancesMatchExcel (CC) ---');
    const balancesOk = await validator.balancesMatchExcel(mockBalances, 'CC');
    console.log('Resultado:', balancesOk);
  })();
}
