/**
 * @file fixtures.ts
 * @description Fixtures de Playwright que reemplazan TestContext, BrowserManager y hooks.ts.
 *
 * Responsabilidades:
 * - `app`          → Contenedor de todos los page objects (equivalente).
 * - `scenarioData` → Estado compartido entre steps del mismo escenario:
 *                    dataMap, sheetName, extras y helpers toRecord/fromRecord.
 *                    También gestiona el log de inicio/fin del escenario (Before/After).
 *
 * El ciclo de vida del navegador (browser, context, page) es gestionado automáticamente
 * por el runner de Playwright — no requiere BrowserManager.
 *
 * Los screenshots en fallo y la captura de trazas son manejados por la configuración
 * de playwright.config.ts (screenshot: 'only-on-failure', trace: 'retain-on-failure').
 */
import { test as base, createBdd } from 'playwright-bdd';
import { Applications } from './Applications';

// =============================================================================
// CÓDIGOS ANSI — mismos que tenía hooks.ts
// =============================================================================
const RESET  = '\u001B[0m';
const RED    = '\u001B[31m';
const GREEN  = '\u001B[32m';
const YELLOW = '\u001B[33m';
const BLUE   = '\u001B[34m';

// =============================================================================
// TIPO: Estado compartido del escenario
// =============================================================================

/**
 * Contenedor mutable de datos compartidos entre steps de un mismo escenario.
 * Equivalente a la combinación de TestContext.dataMap + TestContext.sheetName
 * + el uso de `this[KEY]` en los step definitions del World de Cucumber.
 */
export type ScenarioData = {
  /** Datos del escenario (columnas de Google Sheets, datos generados, etc.) */
  dataMap: Map<string, string>;

  /** Nombre de la pestaña activa en Google Sheets */
  sheetName: string;

  /**
   * Almacén de datos temporales entre steps dentro del mismo escenario.
   * Reemplaza el patrón `this[KEY] = value` del World de Cucumber.
   * Ejemplo: extras.set('_comm_initialStatus', 'ReadyForImpersonation')
   */
  extras: Map<string, unknown>;

  /**
   * Convierte dataMap a un objeto plano para operaciones de Google Sheets.
   * Equivalente a TestContext.toRecord().
   */
  toRecord(): Record<string, string>;

  /**
   * Carga datos desde Google Sheets al dataMap.
   * Equivalente a TestContext.fromRecord().
   */
  fromRecord(record: Record<string, string>): void;

  /**
   * Reemplaza el contenido de dataMap con el de un nuevo Map.
   * Usado cuando un page object retorna un Map actualizado (ej: fillFormDataBank).
   */
  replaceDataMap(newMap: Map<string, string>): void;
};

// =============================================================================
// TIPO: Fixtures del framework
// =============================================================================

type FrameworkFixtures = {
  app: Applications;
  scenarioData: ScenarioData;
};

// =============================================================================
// EXTENSIÓN DEL TEST BASE
// =============================================================================

export const test = base.extend<FrameworkFixtures>({

  /**
   * Fixture `app`: instancia de Applications con todos los page objects.
   * `page` es inyectado automáticamente por Playwright (no requiere BrowserManager).
   */
  app: async ({ page }, use) => {
    await use(new Applications(page));
  },

  /**
   * Fixture `scenarioData`: estado compartido mutable del escenario.
   * Se crea limpio al inicio de cada test y Playwright lo destruye al finalizar.
   *
   * El bloque ANTES de `use()` equivale al @Before hook de Cucumber.
   * El bloque DESPUÉS de `use()` equivale al @After hook de Cucumber.
   * Los screenshots/trazas en fallo son automáticos vía playwright.config.ts.
   */
  scenarioData: async ({}, use, testInfo) => {

    // ── BEFORE: equivalente al hook @Before de hooks.ts ──────────────────────
    console.log('\n' + YELLOW + '━'.repeat(60) + RESET);
    console.log(`${YELLOW}[ ESCENARIO ]${RESET} ${BLUE}${testInfo.title}${RESET}`);
    console.log(YELLOW + '━'.repeat(60) + RESET);

    const state: ScenarioData = {
      dataMap:   new Map<string, string>(),
      sheetName: '',
      extras:    new Map<string, unknown>(),

      toRecord() {
        const record: Record<string, string> = {};
        this.dataMap.forEach((value, key) => { record[key] = value; });
        return record;
      },

      fromRecord(record: Record<string, string>) {
        this.dataMap.clear();
        Object.entries(record).forEach(([k, v]) => this.dataMap.set(k, v));
      },

      replaceDataMap(newMap: Map<string, string>) {
        if (newMap === this.dataMap) return;
        this.dataMap.clear();
        newMap.forEach((v, k) => this.dataMap.set(k, v));
      },
    };

    await use(state);

    // ── AFTER: equivalente al hook @After de hooks.ts ────────────────────────
    // Screenshots y trazas son adjuntados automáticamente a Allure por
    // allure-playwright vía playwright.config.ts (screenshot/trace en fallo).
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
      console.log('\n' + RED + '━'.repeat(60) + RESET);
      console.log(`${RED}[ FALLO ] ${testInfo.title}${RESET}`);
      const cause = testInfo.error?.message?.split('\n')[0] ?? 'Sin detalle';
      console.log(`${RED}  Causa: ${cause}${RESET}`);
      console.log(RED + '━'.repeat(60) + RESET);
    } else {
      console.log('\n' + GREEN + '━'.repeat(60) + RESET);
      console.log(`${GREEN}[ EXITOSO ] ${testInfo.title}${RESET}`);
      console.log(GREEN + '━'.repeat(60) + RESET);
    }
  },
});

// =============================================================================
// EXPORTS PARA STEP DEFINITIONS
// =============================================================================

/** Given/When/Then tipados con los fixtures del framework */
export const { Given, When, Then } = createBdd(test);
