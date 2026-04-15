# CLAUDE.md — Reglas del Framework AutomationWeb-Playwright

Stack: **Playwright + TypeScript + playwright-bdd** (sin Cucumber/Gherkin nativo).
Los `.feature` files se mantienen, pero el runner es Playwright — no `@cucumber/cucumber`.

---

## Estructura de directorios

```
features/              # .feature files (Gherkin) organizados por módulo
  login/               # @Login
  newCommunity/        # @CreateCommunity
  communities/         # @Communities, @EditCommunities, @ViewCommunity

step-definitions/      # Steps tipados con fixtures del framework (*.steps.ts)
  login.steps.ts
  newCommunity.steps.ts
  communities.steps.ts
  editCommunities.steps.ts
  viewCommunity.steps.ts

pages/
  base/BasePage.ts           # Clase base — todos los page objects la extienden
  *.page.ts                  # Page objects (Login, Home, Communities, etc.)
  locators/                  # Locators separados por módulo (1 archivo por página)
    CommonLocators.ts
    Login.locators.ts
    Home.locators.ts
    NewCommunity.locators.ts
    Communities.locators.ts
    EditCommunities.locators.ts
    ViewCommunity.locators.ts

support/
  fixtures.ts          # Fixtures del framework: app (Applications) + scenarioData (estado del escenario)
  Applications.ts      # Contenedor de page objects: app.login / app.home / etc.

scripts/               # Utilidades de desarrollo (no forman parte de los tests)
  missing-steps.ts     # Detecta steps sin definición y genera snippets TypeScript

.bdd-gen/              # Specs generados automáticamente por playwright-bdd (NO editar, NO versionar)
test-data/files/       # Excel (.xlsx) e imágenes para tests de carga de archivos
config/                # Variables de entorno (.env), configuración de Google Sheets
utils/                 # Helpers: Google Sheets API, generadores de datos, xlsx
```

---

## 2. BasePage — capa de acciones

Toda clase en `tests/pages/` debe extender `BasePage`. Los componentes en `tests/components/` pueden hacerlo si reutilizan sus métodos.

### Formato obligatorio de cada acción

```typescript
async click(selector: string, timeoutSeconds = 10): Promise<void> {
  console.log(`[BasePage] Click → ${selector}`)
  try {
    await this.page.locator(selector).click({ timeout: timeoutSeconds * 1000 })
  } catch (err) {
    throw new Error(
      `No se pudo hacer click en el elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
    )
  }
}
```

### Cuándo agregar un método a BasePage

- La acción es genérica y reutilizable (sin lógica de negocio específica).
- Se usa en al menos dos Page Objects o Components distintos.
- No existe ya un método equivalente.

### Cuándo usar `waitFor()` explícito

Solo para operaciones `all*` (`allInnerTexts`, etc.) que NO auto-esperan al contenedor. Hay dos variantes según el tipo de colección:

```typescript
// Colección genérica de textos — usar .first() para esperar el primer elemento
async getTextList(selector: string): Promise<string[]> {
  const locator = this.page.locator(selector)
  await locator.first().waitFor({ state: 'visible' })
  return locator.allInnerTexts()
}

// Select con <option> — esperar al contenedor directo, luego acceder a los hijos
async getSelectOptions(selector: string): Promise<string[]> {
  const locator = this.page.locator(selector)
  await locator.waitFor({ state: 'visible' })
  return locator.locator('option').allInnerTexts()
}
```

Playwright ya autoespera en `click`, `fill`, `innerText`, `isChecked`, etc. No agregar `waitFor()` redundantes.

---

## 3. Page Objects

### Reglas clave

- Toda acción UI va en el Page Object, nunca en el Spec ni en el Flow.
- Selectores importados desde archivos de locators; **prohibidos inline**.
- Métodos de verificación deben capturar screenshot para diagnóstico.
- Un Page Object recibe datos por parámetros; no accede a estado externo.
- Los métodos de navegación retornan el Page Object de la página siguiente (factory pattern).

### Estructura tipo

```typescript
import { Page } from '@playwright/test'
import { BasePage } from '../../base/BasePage'
import { CommunitiesLocators } from '../../locators/Communities.locators'

export class AdminCommunitiesIndexPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  // Acción atómica
  async searchCommunity(name: string) {
    await this.fill(CommunitiesLocators.searchInput, name)
    await this.click(CommunitiesLocators.searchButton)
  }

  // Verificación con screenshot
  async verifyCreationSuccess() {
    await this.expectVisible(CommunitiesLocators.flashNotice, 'El flash de éxito no apareció', 15)
    await this.screenshot('creacion-exitosa')
  }
}
```

### Constructor: sin redeclarar `page`

```typescript
// CORRECTO — page viene de BasePage
constructor(page: Page) { super(page) }

// INCORRECTO — duplica la propiedad
constructor(private page: Page) { super(page) }
```

---

## 4. Locators — centralización por módulo

### Regla de ubicación

- Selector usado en un solo módulo → archivo de locators de ese módulo (`Communities.locators.ts`).
- Selector compartido por 2 o más módulos → `CommonLocators.ts`.
- **`GeneralLocators.ts` está deprecado** — solo existe como barrel de compatibilidad. No agregar selectores nuevos ahí.

### Formato

```typescript
// tests/pages/locators/Communities.locators.ts
export const CommunitiesLocators = Object.freeze({
  searchInput: 'input#search',
  searchButton: 'input[type="submit"][value="Buscar"]',
  tableRow: (name: string) => `div.table-row:has-text("${name}")`,
})
```

| Artefacto | Patrón | Ejemplo |
|---|---|---|
| Page object | `PascalCase.page.ts` | `Login.page.ts` |
| Locators | `PascalCase.locators.ts` | `Login.locators.ts` |
| Steps | `camelCase.steps.ts` | `login.steps.ts` |
| Features | `camelCase.feature` | `login.feature` |
| Clase page | `PascalCasePage` | `LoginPage` |
| Tag BDD | `@PascalCase` | `@Login`, `@CreateCommunity` |

---

## Dependencias clave

| Paquete | Rol |
|---|---|
| `@playwright/test` ^1.49 | Browser automation (devDep — no usar `playwright` crudo) |
| `playwright-bdd` ^8.5 | Integración BDD sobre Playwright (reemplaza @cucumber/cucumber) |
| `allure-playwright` ^3.6 | Reporter de resultados (reemplaza allure-cucumberjs) |
| `cross-env` ^10 | Variables de entorno multiplataforma (Windows/Linux/macOS) |
| `tsx` ^4.19 | Transpilación TS en runtime |
| `rimraf` ^6 | Limpieza de `allure-results` y `.bdd-gen` antes de cada run (`pretest`) |
| `dotenv` ^16 | Variables de entorno |
| `googleapis` ^144 | Google Sheets API (datos de test) |
| `exceljs` ^4.4 | Lectura/escritura de archivos Excel |

---

## Comandos frecuentes

- **No escribir selectores inline** en specs, flows ni page objects. Todos en archivos de locators.
- **No usar `waitForTimeout()`** salvo los casos documentados en la sección 7.
- **No envolver specs en `try/catch`**. BasePage + Playwright manejan y reportan errores.
- **No usar `page.locator()`** directamente en specs o flows.
- **No omitir `console.log`** en métodos de BasePage. Es la traza mínima para diagnóstico.
- **No saltarse capas**: un spec no llama a BasePage directamente; un page object no accede al contexto del spec.
- **No redeclarar `page`** como `private` en constructores de clases que extienden BasePage.
- **No usar `:has-text()` como primera opción** de selector; preferir atributos estables.
- **No agregar selectores a `GeneralLocators.ts`**. Está deprecado; usar el archivo de locators del módulo o `CommonLocators.ts`.
- **No importar desde `playwright` crudo**; usar siempre `@playwright/test`.
- **No crear helpers sin bloque `require.main === module`**. La validación aislada es obligatoria.
- **No agregar `waitFor()` redundantes**. Playwright ya autoespera en la mayoría de acciones.

# Ejecutar por módulo (tag)
npm run test:login
npm run test:create-community
npm run test:communities
npm run test:tag -- "@MiTag"      # comillas necesarias en PowerShell

# Detectar steps sin definición y generar snippets
npm run missing-steps

# Typecheck sin compilar
npm run typecheck

# Reportes Allure
npm run allure:serve              # abre servidor con resultados crudos (rápido)
npm run allure:generate           # genera HTML estático en allure-report/
npm run allure:open               # abre el HTML generado

# Ver traza de un test fallido
npx playwright show-trace test-results/<nombre>/.../trace.zip

# Instalar browsers
npm run install:browsers          # solo Chromium

# Ejecutar con parámetros personalizados (cross-env)
npx cross-env ENV=test1 BROWSER=chromium HEADLESS=false npm run test:tag -- "@MiTag"
```

---

## 14. Datos de prueba

@.claude/rules/patrones-bdd.md
@.claude/rules/page-objects.md
@.claude/rules/utils-standards.md
@.claude/rules/prohibiciones.md
