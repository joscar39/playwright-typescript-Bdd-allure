/**
 * @file ViewCommunity.locators.ts
 * @description Selectores del módulo de vista de detalle de comunidad.
 */
export const ViewCommunityLocators = Object.freeze({
  /** Sección de Administrador en la vista de comunidad */
  sectionAdministrator: "xpath=//h1[contains(text(), 'Administrador')]",

  /** Texto de confirmación de administrador asignado */
  checkAdminAssigned: 'Administrador ingresado',

  /** Input nombre del administrador a asignar */
  nameAdminAssigned: '#user_first_name',

  /** Input apellido del administrador */
  lastnameAdminAssigned: '#user_last_name',

  /** Input email del administrador */
  emailAdminAssigned: '#user_email',

  /** Input teléfono del administrador */
  phoneAdminAssigned: '#user_phone',

  /** Input contraseña del administrador */
  passAdminAssigned: '#user_password',

  /** Input confirmación de contraseña */
  confirmPassAdminAssigned: '#user_password_confirmation',

  /** Botón de asignar administrador */
  btnAssignAdmin: '#submit_button',

  /** El botón que abre el dropdown */
  selectorButtonDropDown: "#cf-selector-button",

  /**
   * Localiza la opción ignorando mayúsculas/minúsculas
   */
  optionCaseInsensitive: (option: string) => {
    const lowerOption = option.toLowerCase();
    // Usamos translate para convertir el contenido del DOM a minúsculas
    return `xpath=//div[@id="cf-selector-dropdown-menu"]//div[contains(@class, "cf-selector-option")][.//div[contains(@class, "option-name") and translate(normalize-space(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz") = "${lowerOption}"]]`;
  },


  /** pantalla de previsualizacion de datos importados*/
  titlePreviewData: "div.header-box-component > div.subheader-box-title",

  /** Input para subir importacion*/
  inputUploadFile: "input[data-file-input-target='fileInput']",

  /** boton de siguiente*/
  btnNext: "input[type='submit'][value='Siguiente']",

  /** verificacion de archivo cargado con exito*/
  uploadFileSuccess: ".file-info.active",

  /** Boton enviar*/
  btnSubmit: "#submitBtn",

  /** Icono de carga (Spinner girando) */
  loadingIcon: ".flex-column .btn-light-blue .fa-refresh",

  /** Icono de error (X roja)*/
  errorIcon: ".flex-column .btn-red-cf .fa-times",

  /** Icono de éxito (Check verde)*/
  successIcon: ".flex-column .btn-green-cf .fa-check",

  /** Mensaje de error (Está en la misma fila, celda de al lado)*/
  errorMessage: ".flex-column-6"

});
