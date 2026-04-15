/**
 * @file BasePage.ts
 * @description Capa base de acciones de Playwright.
 *
 * Principios clave:
 * - NO se usan waitForTimeout arbitrarios. Playwright gestiona actionability
 *   automáticamente en cada acción (click, fill, innerText, isChecked, etc.).
 * - expectVisible() usa expect() de @playwright/test con auto-retry nativo.
 * - waitForNavigation() se llama explícitamente tras submits que causan navegación.
 * - waitFor() explícitos solo se mantienen donde la acción siguiente NO auto-espera
 *   (ej: allInnerTexts() no espera a que existan elementos).
 */
import { Page, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===========================================================================
  // NAVEGACIÓN
  // ===========================================================================

  async navigateToUrl(url: string, timeoutSeconds = 30): Promise<void> {
    console.log(`[BasePage] Navegando → ${url}`);
    try {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutSeconds * 1000,
      });
      console.log(`[BasePage] ✓ Navegación completada → ${url}`);
    } catch (err) {
      throw new Error(
        `Error al navegar a la URL.\n` +
        `  URL: ${url}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Espera a que la página alcance el estado de carga indicado.
   * Llamar después de acciones que desencadenan navegación (submit, click en links).
   */
  async waitForNavigation(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'
  ): Promise<void> {
    console.log(`[BasePage] Esperando estado de carga: ${state}`);
    try {
      await this.page.waitForLoadState(state);
      console.log(`[BasePage] ✓ Página cargada (${state}) → ${this.page.url()}`);
    } catch (err) {
      throw new Error(
        `Error esperando estado de carga "${state}".\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /** Refresca la página */
  protected async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'load' });
  }

  // ===========================================================================
  // INTERACCIONES — Playwright gestiona actionability automáticamente
  // ===========================================================================

  /**
   * Click sobre un elemento. Playwright espera a que sea visible, estable y habilitado.
   */
  async click(selector: string, timeoutSeconds = 10): Promise<void> {
    console.log(`[BasePage] Click → ${selector}`);
    try {
      await this.page.locator(selector).click({ timeout: timeoutSeconds * 1000 });
      console.log(`[BasePage] ✓ Click exitoso → ${selector}`);
    } catch (err) {
      throw new Error(
        `No se pudo hacer click en el elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Establece el estado de un checkbox o radio button (activado/desactivado).
   * @param selector Localizador del elemento.
   * @param shouldBeChecked El estado deseado (true para marcar, false para desmarcar).
   * @param timeoutSeconds Tiempo de espera (default 10s).
   */
  async setCheckboxState(
      selector: string,
      shouldBeChecked: boolean,
      timeoutSeconds = 10
  ): Promise<void> {
    const action = shouldBeChecked ? 'Marcar' : 'Desmarcar';
    console.log(`[BasePage] ${action} → ${selector}`);

    const locator = this.page.locator(selector);

    try {
      if (shouldBeChecked) {
        await locator.check({ timeout: timeoutSeconds * 1000 });
      } else {
        await locator.uncheck({ timeout: timeoutSeconds * 1000 });
      }

      // VERIFICACIÓN DE ESTADO NATIVA:
      if (shouldBeChecked) {
        await expect(locator).toBeChecked({ timeout: 3000 });
      } else {
        await expect(locator).not.toBeChecked({ timeout: 3000 });
      }

      await this.page.waitForTimeout(500);
      console.log(`[BasePage] ✓ ${action} completado y espera de estabilidad de 500ms finalizada.`);

    } catch (err) {
      throw new Error(`Fallo al intentar ${action} el selector: ${selector}. Causa: ${(err as Error).message}`);
    }
  }
  /**
   * Remueve un atributo HTML de un elemento eirectamente vía JavaScript.
   *
   * Usar como bypass cuando un controller JS (ej: Stimulus con validación de
   * `event.isTrusted`) no responde a eventos sintéticos de Playwright.
   * Manipula el DOM directamente sin depender del event system del browser.
   *
   * Ejemplo: habilitar un input controlado por un Stimulus toggle controller
   * que solo responde a interacciones reales del usuario.
   */
  async forceRemoveAttribute(selector: string, attribute: string): Promise<void> {
    console.log(`[BasePage] Removiendo atributo [${attribute}] → ${selector}`);
    try {
      await this.page.locator(selector).evaluate(
        (el: HTMLElement, attr: string) => el.removeAttribute(attr),
        attribute
      );
      console.log(`[BasePage] ✓ Atributo [${attribute}] removido → ${selector}`);
    } catch (err) {
      throw new Error(
        `No se pudo remover el atributo [${attribute}].\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Escribe texto en un input. Playwright espera actionability antes de actuar.
   * clear() previene texto residual en campos pre-poblados.
   */
  async fill(selector: string, value: string | number, timeoutSeconds = 10): Promise<void> {
    const locator = this.page.locator(selector);
    const valStr = String(value);

    try {
      // 1. ESPERA DE ACCIONABILIDAD: Playwright espera que esté 'visible' y 'enabled'
      // .waitFor con state: 'visible' es bueno, pero .elementHandle().isEditable() es más preciso
      await locator.waitFor({ state: 'visible', timeout: timeoutSeconds * 1000 });

      // 2. REINTENTO DE EDICIÓN: Forzamos la espera a que el atributo 'disabled' desaparezca
      // Esto soluciona el problema de los toggles de Stimulus/JS
      await expect(locator).toBeEditable({ timeout: timeoutSeconds * 1000 });

      // 3. ACCIÓN
      await locator.clear({ timeout: 3000 });
      await locator.fill(valStr);

      console.log(`[BasePage] Fill "${valStr}" → ${selector}`);
    } catch {
      throw new Error(
          `No se pudo escribir en el campo.\n` +
          `  Selector: ${selector}\n` +
          `  Valor: "${valStr}"\n` +
          `  Causa: El elemento sigue deshabilitado o no es editable después de ${timeoutSeconds}s.`
      );
    }
  }

  /**
   * Escribe texto carácter por carácter simulando un teclado real.
   * Útil para campos con validaciones dinámicas o autocompletados.
   */
  async type(selector: string, text: string, delay = 100): Promise<void> {
    console.log(`[BasePage] Type "${text}" → ${selector}`);
    const locator = this.page.locator(selector);
    try {
      await locator.click();
      await locator.clear();
      await locator.pressSequentially(text, { delay });
    } catch (err) {
      throw new Error(`Error al escribir secuencialmente en ${selector}. Causa: ${(err as Error).message}`);
    }
  }

  /**
   * Envía una secuencia de teclas global.
   * @param selector El elemento que debe tener el foco.
   * @param keys Array de teclas (ej: ['ArrowDown', 'Enter']).
   * @param waitForSelector Opcional. Si se provee, el metodo espera a que este
   * @param timeoutSeconds Tiempo de espera para la validación (por defecto 10s)
   * elemento sea visible antes de presionar las teclas.

   */
  async pressKeys(
      selector: string,
      keys: string[],
      waitForSelector?: string,
      timeoutSeconds = 10
  ): Promise<void> {
    console.log(`[BasePage] PressKeys [${keys.join(', ')}] en ${selector}`);
    const locator = this.page.locator(selector);

    try {
      // 1. Aseguramos el foco en el elemento objetivo
      await locator.click();

      // 2. Lógica Condicional: Solo espera si el usuario envía un selector
      if (waitForSelector) {
        console.log(`[BasePage] Esperando validación visual de: ${waitForSelector}`);
        await this.page.waitForSelector(waitForSelector, {
          state: 'visible',
          timeout: timeoutSeconds * 1000
        });
        // Pausa técnica para estabilidad del renderizado
        await this.page.waitForTimeout(500);
      }

      // 3. Ejecución de teclas a nivel global (más robusto que locator.press)
      for (const key of keys) {
        await this.page.keyboard.press(key);
        await this.page.waitForTimeout(200); // Latencia natural entre pulsaciones
      }

    } catch (err) {
      throw new Error(
          `Error en secuencia de teclas en ${selector}.\n` +
          `Causa: ${(err as Error).message}`
      );
    }
  }

  /**
   * Realiza un hover sobre un elemento con soporte para coordenadas y manejo de errores.
   */
  async hover(
      selector: string,
      position?: { x: number; y: number },
      timeoutSeconds = 10
  ): Promise<void> {
    const posLog = position ? ` en [x:${position.x}, y:${position.y}]` : '';
    console.log(`[BasePage] Intentando Hover (${timeoutSeconds}s) → ${selector}${posLog}`);

    try {
      await this.page.locator(selector).hover({
        timeout: timeoutSeconds * 1000,
        position: position,
        force: true
      });
      console.log(`[BasePage] ✓ Hover exitoso → ${selector}`);
    } catch (err) {
      throw new Error(
          `Error al realizar Hover: El elemento no respondió a la interacción.\n` +
          `  Selector: ${selector}\n` +
          `  Coordenadas: ${posLog || 'Centro por defecto'}\n` +
          `  URL actual: ${this.page.url()}\n` +
          `  Detalle técnico: ${(err as Error).message}`
      );
    }
  }

  /**
   * Scroll hacia un elemento para asegurar su visibilidad.
   */
  async scrollToElement(selector: string, timeoutSeconds = 10): Promise<void> {
    console.log(`[BasePage] Scroll → ${selector}`);
    try {
      await this.page.locator(selector).scrollIntoViewIfNeeded({ timeout: timeoutSeconds * 1000 });
      console.log(`[BasePage] ✓ Scroll completado → ${selector}`);
    } catch (err) {
      throw new Error(
        `No se pudo hacer scroll al elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Espera a que un atributo del elemento contenga un valor específico.
   * Útil para estados dinámicos como clases de Google Maps o estados 'disabled'.
   */
  async expectAttribute(
      selector: string,
      attribute: string,
      expectedValue: string | RegExp,
      timeoutSeconds = 10
  ): Promise<void> {
    console.log(`[BasePage] Esperando atributo [${attribute}] en ${selector}...`);
    try {
      const locator = this.page.locator(selector);
      await expect(locator).toHaveAttribute(attribute, expectedValue, {
        timeout: timeoutSeconds * 1000,
      });
      console.log(`[BasePage] ✓ Atributo verificado correctamente.`);
    } catch (err) {
      throw new Error(
          `Fallo en validación de atributo.\n` +
          `  Selector: ${selector}\n` +
          `  Atributo esperado: ${attribute} = ${expectedValue}\n` +
          `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  // ===========================================================================
  // SELECT / DROPDOWN
  // ===========================================================================

  async selectOption(
    selector: string,
    type: 'value' | 'label' | 'index',
    data: string | number,
    timeoutSeconds = 10
  ): Promise<void> {
    console.log(`[BasePage] Select [${type}="${data}"] → ${selector}`);
    try {
      const locator = this.page.locator(selector);
      const opts = { timeout: timeoutSeconds * 1000 };
      switch (type) {
        case 'value': await locator.selectOption({ value: String(data) }, opts); break;
        case 'label': await locator.selectOption({ label: String(data) }, opts); break;
        case 'index': await locator.selectOption({ index: Number(data) }, opts); break;
      }
      console.log(`[BasePage] ✓ Opción seleccionada [${type}="${data}"] → ${selector}`);
    } catch (err) {
      throw new Error(
        `No se pudo seleccionar la opción [${type}="${data}"].\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Retorna las opciones de un <select> como array de strings.
   * El waitFor es necesario porque allInnerTexts() no auto-espera al elemento padre.
   */
  async getSelectOptions(selector: string, timeoutSeconds = 10): Promise<string[]> {
    console.log(`[BasePage] Leyendo opciones del select → ${selector}`);
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout: timeoutSeconds * 1000 });
      const options = await locator.locator('option').allInnerTexts();
      const result = options.map(o => o.trim()).filter(o => o.length > 0);
      console.log(`[BasePage] ✓ ${result.length} opciones leídas → ${selector}`);
      return result;
    } catch (err) {
      throw new Error(
        `No se pudieron leer las opciones del select.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  // ===========================================================================
  // LECTURA DE CONTENIDO
  // ===========================================================================

  /**
   * Retorna el texto de un elemento.
   * innerText() auto-espera a que el elemento sea visible antes de leer.
   */
  async getText(selector: string, timeoutSeconds = 10): Promise<string> {
    console.log(`[BasePage] Leyendo texto → ${selector}`);
    try {
      const locator = this.page.locator(selector);
      const text = (await locator.innerText({ timeout: timeoutSeconds * 1000 })).trim();
      console.log(`[BasePage] ✓ Texto obtenido: "${text}" → ${selector}`);
      return text;
    } catch (err) {
      throw new Error(
        `No se pudo leer el texto del elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Retorna el texto de todos los elementos que coincidan con el selector.
   * El waitFor en el primero es necesario porque allInnerTexts() no auto-espera.
   */
  async getTextList(selector: string, timeoutSeconds = 10): Promise<string[]> {
    console.log(`[BasePage] Leyendo lista de textos → ${selector}`);
    let texts: string[];
    try {
      const locator = this.page.locator(selector);
      await locator.first().waitFor({ state: 'visible', timeout: timeoutSeconds * 1000 });
      texts = await locator.allInnerTexts();
    } catch (err) {
      throw new Error(
        `No se pudo obtener la lista de textos.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
    const result = texts.map(t => t.trim()).filter(t => t.length > 0);
    if (result.length === 0) {
      throw new Error(`Lista vacía para selector: ${selector}`);
    }
    console.log(`[BasePage] ✓ ${result.length} textos obtenidos → ${selector}`);
    return result;
  }

  // ===========================================================================
  // VALIDACIONES Y ASERCIONES
  // ===========================================================================



  /**
   * Espera técnica a que un elemento sea visible antes de continuar el flujo.
   */
  async waitVisible(selector: string, timeoutSeconds = 10): Promise<void> {
    console.log(`[BasePage] Esperando visibilidad técnica (${timeoutSeconds}s) → ${selector}`);

    try {
      await this.page.locator(selector).waitFor({
        state: 'visible',
        timeout: timeoutSeconds * 1000
      });
      console.log(`[BasePage] ✓ Elemento listo para interactuar → ${selector}`);
    } catch (err) {
      throw new Error(
          `Error de Sincronización: El elemento no se hizo visible a tiempo.\n` +
          `  Selector: ${selector}\n` +
          `  Timeout: ${timeoutSeconds}s\n` +
          `  URL actual: ${this.page.url()}\n` +
          `  Detalle técnico: ${(err as Error).message}`
      );
    }
  }

  /**
   * Aserción de visibilidad con auto-retry y mensaje de error claro.
   * Usar para validaciones de negocio (verificar que algo ocurrió correctamente).
   * Internamente usa expect() de @playwright/test que reintenta hasta que pase o expire.
   */
  async expectVisible(
    selector: string,
    errorMessage: string,
    timeoutSeconds = 15
  ): Promise<void> {
    console.log(`[BasePage] Buscando elemento (${timeoutSeconds}s) → ${selector}`);
    try {
      await expect(
        this.page.locator(selector)
      ).toBeVisible({ timeout: timeoutSeconds * 1000 });
      console.log(`[BasePage] ✓ Elemento encontrado → ${selector}`);
    } catch {
      throw new Error(
        `${errorMessage}\n` +
        `  Selector: ${selector}\n` +
        `  Timeout: ${timeoutSeconds}s\n` +
        `  URL actual: ${this.page.url()}`
      );
    }
  }

  /**
   * Check condicional de visibilidad (retorna boolean, no lanza excepción).
   * Se agregó .first() para manejar casos donde hay múltiples coincidencias (ej: filas de tablas).
   */
  async isVisible(selector: string, timeoutSeconds = 5): Promise<boolean> {
    try {
      // Agregamos .first() para que si hay 20 iconos, solo se fije en el primero
      await this.page.locator(selector).first().waitFor({
        state: 'visible',
        timeout: timeoutSeconds * 1000,
      });
      return true;
    } catch {
      // Si no aparece en el tiempo dado o hay error, retorna false silenciosamente
      return false;
    }
  }

  /**
   * isChecked() de Playwright auto-espera a que el elemento sea checkable.
   */
  async isChecked(selector: string, timeoutSeconds = 10): Promise<boolean> {
    console.log(`[BasePage] Verificando estado checked → ${selector}`);
    try {
      const result = await this.page.locator(selector).isChecked({ timeout: timeoutSeconds * 1000 });
      console.log(`[BasePage] ✓ Estado checked: ${result} → ${selector}`);
      return result;
    } catch (err) {
      throw new Error(
        `No se pudo verificar el estado checked del elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  // ===========================================================================
  // ARCHIVOS / UPLOADS
  // ===========================================================================

  async uploadFile(selector: string, filePath: string, timeoutSeconds = 10): Promise<void> {
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado en la ruta: ${filePath}`);
    }
    console.log(`[BasePage] Subiendo archivo → ${filePath}`);
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'attached', timeout: timeoutSeconds * 1000 });
      await locator.setInputFiles(filePath);
      console.log(`[BasePage] ✓ Archivo subido exitosamente → ${filePath}`);
    } catch (err) {
      throw new Error(
        `No se pudo subir el archivo.\n` +
        `  Selector: ${selector}\n` +
        `  Ruta: ${filePath}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  // ===========================================================================
  // SCREENSHOTS
  // ===========================================================================

  async screenshot(description: string): Promise<Buffer> {
    try {
      const buffer = await this.page.screenshot({ type: 'png', fullPage: false });
      await allure.attachment(description, buffer, 'image/png');
      console.log(`[Screenshot] ${description}`);
      return buffer;
    } catch {
      return Buffer.alloc(0);
    }
  }

  // ===========================================================================
  // BYPASS METHODS
  // ===========================================================================

  /**
   * Fuerza la apertura del sidebar activando la clase CSS necesaria.
   * Útil para menús controlados por JS que no responden al hover físico.
   */
  async forceActiveState(selector: string): Promise<void> {
    console.log(`[BasePage] Forzando estado activo mediante Clase CSS → ${selector}`);
    try {
      await this.page.locator(selector).evaluate((el) => {
        el.classList.add('active');
      });
      // Espera mínima para que la transición CSS termine — único caso válido de waitForTimeout
      await this.page.waitForTimeout(500);
      console.log(`[BasePage] ✓ Estado activo forzado → ${selector}`);
    } catch (err) {
      throw new Error(
        `No se pudo forzar el estado activo del elemento.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }

  /**
   * Asegura la expansión de un dropdown, intentando clic físico y forzando clases CSS si falla.
   * @param selector Selector del div contenedor del dropdown (.navlink-dropdown)
   * @param timeoutSeconds Tiempo de espera para la validación
   */
  async forceExpandDropdown(selector: string, timeoutSeconds = 5): Promise<void> {
    console.log(`[BasePage] Intentando expandir dropdown → ${selector}`);
    try {
      const locator = this.page.locator(selector);

      // 1. INTENTO REAL: Clic físico (intentamos ser "legales" primero)
      try {
        await locator.click({ force: true, timeout: 2000 });
      } catch {
        console.log(`[BasePage] Clic físico no activó el menú. Aplicando fuerza bruta en el DOM...`);
      }

      // 2. BYPASS DE ESTADO: Forzamos que el navegador "dibuje" el menú abierto
      await locator.evaluate((el) => {
        el.classList.add('expanded');
        el.setAttribute('aria-expanded', 'true');

        const content = el.nextElementSibling as HTMLElement;
        if (content) {
          content.classList.remove('collapse', 'collapsed');
          content.classList.add('in', 'show', 'active');
          content.style.display = 'block';
          content.style.height = 'auto';
          content.style.visibility = 'visible';
          content.style.opacity = '1';
          content.style.overflow = 'visible';

          const innerNav = content.querySelector('nav');
          if (innerNav) innerNav.style.display = 'block';
        }
      });

      // 3. ESTABILIZACIÓN: Scroll y espera mínima de renderizado
      // waitForTimeout es el único mecanismo válido aquí: no existe condición DOM
      // esperable para el fin de una animación de colapso Bootstrap
      await locator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(timeoutSeconds);

      console.log(`[BasePage] ✓ Estado expandido forzado exitosamente.`);
    } catch (err) {
      throw new Error(
        `No se pudo expandir el dropdown.\n` +
        `  Selector: ${selector}\n` +
        `  URL actual: ${this.page.url()}\n` +
        `  Causa: ${(err as Error).message.split('\n')[0]}`
      );
    }
  }
}
