/**
 * @file Home.locators.ts
 * @description Selectores del dashboard de superadmin y sidebar de navegación principal.
 */
export const HomeLocators = Object.freeze({
  /** localiozador sidebar de superadministrador*/
  sidebarContainer: '#superadmin-sidebar',

  /** Opción "Comunidades" en el sidebar */
  optionCommunitiesSideBar: '#superadmin-communities',

  /** Contenedor del dropdown "Nueva comunidad" — necesario para forceExpandDropdown (opera en nextElementSibling).
   *  :has-text() es el único discriminador disponible: no hay id ni data-testid únicos entre los 3 dropdowns del sidebar. */
  dropdownNewCommunity: '#superadmin-sidebar div.navlink-dropdown:has-text("Nueva comunidad")',

  /** Opción "Nueva comunidad normal" dentro del dropdown */
  optionCreateNormalCommunity: '#new-community-normal',
});
