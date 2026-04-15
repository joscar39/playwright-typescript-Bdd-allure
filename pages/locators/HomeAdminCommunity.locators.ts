/**
 * @file HomeAdminCommunity.locators.ts
 * @description Selectores del dashboard de administrador de comunidad y sidebar de navegación principal.
 */
export const HomeAdminCommunityLocators = Object.freeze({
  /** localizador sidebar de administrador de comunidad */
  sidebarContainer: '#admin-sidebar',

  // /** contenedor dropdown "Comunidad conectada" en el sidebar */ otra opcion
  // menuCommunityConnected: 'li[data-nav-link-item="connected_community"] .navlink-dropdown',

  /** contenedor dropdown "Comunidad conectada" en el sidebar */
  menuCommunityConnected: 'div.navlink-dropdown:has-text("Comunidad conectada")',

  /** Opción "Residente" dentro del dropdown */
  optionCreateNormalCommunity: '#admin-property-user',

  /** Menú desplegable principal de 'Cobranza y recaudación' en el sidebar */
  billingDropdown: 'div.navlink-dropdown:has(.item-name:has-text("Cobranza y recaudación"))',

  /** Opción 'Cargos' dentro del menú desplegable de cobranza */
  chargesOption: 'div.navlink-sidebar.collapse.in a:has-text("Cargos"), .navlink-sidebar a[href*="cargos"]',

});
