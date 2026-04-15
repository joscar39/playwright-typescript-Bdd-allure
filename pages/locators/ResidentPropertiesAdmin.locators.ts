/**
 * @file ResidentPropertiesAdmin.locators.ts
 * @description Selectores del dashboard de administrador de comunidad y sidebar de navegación principal.
 */
export const ResidentPropertiesAdmin = Object.freeze({
  /** Localizador para todas las celdas de la columna 'Prorrateo comunidad' */
  apportionmentColumnValues: 'table.properties-table tbody tr td:nth-child(2)',

  /** Valor numérico del prorrateo total mostrado en el resumen (ej: 0.7) */
  apportionmentTotalAmount: '.summary-content:has(.summary-title:has-text("Prorrateo Comunidad")) .summary-amount',

  /** Localizador para todas las celdas de la columna 'Balance' en la tabla de propiedades */
  balanceColumnValues: 'table.properties-table tbody tr td:nth-child(3)',

  /** * Localizador dinámico para el título de unidades de una comunidad específica.
   * @param communityName Nombre de la comunidad (ej: 'prueba QA Delta')
   */
  communityUnitsTitle: (communityName: string) =>
      `div.title-container h1.title:has-text("Unidades de ${communityName}")`,
});
