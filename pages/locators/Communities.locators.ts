/**
 * @file Communities.locators.ts
 * @description Selectores del módulo de listado y gestión de comunidades.
 */
export const CommunitiesLocators = Object.freeze({
  /** Título de la página de listado de comunidades */
  checkCommunitiesPage: ".title-container h1.title",

  /** Input de búsqueda de comunidades */
  inputSearchCommunity: '#search',

  /** Select de estado de comunidad */
  selectStatusCommunity: '#status',

  /** Select de funcionalidad demo */
  selectFunctionalityCommunity: '#demo',

  /** Select "Comunidad real" */
  selectCommunityIsReal: '#count_csm',

  /** Texto de validación de redirección a editar comunidad */
  checkRedirectionEditComm: 'Ajustes de la comunidad',

  /**
   * Localizador único para la fila de una comunidad.
   * Filtra por ID y Nombre dentro del mismo contenedor .table-row
   * @param id - El ID de la comunidad (ej: 128726)
   * @param name - El nombre exacto o parcial (ej: CC joscar.sosa...)
   */
  uniqueCommunityRowFound: (id: string, name: string) =>
      `xpath=//div[contains(@class, "table-row")][descendant::div[normalize-space()="${id}"] and descendant::div[contains(., "${name}")]]`,

  /**
   * Localizador dinámico para verificar la redirección a la pantalla de ver comunidad.
   * @param name - Nombre de la comunidad.
   * @param id - ID numérico de la comunidad.
   */
  checkRedirectionViewComm: (name: string, id: string): string =>
    `xpath=//div[@class='header-box-title' and contains(text(), 'Comunidad: ${name}, #${id}')]`,

  /** Botón de búsqueda/filtro */
  searchBtn: "input[type='submit']",

  /** Acción: Ingresar como administrador (impersonar) */
  actionImperAdmin: "a[href*='log_as_user']",

  /** Acción: Ver comunidad */
  actionSeeComm: "a:has(.fa-eye)",

  /** Acción: Editar comunidad */
  actionEditComm: "a:has(.fa-pencil)",

  /** Acción: Desactivar comunidad */
  actionDeactivateComm: "div.btn-red-cf[data-original-title='Desactivar']",
});
