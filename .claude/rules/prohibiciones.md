# Prohibiciones globales del framework

## Imports y paquetes

- No importar de `playwright` (crudo) — siempre `@playwright/test`
- No usar `ts-node` — está reemplazado por `tsx`
- No usar `@cucumber/cucumber` ni `allure-cucumberjs` — migrados a `playwright-bdd` + `allure-playwright`

## Patrones de código prohibidos

- No usar `this.ctx` ni `this.ctx.app.*` en steps — usar fixture destructuring `{ app, scenarioData }`
- No usar `importTestFrom` (deprecado en playwright-bdd v8) — agregar `fixtures.ts` al array `steps`
- No usar `catch (err: any)` — usar `catch (err)` y castear dentro con `(err as Error).message`
- No redeclarar `page` como `private` en constructores de clases que extienden BasePage

## Page Objects — sin duplicación de métodos

- **Antes de crear un método nuevo en un page object, hacer Grep en `pages/` para verificar que no exista ya en otro page object con la misma semántica.**
- Si el método ya existe en otro page object, invocar ese page object directamente desde el step (`app.<pageObject>.<metodo>()`) — no replicar la lógica.
- El contenedor `Applications` expone todos los page objects; no hay restricción que obligue a duplicar comportamiento entre páginas.
- Ejemplo: `activeTemporaryPermissions()` existe en `EditCommunities.page.ts`. Si otro escenario necesita activar permisos, el step llama `app.editCommunities.activeTemporaryPermissions()` — no se crea el mismo método en otro page.

## Archivos generados

- No editar archivos en `.bdd-gen/` — son generados automáticamente por playwright-bdd

## Locators

- No agregar locators en `CommonLocators.ts` salvo que se usen en 2 o más módulos distintos — si es de un solo módulo va en su propio `*.locators.ts`
- No hardcodear selectores en steps ni en lógica de negocio — siempre desde el archivo `*.locators.ts`

## Waits

- No agregar `waitFor()` redundante antes de `innerText()`, `isChecked()` u otros métodos que ya auto-esperan
- No agregar `waitForTimeout()` salvo polling legítimo con comentario que lo justifique

## Steps — sin lógica propia

- No definir funciones auxiliares dentro de archivos `*.steps.ts` — toda función va en `utils/`
- No declarar constantes de datos de prueba en steps (listas de archivos, mapas tipo→archivo, rutas) — van en `utils/resolvers/` o el `utils/` correspondiente
- No usar `import * as fs from 'fs'` ni `import * as path from 'path'` en steps — si se necesita resolver una ruta o leer disco, esa lógica pertenece a un util
- Los steps solo orquestan: llaman a `app.*` (page objects) y a `utils/` — nunca implementan algoritmos propios
