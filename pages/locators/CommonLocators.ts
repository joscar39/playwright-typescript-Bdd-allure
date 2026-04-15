/**
 * @file CommonLocators.ts
 * @description Selectores compartidos y reutilizables entre múltiples Page Objects.
 * Solo contiene locators genuinamente usados en 2 o más páginas distintas.
 *
 * Importar directamente desde este archivo en cada Page Object que lo necesite.
 */
export const CommonLocators = Object.freeze({
  /** Botón de guardar/submit genérico usado en múltiples formularios */
  saveBtn: "input[type='submit']",

  /** Enlace de permisos temporales cuando están DESACTIVADOS (div rojo) */
  permissionDisable: "a[href*='/self_granted_permissions']:has(.red)",

  /** Enlace de permisos temporales cuando están ACTIVADOS (div verde) */
  permissionEnable: "a:has(.green)",

  /**
   * Localizador dinámico para buscar cualquier texto visible en pantalla.
   * Usado en verificaciones genéricas de contenido visible.
   * @param text - Texto a buscar en el DOM.
   * @returns Selector XPath como string.
   */
  textInScreen: (text: string): string =>
      `xpath=//*[contains(text(), '${text}')]`,
});
