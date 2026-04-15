# Guía Técnica del Framework — AutomationWeb-Playwright

**ComunidadFeliz QA Automation | Playwright + playwright-bdd + TypeScript**

> Este documento no es una referencia de API ni un README convencional.
> Es la guía técnica que explica el **por qué** de cada decisión arquitectural del framework,
> de forma que cualquier persona que trabaje en él entienda el razonamiento detrás de cada patrón
> y pueda mantenerlo consistente y escalable.

---

## Índice

1. [Filosofía general del framework](#1-filosofía-general-del-framework)
2. [Arquitectura por capas](#2-arquitectura-por-capas)
3. [BasePage — la capa de acciones](#3-basepage--la-capa-de-acciones)
4. [Page Objects](#4-page-objects)
5. [Locators — centralización por módulo](#5-locators--centralización-por-módulo)
6. [Step Definitions](#6-step-definitions)
7. [Fixtures — memoria del escenario](#7-fixtures--memoria-del-escenario)
8. [Gestión de datos con Google Sheets](#8-gestión-de-datos-con-google-sheets)
9. [Utils — generadores y servicios de soporte](#9-utils--generadores-y-servicios-de-soporte)
10. [Configuración de playwright-bdd](#10-configuración-de-playwright-bdd)
11. [Antipatrones — lo que no se debe hacer](#11-antipatrones--lo-que-no-se-debe-hacer)

---

## 1. Filosofía general del framework

El framework está construido sobre tres principios que guían todas las decisiones de diseño:

**Separación de responsabilidades.**
Cada capa tiene una única razón de existir. Los steps orquestan, los page objects ejecutan acciones, los locators almacenan selectores, los utils generan datos. Ninguna capa invade la responsabilidad de otra.

**Explícito sobre implícito.**
Los mensajes de error deben decir exactamente qué falló, en qué selector y en qué URL. Los logs deben registrar cada acción en Allure. Los nombres de steps deben ser legibles por cualquier persona del equipo, no solo por quien lo escribió.

**Confianza en las herramientas.**
Playwright gestiona actionability automáticamente. playwright-bdd gestiona el ciclo de vida de features y steps. Google Sheets API gestiona la concurrencia de escrituras. El framework no intenta reimplementar lo que las herramientas ya resuelven.

---

## 2. Arquitectura por capas

```text
features/                   ← QUÉ se prueba (Gherkin — lenguaje de negocio)
step-definitions/           ← CÓMO se orquesta (playwright-bdd — sin lógica UI)
pages/                      ← CÓMO se ejecuta en la UI (Playwright — acciones reales)
  base/BasePage.ts          ← acciones genéricas reutilizables
  *.page.ts                 ← acciones específicas de cada módulo
  locators/                 ← DÓNDE se actúa (selectores centralizados)
support/                    ← infraestructura del ciclo de vida del test
  fixtures.ts               ← fixtures: app (page objects) + scenarioData (estado del escenario)
  Applications.ts           ← contenedor de page objects
utils/                      ← datos y servicios auxiliares
config/                     ← credenciales y URLs por entorno
```

El flujo de ejecución de un escenario sigue siempre esta dirección descendente:

```text
Feature → Step (fixture: { app, scenarioData }) → Page Object → BasePage → Playwright API
                                                        ↑
                                                  usa Locators
                                                  usa Utils (datos)
                                                  usa scenarioData (estado compartido)
```

Nunca existe comunicación en sentido inverso ni saltos de capa. Un step nunca llama a `page.locator()` directamente. Un page object nunca accede al fixture `scenarioData`. Esta disciplina es lo que hace el framework mantenible a largo plazo.

---

## 3. BasePage — la capa de acciones

### Por qué existe

Sin `BasePage`, cada page object implementaría sus propios wrappers de Playwright de manera inconsistente. Un page object haría `page.locator(x).click()` directamente, otro envolvería la acción en un try/catch propio con un mensaje diferente, un tercero simplemente dejaría que el error de Playwright se propagara sin contexto.

`BasePage` resuelve esto de una vez para todos: **estandariza cómo se ejecuta cada acción, cómo se reporta y cómo se maneja el error**, de forma que toda la suite se comporta de manera uniforme.

### Responsabilidades de BasePage

1. Envolver cada acción de Playwright con manejo de error contextualizado.
2. Registrar en consola (y por tanto en Allure) cada acción y el selector sobre el que actúa.
3. Exponer métodos cuyo nombre describe la intención, no la implementación.

### Formato obligatorio de cada action

Toda acción en `BasePage` sigue este patrón:

```typescript
async nombreAccion(selector: string, timeoutSeconds = N): Promise<void> {
  console.log(`[BasePage] Descripción de la acción → ${selector}`);
  try {
    await this.page.locator(selector).accionPlaywright({ timeout: timeoutSeconds * 1000 });
    console.log(`[BasePage] ✓ Descripción completada`);
  } catch (err) {
    throw new Error(
      `Mensaje de error orientado al negocio.\n` +
      `  Selector: ${selector}\n` +
      `  URL: ${this.page.url()}\n` +
      `  Causa: ${(err as Error).message.split('\n')[0]}`
    );
  }
}
```

**El `console.log` antes de la acción es obligatorio.** Toda línea de log con formato `[BasePage] acción → selector` queda registrada en el reporte Allure como parte de la traza de ejecución del step. Esto permite, al revisar un fallo en Allure, ver exactamente qué acciones se ejecutaron, en qué orden y sobre qué elemento. Sin este log, el reporte solo muestra que un step falló, pero no cuál de las N acciones dentro de ese step fue la que lo hizo.

El log de éxito `[BasePage] ✓ ...` también es obligatorio: confirma visualmente en la consola que la acción completó sin errores antes de pasar a la siguiente.

Ejemplo real del framework:

```typescript
async click(selector: string, timeoutSeconds = 10): Promise<void> {
  console.log(`[BasePage] Click → ${selector}`);
  try {
    await this.page.locator(selector).click({ timeout: timeoutSeconds * 1000 });
    console.log(`[BasePage] ✓ Click realizado`);
  } catch (err) {
    throw new Error(
      `No se pudo hacer click en el elemento.\n` +
      `  Selector: ${selector}\n` +
      `  URL: ${this.page.url()}\n` +
      `  Causa: ${(err as Error).message.split('\n')[0]}`
    );
  }
}
```

### Por qué el error incluye selector, URL y causa

Un error de Playwright sin contexto dice: `"Timeout 10000ms exceeded"`. Un error del framework dice:

```text
No se pudo hacer click en el elemento.
  Selector: button[type='submit']
  URL: https://test5.comunidadfeliz.com/login
  Causa: Timeout 10000ms exceeded
```

El segundo mensaje permite al QA diagnosticar el problema en segundos sin abrir el Trace Viewer.

### Casos especiales: cuándo sí se usa waitFor()

Playwright gestiona actionability automáticamente en `click()`, `fill()`, `innerText()`, `isChecked()` y otros métodos. En estos casos **no se debe agregar un `waitFor()` previo**, ya que es redundante.

Sin embargo, hay dos situaciones en BasePage que sí requieren `waitFor()` explícito:

```typescript
// getSelectOptions: allInnerTexts() sobre una colección NO auto-espera al elemento padre
async getSelectOptions(selector: string): Promise<string[]> {
  const locator = this.page.locator(selector);
  await locator.waitFor({ state: 'visible' }); // necesario aquí
  return locator.locator('option').allInnerTexts();
}

// getTextList: allInnerTexts() sobre una colección NO auto-espera al primer elemento
async getTextList(selector: string): Promise<string[]> {
  const locator = this.page.locator(selector);
  await locator.first().waitFor({ state: 'visible' }); // necesario aquí
  return locator.allInnerTexts();
}
```

La regla: si el método de Playwright que se va a llamar es de tipo `all*` (opera sobre toda una colección), se requiere esperar primero al menos un elemento. En cualquier otro caso, Playwright ya espera.

### Cuándo agregar un nuevo método a BasePage

Agregar un método a `BasePage` solo cuando:

1. La acción de Playwright subyacente es genérica (sin lógica de negocio específica de un módulo).
2. Se usará en **al menos dos page objects diferentes**.
3. No existe ya un método equivalente.

Si la acción tiene lógica específica de un módulo (ej: polling del proceso de importación Excel), pertenece al page object de ese módulo, no a `BasePage`.

---

## 4. Page Objects

### Por qué existe esta capa

Un page object es la representación en código de un módulo de la aplicación. Su responsabilidad es encapsular **todas las acciones posibles dentro de ese módulo**, de modo que los steps describan qué se hace, no cómo.

Sin page objects, los steps contendrían selectores y llamadas directas a Playwright, lo que significaría que si un selector cambia, hay que modificar cada step que lo use. Con page objects, el cambio ocurre en un único archivo.

### Estructura de un page object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { ModuloLocators } from './locators/Modulo.locators';
import { CommonLocators } from './locators/CommonLocators';

export class ModuloPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Acción atómica: hace una sola cosa
  async clickBotonGuardar(): Promise<void> {
    await this.click(CommonLocators.saveBtn);
    await this.waitForNavigation();
  }

  // Acción compuesta: orquesta acciones atómicas para un flujo completo
  async llenarFormularioCompleto(datos: Map<string, string>): Promise<void> {
    await this.fill(ModuloLocators.inputNombre, datos.get('nombre') ?? '');
    await this.fill(ModuloLocators.inputEmail, datos.get('email') ?? '');
    await this.clickBotonGuardar();
  }

  // Verificación: valida el resultado esperado, retorna boolean o lanza error
  async verificarCreacionExitosa(): Promise<boolean> {
    await this.expectVisible(
      ModuloLocators.mensajeExito,
      'El mensaje de confirmación de creación no es visible.',
      15
    );
    await this.screenshot('Creación exitosa confirmada');
    return true;
  }
}
```

### Reglas de los page objects

- Toda acción de UI va en el page object, nunca en el step.
- Los selectores se importan desde el archivo de locators del módulo, nunca se escriben inline.
- Los métodos de verificación (`check*`, `verify*`) deben incluir un `screenshot()` para que Allure capture el estado visual de la validación.
- Un page object no accede a los fixtures `scenarioData` ni `app`. Recibe datos por parámetros del método.
- No redeclarar `page` como `private` en el constructor — `page` ya viene de `BasePage`.

---

## 5. Locators — centralización por módulo

### Por qué los locators son archivos separados

Un selector escrito inline en un page object es un pasivo técnico. Si el equipo de desarrollo cambia el `id` de un botón, hay que buscar en qué page object está hardcodeado. Con locators centralizados, el cambio ocurre en un único archivo y se propaga automáticamente a todos los page objects que lo importan.

La separación también permite revisar todos los selectores de un módulo sin leer el código de las acciones.

### Dos tipos de locators

**Locators de módulo** — exclusivos de una pantalla o flujo:

```typescript
// pages/locators/Login.locators.ts
export const LoginLocators = Object.freeze({
  emailBox: '#email',
  passwordBox: '#password',
  loginBtn: "button[type='submit']",
  checkLoginSuperAdmin: 'ADMIN DASHBOARD',
});
```

**CommonLocators** — selectores genuinamente usados en dos o más módulos distintos:

```typescript
// pages/locators/CommonLocators.ts
export const CommonLocators = Object.freeze({
  saveBtn: "input[type='submit']",
  textInScreen: (text: string): string =>
    `xpath=//*[contains(text(), '${text}')]`,
});
```

La regla: si un selector solo se usa en un módulo, va en el archivo de locators de ese módulo. Si se usa en dos o más módulos, va en `CommonLocators`.

### Por qué Object.freeze

Todos los archivos de locators exportan un objeto congelado con `Object.freeze`. Esto garantiza que ningún page object pueda mutar accidentalmente los selectores en runtime. Los locators son constantes inmutables, y `Object.freeze` hace que TypeScript y el runtime lo refuercen.

### Locators dinámicos

Cuando un selector depende de un dato en runtime, se define como una función dentro del objeto congelado:

```typescript
export const CommonLocators = Object.freeze({
  textInScreen: (text: string): string =>
    `xpath=//*[contains(text(), '${text}')]`,
});

// Uso en page object:
await this.expectVisible(
  CommonLocators.textInScreen('ADMIN DASHBOARD'),
  'El dashboard de admin no es visible.'
);
```

---

## 6. Step Definitions

### Responsabilidad de un step

Un step tiene **una única responsabilidad**: invocar el método de page object que corresponde al enunciado del step y pasar el resultado al estado compartido si es necesario. No contiene lógica de UI, no contiene selectores y no contiene try/catch.

### Estructura estándar de un step

Los steps se definen con `Given`, `When`, `Then` importados desde `support/fixtures.ts`. El primer argumento del callback es el objeto de fixtures destructurado: `{ app, scenarioData }`.

```typescript
import { Given, When, Then } from '../support/fixtures';

Given('descripción del step en lenguaje de negocio', async ({ app, scenarioData }) => {
  await app.modulo.accionDelModulo();
});
```

Cuando el step requiere parámetros desde el feature:

```typescript
When('se busca la comunidad: {string} con tipo: {string}',
  async ({ app }, nombre: string, tipo: string) => {
    await app.communities.buscarComunidad(nombre, tipo);
  }
);
```

Cuando el step necesita leer datos del `dataMap`:

```typescript
When('se ingresan las credenciales del administrador', async ({ app, scenarioData }) => {
  const email    = scenarioData.dataMap.get('EmailPublicAdministration') ?? '';
  const password = scenarioData.dataMap.get('PasswordAdmin') ?? '';
  await app.login.loginAs(email, password);
});
```

### Por qué no se usa try/catch en los steps

El framework no usa `try/catch` en los steps. Esta es una decisión deliberada.

Cuando Playwright lanza un error, ese error contiene el contexto exacto del fallo (selector, timeout, URL actual). Si se captura en el step para relanzarlo como otro tipo, se pierde el stack trace original y se agrega una capa de indirección sin valor.

`BasePage` ya maneja los errores con mensajes contextualizados. Playwright captura cualquier excepción no manejada y la reporta correctamente en Allure. El try/catch en el step no agrega valor — solo agrega ruido.

```typescript
// CORRECTO — BasePage ya produce un error descriptivo
await app.login.loginAs(email, password);

// INCORRECTO — no agregar esto
try {
  await app.login.loginAs(email, password);
} catch (e) {
  throw new Error(`Error al hacer login: ${e}`);
}
```

### Estado entre steps — scenarioData.extras

Cuando un step necesita pasar un resultado intermedio a un step posterior (sin que sea un dato de negocio del `dataMap`), se usa `scenarioData.extras` con una clave privada de prefijo `_`:

```typescript
const RESULT_KEY    = '_newComm_result';
const INIT_STATUS   = '_comm_initialStatus';

Then('se muestra el mensaje de confirmación', async ({ app, scenarioData }) => {
  const ok = await app.newCommunity.checkCommunityCreatedSuccess();
  scenarioData.extras.set(RESULT_KEY, ok);
});

Then('se almacenan los datos en la BD: {string}',
  async ({ app, scenarioData }, sheetName: string) => {
    const createdOk = scenarioData.extras.get(RESULT_KEY) as boolean;
    if (createdOk) {
      await GoogleSheetsService.saveDataInLastEmptyRow(sheetName, scenarioData.toRecord());
    }
  }
);
```

Este patrón mantiene limpio el `dataMap` (exclusivo para datos de negocio de Google Sheets) y evita variables globales para pasar estado entre steps.

### Reemplazar dataMap completo — replaceDataMap

Cuando un page object retorna un `Map` actualizado (por ejemplo, tras llenar un formulario con datos generados), se usa `replaceDataMap` en lugar de reasignar directamente:

```typescript
// CORRECTO
const updatedMap = await app.editCommunities.fillFormDataBank(scenarioData.dataMap);
scenarioData.replaceDataMap(updatedMap);

// INCORRECTO — no asignar directamente (scenarioData.dataMap es readonly en intención)
scenarioData.dataMap = updatedMap;
```

---

## 7. Fixtures — memoria del escenario

### Por qué existen los fixtures

playwright-bdd construye cada escenario como un test de Playwright. El estado compartido entre los steps de un mismo escenario se gestiona mediante **fixtures** definidos en `support/fixtures.ts`.

Los fixtures reemplazan los mecanismos de Cucumber que ya no existen:

| Mecanismo Cucumber (eliminado) | Equivalente en fixtures |
|---|---|
| `TestContext` (clase) | `scenarioData` fixture |
| `this.ctx.dataMap` | `scenarioData.dataMap` |
| `this.ctx.sheetName` | `scenarioData.sheetName` |
| `this[KEY]` (World) | `scenarioData.extras.get(KEY)` |
| `BrowserManager` | Playwright nativo (playwright.config.ts) |
| `@Before` / `@After` hooks | Bloque antes/después de `use()` en el fixture |
| `this.ctx.app.login` | `app.login` |

### Los dos fixtures del framework

**`app`** — instancia de `Applications` con todos los page objects:

```typescript
app: async ({ page }, use) => {
  await use(new Applications(page));
}
```

`page` es inyectado por Playwright. No requiere `BrowserManager`. Disponible en steps como `app.login`, `app.home`, `app.communities`, etc.

**`scenarioData`** — estado mutable del escenario:

```typescript
scenarioData: async ({}, use, testInfo) => {
  // BEFORE (equivalente a @Before de Cucumber)
  console.log(`[ ESCENARIO ] ${testInfo.title}`);

  const state: ScenarioData = {
    dataMap:   new Map<string, string>(),
    sheetName: '',
    extras:    new Map<string, unknown>(),
    toRecord() { ... },
    fromRecord(record) { ... },
    replaceDataMap(newMap) { ... },
  };

  await use(state);

  // AFTER (equivalente a @After de Cucumber)
  if (testInfo.status === 'failed') {
    console.log(`[ FALLO ] ${testInfo.title}`);
  } else {
    console.log(`[ EXITOSO ] ${testInfo.title}`);
  }
}
```

Screenshots y trazas en fallo son adjuntados automáticamente a Allure por `allure-playwright` vía `playwright.config.ts` — no requieren código manual.

### El dataMap

`dataMap` es el puente entre Google Sheets y la UI. Sus claves son exactamente los nombres de columna del Google Sheet. Esta convención es fundamental: si la columna en Sheets se llama `NameCommunity`, la clave en `dataMap` es `NameCommunity`, sin variaciones.

```typescript
// Poblar desde Sheets (en el step de lectura de datos)
scenarioData.fromRecord(data);
scenarioData.sheetName = sheetName;

// Leer en un step
const nombre = scenarioData.dataMap.get('NameCommunity') ?? '';

// Enriquecer con datos capturados de la UI
scenarioData.dataMap.set('IdCommunity', idCapturadoDeLaUI);

// Convertir a objeto plano para enviar a Sheets
const record = scenarioData.toRecord();
```

### Applications

`Applications` centraliza la instanciación de todos los page objects. Se accede a ellos vía el fixture `app`:

```typescript
app.login           // LoginPage
app.home            // HomePage
app.communities     // CommunitiesPage
app.newCommunity    // NewCommunityPage
app.editCommunities // EditCommunitiesPage
app.viewCommunity   // ViewCommunityPage
```

Cuando se agrega un nuevo módulo al framework, se registra en `Applications` y automáticamente queda disponible para todos los steps a través del fixture `app`.

---

## 8. Gestión de datos con Google Sheets

### El concepto central

Google Sheets actúa como una **base de datos relacional liviana en la nube**. Cada pestaña representa una tabla con registros de comunidades por país y tipo:

| Pestaña | Contenido |
|---|---|
| `ComunidadesCL` | Comunidades de Chile |
| `ComunidadesMX` | Comunidades de México |

Cada fila es un registro completo con columnas que mapean directamente a las claves del `dataMap`:

| NameCommunity | EmailCommunity | IdCommunity | StatusCommunity | EmailPublicAdministration | PasswordAdmin |
|---|---|---|---|---|---|
| CC joscar.sosa Don Ricardo CL... | admin.cc...@yopmail.com | 4521 | ReadyForImpersonation | admin@... | Aa123456. |

### Por qué Google Sheets y no una base de datos convencional

Google Sheets permite que el equipo de QA consulte, audite y modifique los datos de prueba directamente desde el navegador, sin herramientas adicionales. Es un formato accesible para perfiles no técnicos, mantiene historial de cambios nativo y no requiere infraestructura de base de datos adicional.

---

### El ciclo de vida de un dato: 3 momentos

#### Momento 1 — Creación: `saveDataInLastEmptyRow`

Ocurre al final de los tests de creación (`@CreateCommunity`). Cuando un test crea una comunidad exitosamente, todos los datos generados se persisten como una nueva fila en el Sheet:

```text
[Test crea comunidad]
  → genera datos con generadores (CommunityGenerator, RutGenerator, etc.)
  → llena el formulario en la UI
  → captura el ID asignado por la aplicación desde la pantalla de confirmación
  → scenarioData.dataMap.set('IdCommunity', idDeLaUI)
  → saveDataInLastEmptyRow("ComunidadesCL", scenarioData.toRecord())
```

#### Momento 2 — Consumo con bloqueo: `getAndLockRowByStatus`

Ocurre al inicio de tests que requieren una comunidad existente. El step especifica el status requerido en el `.feature`:

```gherkin
Given se leen y extraen los datos de pruebas desde la BD: "ComunidadesCL", con status: "ReadyForImpersonation"
```

El servicio lee el Sheet, filtra por status, selecciona una fila al azar del lote coincidente, actualiza su status a `"IN_PROGRESS - [qa_user]"` (bloqueo provisional), y carga todos los datos al `dataMap`:

```typescript
scenarioData.fromRecord(data);
scenarioData.sheetName = sheetName;
```

#### Momento 3 — Persistencia final: `updateOrSaveData`

Ocurre en el último step del escenario, después de que la validación del resultado esperado haya pasado:

```typescript
const data = scenarioData.toRecord();
data['StatusCommunity'] = scenarioData.extras.get(INITIAL_STATUS_KEY) as string;
await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, data);
```

#### Sobre las filas con status "IN_PROGRESS" tras un fallo

Cuando un escenario falla antes de llegar al step de persistencia final, la fila queda con status `"IN_PROGRESS - [nombre del QA]"`. **Este comportamiento es intencional, no un bug.** La fila bloqueada actúa como snapshot del estado de los datos en el momento del fallo. Para liberarla, el QA actualiza manualmente el status en el Sheet al valor apropiado.

---

## 9. Utils — generadores y servicios de soporte

### Qué va en utils

La carpeta `utils/` contiene clases y funciones de soporte que **no pertenecen a ningún módulo de la UI** pero son necesarias para los tests:

| Subcarpeta | Contenido |
|---|---|
| `utils/generators/` | Generadores de datos de prueba (RUT, RFC, nombres, direcciones, etc.) |
| `utils/readers/` | Lectores de archivos externos (Excel) |
| `utils/services/` | Servicios de integración externa (Google Sheets API) |

### Formato de las clases de generadores

Los generadores son clases con métodos estáticos, sin estado interno ni dependencias de instancia:

```typescript
export class MiGenerador {
  private static readonly DATOS: readonly string[] = ['valor1', 'valor2'];

  static generarDato(): string {
    return this.DATOS[Math.floor(Math.random() * this.DATOS.length)];
  }
}
```

### Bloque de ejecución local — equivalente al main de Java

**Todo archivo en `utils/` debe incluir un bloque de ejecución local al final.**

Este patrón es el equivalente en TypeScript/Node.js del método `public static void main(String[] args)` de Java. Permite validar el util de forma completamente aislada — sin levantar el runner ni el browser — antes de integrarlo al código de pruebas automatizadas.

```typescript
// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/MiGenerador.ts
if (require.main === module) {
  console.log('=== MiGenerador ===');

  for (let i = 0; i < 5; i++) {
    console.log(MiGenerador.generarDato());
  }
}
```

**Por qué es obligatorio:**
Un generador defectuoso que produce datos inválidos (un RUT con dígito verificador incorrecto, un RFC con formato erróneo, un email que no pasa la validación del formulario) causará fallos en los tests de automatización que serán difíciles de diagnosticar, porque el error se manifestará en la UI y no en el generador. El bloque local permite detectar y corregir el problema antes de que llegue a los tests.

**Cómo ejecutar los utils existentes:**

```bash
npx tsx utils/generators/RutGenerator.ts
npx tsx utils/generators/RfcGenerator.ts
npx tsx utils/generators/CommunityGenerator.ts     # requiere .env con EMAIL
npx tsx utils/generators/AddressGeneratorByCountry.ts
npx tsx utils/generators/BankDataGenerator.ts
npx tsx utils/generators/AdministratorPublicGenerator.ts
npx tsx utils/generators/CountryMapper.ts
npx tsx utils/readers/ExcelReader.ts               # requiere archivo en test-data/
npx tsx utils/services/GoogleSheetsService.ts      # requiere .env y credenciales Google
```

---

## 10. Configuración de playwright-bdd

### Por qué playwright-bdd en lugar de @cucumber/cucumber

La migración de `@cucumber/cucumber` a `playwright-bdd` resuelve los siguientes puntos de dolor:

- **Integración nativa**: playwright-bdd genera specs `.spec.js` que Playwright ejecuta directamente. No hay un runner paralelo ni capas de adaptación.
- **Fixtures de Playwright**: los steps reciben `{ app, scenarioData }` como fixtures tipados, sin necesidad del patrón World de Cucumber ni de `TestContext` como clase separada.
- **Screenshots y trazas automáticos**: `screenshot: 'only-on-failure'` y `trace: 'retain-on-failure'` en `playwright.config.ts` reemplazan el código manual de hooks.
- **Allure nativo**: `allure-playwright` se integra directamente como reporter de Playwright, eliminando la necesidad de `allure-cucumberjs`.
- **Compatibilidad Windows**: los scripts de Playwright son compatibles con PowerShell mediante `cross-env`.

### Configuración en playwright.config.ts

```typescript
testDir: defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'step-definitions/**/*.ts',
    'support/fixtures.ts',    // necesario para que playwright-bdd use los tipos y Given/When/Then
  ],
  outputDir: '.bdd-gen',
}),
```

- `features` — glob de `.feature` files.
- `steps` — incluye tanto los step definitions como `fixtures.ts` (exporta `Given`/`When`/`Then` y los tipos del fixture).
- `outputDir` — directorio donde playwright-bdd genera los specs (en `.gitignore`, no versionar).

### Ciclo de generación

playwright-bdd genera specs automáticamente en el `pretest` script (vía `rimraf .bdd-gen`). Cada ejecución de `npm test` parte de un estado limpio.

### Reintentos y timeouts

```typescript
retries: 1,      // 1 reintento para cubrir flakiness de red/UI
timeout: 120_000 // 2 minutos por test
```

Los reintentos cubren **flakiness legítimo**: latencia de red variable, carga del servidor, animaciones CSS que retrasan elementos. **No son una solución** a bugs de automatización ni a problemas sistemáticos de datos o de la aplicación.

### Filtrar por tag

```bash
# Ejecutar un tag específico
npx playwright test --grep @Login
npm run test:tag -- @CreateNewCommunityNormalCC

# Con parámetros de entorno
npx cross-env ENV=test5 BROWSER=chromium HEADLESS=false npm run test:tag -- @CreateNewCommunityNormalCC
```

---

## 11. Antipatrones — lo que no se debe hacer

### No usar el paquete `playwright` crudo

```typescript
// INCORRECTO
import { chromium } from 'playwright';

// CORRECTO
import { Page, expect } from '@playwright/test';
```

### No usar this.ctx en steps

```typescript
// INCORRECTO — patrón Cucumber/World (eliminado)
async function (this: { ctx: TestContext }) {
  await this.ctx.app.login.loginAs(email, password);
}

// CORRECTO — fixture destructuring playwright-bdd
async ({ app, scenarioData }) => {
  await app.login.loginAs(email, password);
}
```

### No agregar waitFor() redundantes

```typescript
// INCORRECTO — innerText() ya auto-espera al elemento
await page.locator(selector).waitFor();
const text = await page.locator(selector).innerText();

// CORRECTO
const text = await page.locator(selector).innerText();
```

### No usar waitForTimeout() salvo polling documentado

`waitForTimeout` solo se permite para intervalos de polling reales entre recargas de página u operaciones asíncronas externas. Debe llevar un comentario que explique por qué es necesario.

### No wrappear steps en try/catch

```typescript
// INCORRECTO
try {
  await app.login.loginAs(email, password);
} catch (e) {
  throw new Error('Error al hacer login');
}

// CORRECTO
await app.login.loginAs(email, password);
```

### No escribir selectores fuera de los archivos de locators

```typescript
// INCORRECTO — selector inline en el page object
await this.click('#submit-button');

// INCORRECTO — selector inline en el step
await app.page.locator('#email').fill(email);

// CORRECTO
await this.click(LoginLocators.btnChangePassword);
```

### No escribir selectores fuera de los archivos de locators

Los selectores de un módulo van en su `*.locators.ts`. Los compartidos entre dos o más módulos van en `CommonLocators.ts`.

### No escribir lógica de UI en los steps

```typescript
// INCORRECTO — el step ejecuta Playwright directamente
When('el usuario guarda el formulario', async ({ page }) => {
  await page.locator("input[type='submit']").click();
  await page.waitForLoadState('domcontentloaded');
});

// CORRECTO — el step delega al page object
When('el usuario guarda el formulario', async ({ app }) => {
  await app.modulo.clickGuardar();
});
```

### No crear utils sin bloque de ejecución local

Todo archivo nuevo en `utils/` debe incluir su bloque `if (require.main === module)` antes de ser integrado al código de pruebas. Este es el criterio de calidad mínimo: un util debe poder probarse de forma aislada y su salida debe ser verificable sin ejecutar un test completo.

### No omitir el console.log en acciones de BasePage

```typescript
// INCORRECTO — la acción no deja rastro en Allure
async click(selector: string): Promise<void> {
  await this.page.locator(selector).click();
}

// CORRECTO — la acción queda registrada en la traza de Allure
async click(selector: string): Promise<void> {
  console.log(`[BasePage] Click → ${selector}`);
  await this.page.locator(selector).click();
  console.log(`[BasePage] ✓ Click realizado`);
}
```

### No editar archivos en .bdd-gen/

Los archivos en `.bdd-gen/` son generados automáticamente por playwright-bdd en cada ejecución. Cualquier cambio manual será sobreescrito. Los specs se controlan desde los `.feature` files y los step definitions.
