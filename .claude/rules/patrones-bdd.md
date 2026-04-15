---
paths:
  - "step-definitions/**/*.ts"
  - "support/fixtures.ts"
  - "support/Applications.ts"
---

# Patrones BDD — Steps y Fixtures

## Steps — fixture destructuring (NO this.ctx)

```typescript
import { Given, When, Then } from '../support/fixtures';

Given('descripción del step', async ({ app, scenarioData }) => {
  await app.login.loginAs(
    scenarioData.dataMap.get('EmailPublicAdministration') ?? '',
    scenarioData.dataMap.get('PasswordAdmin') ?? ''
  );
});
```

## Pasar estado entre steps — scenarioData.extras

```typescript
// Guardar resultado intermedio
const RESULT_KEY = '_newComm_result';
scenarioData.extras.set(RESULT_KEY, result);

// Leer en step posterior
const createdOk = scenarioData.extras.get(RESULT_KEY) as boolean;
```

## Reemplazar dataMap completo — replaceDataMap

```typescript
// Cuando un page object retorna un Map actualizado
const updatedMap = await app.editCommunities.fillFormDataBank(scenarioData.dataMap);
scenarioData.replaceDataMap(updatedMap);
```

## Ciclo de vida del escenario

- **`app`** — instancia de `Applications` con todos los page objects. Recibe `page` de Playwright.
- **`scenarioData`** — estado mutable compartido entre steps:
  - `dataMap: Map<string, string>` — datos de negocio (columnas de Google Sheets)
  - `sheetName: string` — pestaña activa de Google Sheets
  - `extras: Map<string, unknown>` — datos temporales entre steps
  - `toRecord()` — convierte dataMap a objeto plano para Google Sheets
  - `fromRecord(record)` — carga datos desde Google Sheets al dataMap
  - `replaceDataMap(newMap)` — reemplaza el contenido del dataMap con un Map nuevo

El bloque antes de `use()` en el fixture = `@Before` hook.
El bloque después de `use()` = `@After` hook.

## Configuración playwright-bdd (playwright.config.ts)

- `defineBddConfig({ features, steps, outputDir })` — escanea `.feature` files y genera specs en `.bdd-gen/`
- `steps` incluye `step-definitions/**/*.ts` **y** `support/fixtures.ts` (para tipos y Given/When/Then)
- `retries: 1` — 1 reintento para cubrir flakiness de red/UI
- `timeout: 120_000` — 2 min por test
- `reporter: [['allure-playwright', ...], ['list']]`
- `screenshot: 'only-on-failure'` + `trace: 'retain-on-failure'`

## Ciclo de vida del escenario (fixtures.ts)

- **`app`** — instancia de `Applications` con todos los page objects. Recibe `page` de Playwright.
- **`scenarioData`** — estado mutable compartido entre steps del escenario:
  - `dataMap: Map<string, string>` — datos de negocio (columnas de Google Sheets)
  - `sheetName: string` — pestaña activa de Google Sheets
  - `extras: Map<string, unknown>` — datos temporales entre steps (reemplaza `this[KEY]` del World de Cucumber)
  - `toRecord()` — convierte dataMap a objeto plano para Google Sheets
  - `fromRecord(record)` — carga datos desde Google Sheets al dataMap
  - `replaceDataMap(newMap)` — reemplaza el contenido del dataMap con un Map nuevo

El bloque antes de `use()` en el fixture equivale al `@Before` hook.
El bloque después de `use()` equivale al `@After` hook.
Screenshots y trazas en fallo son automáticos vía `playwright.config.ts`.

## Flujo para agregar steps nuevos a un .feature

Cuando se agregan pasos nuevos a un `.feature`, el proceso es:

1. Escribir el texto del step en el `.feature`
2. Ejecutar `npm run missing-steps` para obtener los snippets generados automáticamente
3. Copiar los snippets al archivo `*.steps.ts` correspondiente
4. Implementar la lógica dentro de cada snippet

```bash
npm run missing-steps
```

El script (`scripts/missing-steps.ts`) compara todos los steps de los `.feature` contra los definidos
vía `npx bddgen export` y genera el código TypeScript listo para copiar.

**Nunca crear step definitions manualmente desde cero** — siempre usar `npm run missing-steps`
para garantizar que el texto del step coincide exactamente con el del `.feature`.

## Prohibiciones en steps

- No usar `this.ctx` ni `this.ctx.app.*` — siempre fixture destructuring `{ app, scenarioData }`
- No usar `importTestFrom` (deprecado en playwright-bdd v8) — agregar `fixtures.ts` al array `steps`
