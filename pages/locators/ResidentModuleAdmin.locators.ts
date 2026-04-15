/**
 * @file ResidentModuleAdmin.locators.ts
 * @description Selectores del dashboard de administrador de comunidad y sidebar de navegación principal.
 */
export const ResidentModuleAdminLocators = Object.freeze({

  /** Selector específico de Playwright para validar el texto exacto del título */
  residentsHeaderText: '.header-box-title:has-text("Residentes")',

  /** Contenedor principal del modal de bienvenida a residentes */
  modalContainer: 'div.modal-content:has(h5:has-text("renovado módulo de Residentes"))',

  /** Botón para cerrar el modal desde la 'X' superior */
  btnCloseX: 'div.modal-header.new-header button.close',

  /** Botón 'Quizás más tarde' para posponer el recorrido */
  btnMaybeLater: 'div.modal-footer button:has-text("Quizás más tarde")',

  /** Botón 'Comenzar el recorrido' para iniciar el tour guiado */
  btnStartTour: 'button[data-action*="property-users--onboarding#startTourClicked"]',

  /** Localizador para todas las celdas de la columna 'Unidad' en la tabla de residentes */
  unitColumnValues: 'table.table-residents tbody tr td:first-child a.link-blue-hover',

  /** Botón 'Unidades' con icono de lista en la cabecera de la sección de residentes */
  btnUnitsProperties: 'div.btn.hide-on-mobile:has-text("Unidades")',

});
