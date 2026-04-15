/**
 * @file playwright.config.ts
 * @description Configuración central del framework Playwright + playwright-bdd.
 *
 * Con la migración a playwright-bdd, este archivo reemplaza a:
 *   - cucumber.js       → rutas de features y steps
 *   - BrowserManager.ts → configuración del browser/contexto
 *   - hooks.ts          → screenshots, trazas y lifecycle (via use: {})
 *
 * Variables de entorno (.env):
 *   ENV      → entorno de ejecución (test5, admin, etc.)
 *   BROWSER  → chromium | firefox | webkit  (default: chromium)
 *   HEADLESS → true | false                 (default: true)
 *
 * Ejecución por tag:
 *   npx playwright test --grep @CreateNewCommunityNormalCC
 *   npm run test:tag -- "@CreateNewCommunityNormalCC"
 */
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const browser = (process.env.BROWSER ?? 'chromium') as 'chromium' | 'firefox' | 'webkit';
const headless = (process.env.HEADLESS ?? 'true') === 'true';

export default defineConfig({

  // ---------------------------------------------------------------------------
  // playwright-bdd: escanea .feature files y genera specs en .bdd-gen/
  // ---------------------------------------------------------------------------
  testDir: defineBddConfig({
    features: 'features/**/*.feature',
    steps: [
      'step-definitions/**/*.ts',
      // fixtures.ts incluido aquí para que playwright-bdd use sus tipos y Given/When/Then
      'support/fixtures.ts',
    ],
    outputDir: '.bdd-gen',
  }),

  // ---------------------------------------------------------------------------
  // Reportes
  // ---------------------------------------------------------------------------
  reporter: [
    // Allure: genera resultados en allure-results/ (mismo flujo que antes)
    ['allure-playwright', { outputFolder: 'allure-results' }],
    // Salida legible en consola
    ['list'],
  ],

  // ---------------------------------------------------------------------------
  // Configuración del browser (antes: BrowserManager.setup())
  // ---------------------------------------------------------------------------
  use: {
    browserName:       browser,
    headless:          headless,
    viewport:          { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,

    /**
     * Traza completa guardada solo en fallo.
     * Abrir con: npx playwright show-trace <archivo>.zip
     * Antes: hooks.ts → BrowserManager.saveTrace()
     */
    trace: 'retain-on-failure',

    /**
     * Screenshot automático en fallo, adjuntado a Allure sin código manual.
     * Antes: hooks.ts → page.screenshot() + this.attach()
     */
    screenshot: 'only-on-failure',

    launchOptions: {
      /** Deshabilitar caché del browser para evitar falsos positivos */
      args: ['--disable-cache'],
    },
  },

  // ---------------------------------------------------------------------------
  // Comportamiento de ejecución
  // ---------------------------------------------------------------------------

  /** Reintentar una vez antes de marcar como FAILED (cubre flakiness de red/UI) */
  retries: 0,

  /** 2 minutos por test — cubre navegaciones lentas, uploads y polling asíncrono */
  timeout: 120_000,
});
