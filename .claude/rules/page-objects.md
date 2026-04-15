---
paths:
  - "pages/**/*.ts"
---

# Reglas de Page Objects

## Estructura base

- Toda clase page extiende `BasePage` — nunca redeclarar `page` como `private` en el constructor.
- Locators siempre se importan desde el archivo `*.locators.ts` correspondiente — nunca hardcoded en el page object ni en los steps.

```typescript
import { LoginLocators } from './locators/Login.locators';
```

## Waits — no agregar waitFor() redundante

Playwright auto-espera en `click()`, `fill()`, `innerText()`, `isChecked()`, etc.
`waitFor()` justo antes de esos métodos es redundante.

```typescript
// INCORRECTO — waitFor innecesario antes de innerText
await page.locator(selector).waitFor();
await page.locator(selector).innerText();

// CORRECTO
const text = await page.locator(selector).innerText();
```

`waitFor()` **sí es válido** cuando necesitas esperar un estado específico antes de continuar
un flujo de negocio (ej: `waitFor({ state: 'hidden' })`, `waitFor({ state: 'visible' })` como
condición de guardia antes de lógica que no sea una acción directa sobre el elemento).

## waitForTimeout — solo polling documentado

Solo se permite para intervalos de polling entre recargas de página u operaciones asíncronas
externas. Siempre con comentario que justifique su uso.

```typescript
// Intervalo de polling entre recargas — único uso legítimo de waitForTimeout
await this.page.waitForTimeout(3000);
```

## DOM bypass — forceRemoveAttribute (para controladores Stimulus)

Inputs controlados por Stimulus JS (`data-controller="toggle"`) validan `event.isTrusted`,
que Playwright siempre establece como `false`. Solución: manipular DOM directamente.

```typescript
// Stimulus ignora el evento porque event.isTrusted === false en Playwright.
// Se remueve el atributo 'disabled' directamente en el DOM.
await this.setCheckboxState(NewCommunityLocators.checkPrincipalContact, true);
await this.forceRemoveAttribute(NewCommunityLocators.inputEmailContactCommunity, 'disabled');
await this.fill(NewCommunityLocators.inputEmailContactCommunity, communityEmail);
```

`forceRemoveAttribute(selector, attribute)` está en `BasePage` y usa `evaluate()` internamente.

## Regla de locators

- Importar siempre desde el archivo del módulo correspondiente (`*.locators.ts`).
- Selectores compartidos entre 2 o más módulos → `CommonLocators.ts`.
- Selectores de un solo módulo → su propio `*.locators.ts`.
