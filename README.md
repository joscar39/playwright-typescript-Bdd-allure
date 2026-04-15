# Proyecto Playwright + BDD + Allure + Typescript

Suite de tests E2E playwright. Usa **Playwright** con **TypeScript**, sin Cucumber/Gherkin.

---

## Requisitos

- **Node.js 20+** — verificar con `node --version`
- **npm 9+** — verificar con `npm --version`
- Acceso a un entorno de prueba (staging o local) y credenciales de usuario de prueba

---

## 1. Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd TestsE2EWeb

# Instalar dependencias de Node
npm install

# Instalar navegadores de Playwright (Chromium + dependencias del sistema)
npm run install:browsers
```

---

## 2. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes al entorno a testear:

```env
# URL base del entorno contra el que correrán los tests
APP_URL="https://staging.url.cl"

# Credenciales del usuario de prueba (usar un usuario dedicado, no de producción real)
TEST_EMAIL="qa.user@yopmail.com"
TEST_PASSWORD="contraseña-segura"
```

> **Nota:** `.env` está en `.gitignore` — nunca commitear credenciales reales.

---

## 3. Autenticación

Los tests reutilizan una sesión autenticada que se genera automáticamente antes de correr los specs. El estado se guarda en `playwright/.auth/state.json`.

Este archivo **no debe commitearse**. Si la sesión expira o cambia la contraseña, borrarlo y volver a correr los tests:

```bash
rm -rf playwright/.auth
npm test
```

---

## 4. Ejecución de tests

### Todos los tests

```bash
# Todos los tests
npm test

# Por módulo
npm run test:login
npm run test:create-community
npm run test:communities

# Por tag específico
# En PowerShell las comillas dobles son obligatorias por el símbolo @
npm run test:tag -- "@LoginSuperAdminSuccess"
npm run test:tag -- "@CreateNewCommunityNormalCC"
npm run test:tag -- "@CreateNewCommunityNormalSC"
npm run test:tag -- "@EditCommunities"
npm run test:tag -- "@ViewCommunity"
```

### Ejecución con parámetros personalizados (cross-env)

Usa `cross-env` para sobrescribir cualquier variable del `.env` directamente en el comando.
Los parámetros del comando siempre tienen prioridad sobre el archivo `.env`.

**Sintaxis:**
```bash
npx cross-env [VARIABLE=valor ...] npm run [script]
```

**Ejemplos:**
```bash
# Cambiar solo el ambiente
npx cross-env ENV=test1 npm run test:create-community

# Cambiar ambiente y navegador
npx cross-env ENV=test3 BROWSER=firefox npm run test:create-community

# Correr en modo headless
npx cross-env ENV=smoke BROWSER=chromium HEADLESS=true npm run test:create-community

# Con credenciales diferentes
npx cross-env EMAIL=qa2@yopmail.com PASSWORD=OtraPass123. npm run test:create-community

# Con tag específico (CC = Chile, SC = México)
npx cross-env ENV=test5 BROWSER=chromium HEADLESS=false npm run test:tag -- "@CreateNewCommunityNormalCC"

# Combinación completa
npx cross-env ENV=test2 BROWSER=webkit HEADLESS=false EMAIL=qa2@yopmail.com PASSWORD=OtraPass123. npm run test:create-community

# Ejecutar escenarios repetidos en paralelo por tags
npx cross-env ENV=test5 BROWSER=chromium HEADLESS=false playwright test --grep "@CreateNewCommunityNormal" --repeat-each 5
```

---

## Reportes Allure

> **Requisito:** Java >= 11 instalado (ver sección Requisitos Previos).

```bash
# Servir resultados crudos directamente (más rápido, no genera HTML)
npm run allure:serve

# Generar reporte HTML estático
npm run allure:generate

# Abrir el reporte HTML generado
npm run allure:open

# Generar y abrir en un solo comando
npm run allure:generate && npm run allure:open
```

Los resultados se guardan en `allure-results/` y el reporte en `allure-report/`.
Ambas carpetas están en `.gitignore` y no se versionan.

---

## Ver Trazas de Tests Fallidos

Playwright guarda trazas automáticamente cuando un test falla (`trace: 'retain-on-failure'`):

```bash
npx playwright show-trace test-results/<nombre-test>/trace.zip
```

### Un spec específico

```bash
npx playwright test tests/specs/communities/community.lifecycle.spec.ts
```

### Todos los tests de una carpeta

```bash
npx playwright test tests/specs/communities/
npx playwright test tests/specs/sc/
npx playwright test tests/specs/community_packages/
```

### Modo UI (interfaz visual interactiva)

Permite seleccionar, filtrar y ejecutar tests desde una interfaz gráfica. Ideal para exploración y debugging.

```bash
npm run typecheck
```

### Modo headed (con ventana de navegador visible)

```bash
npm install -g allure-commandline
java --version   # verificar que Java >= 11 está instalado
```

### Modo debug (paso a paso con Playwright Inspector)

```bash
npm run test:debug
```

Para debuggear un spec específico:

```bash
npx playwright test tests/specs/communities/community.lifecycle.spec.ts --debug
```

---

## 5. Ver el reporte HTML

Después de cada ejecución se genera un reporte HTML. Para abrirlo:

```bash
npm run report
```

También se puede abrir el último reporte generado directamente desde `playwright-report/index.html`.

---

## 6. Ejecución en CI

En entornos de CI se activan automáticamente 2 reintentos y 2 workers paralelos (configurado en `playwright.config.ts` vía `process.env.CI`).

Para simular localmente el comportamiento de CI:

```bash
CI=true npm test
```

---

## 7. Estructura del proyecto

```
tests/
  specs/          ← escenarios de negocio (.spec.ts)
  flows/          ← orquestación de flujos multipágina
  pages/          ← page objects y acciones UI
    base/         ← BasePage con acciones genéricas
    locators/     ← selectores centralizados por módulo
  components/     ← wrappers de componentes UI reutilizables
  helpers/        ← generadores de datos y utilidades
  setup/          ← configuración de autenticación (auth.setup.ts)
fixtures/         ← archivos estáticos para tests (Excel, imágenes)
playwright.config.ts
.env.example
```

---

## 8. Specs disponibles

| Spec | Descripción |
|---|---|
| `tests/specs/communities/community.lifecycle.spec.ts` | Ciclo de vida de una comunidad (creación, edición) |
| `tests/specs/communities/community.settings.spec.ts` | Configuración de comunidad |
| `tests/specs/sc/invoices.spec.ts` | Facturas SC |
| `tests/specs/community_packages/remunerations.spec.ts` | Remuneraciones de paquetes de comunidad |

---

## 9. Troubleshooting

**Error: `playwright/.auth/state.json` no encontrado**
→ Correr `npm test` completo al menos una vez para que el setup de autenticación genere el archivo.

**Error de credenciales / login fallido**
→ Verificar que `TEST_EMAIL` y `TEST_PASSWORD` en `.env` sean correctos y que el usuario tenga acceso al entorno configurado en `APP_URL`.

**Browsers no instalados**
→ Correr `npm run install:browsers` nuevamente.

**Tests que pasan en headed pero fallan en headless**
→ Revisar si hay timeouts muy ajustados. El timeout global es de 10 segundos (`playwright.config.ts`).
