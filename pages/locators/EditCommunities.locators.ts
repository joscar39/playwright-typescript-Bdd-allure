/**
 * @file EditCommunities.locators.ts
 * @description Selectores del módulo de edición de comunidad.
 */
export const EditCommunityLocators = Object.freeze({
  /** Input de imagen/avatar de la comunidad */
  avatarCommunity: '#community_avatar',

  /** Sección de administración (scroll target) */
  sectionAdministrationEdit: '#administration_title',

  /** Input de imagen/logo de la administración */
  avatarAdministration: '#community_company_image',

  /** Input nombre de banco (internacional/México) */
  accountBankNameInternational: '#community_bank',

  /** Input número de cuenta bancaria (internacional) */
  accountBankNumberInternational: '#community_bank_account_number',

  /** Select moneda bancaria (internacional) */
  selectCurrencyBankInternational: '#community_currency_code',

  /** Botón dropdown para seleccionar banco (Chile - custom dropdown) */
  selectBankTypeCl: "xpath=(//button[@id='cf-selector-button'])[2]",

  /** Contenedor de nombres de bancos en el dropdown custom */
  locNameBanksAvailable: "xpath=//div[@id='cf-selector-dropdown-menu' and contains(@class, 'pre-scrollable')]//div[contains(@class, 'cf-selector-option') and not(@data-value='0')]//div[contains(@class, 'option-name')]",

  /**
   * Opción específica en el dropdown de bancos.
   * @param text - Nombre visible del banco.
   */
  selectOptionDropdownBanksAccount: (text: string): string =>
    `xpath=//div[@class='option-name' and normalize-space()='${text}']`,

  /** Texto de validación de la sección de datos bancarios */
  sectionDataBankEdit: 'Datos bancarios',

  /** Radio button: Tipo Cuenta Corriente */
  radioBtnTypeCurrent: '#bank_account_account_type_checking',

  /** Radio button: Tipo Cuenta Ahorro */
  radioBtnTypeSaving: '#bank_account_account_type_savings',

  /** Radio button: Tipo Cuenta RUT */
  radioBtnTypeAccountRut: '#bank_account_account_type_sight',

  /** Input número de cuenta bancaria */
  accountBankNumber: '#bank_account_number',

  /** Input RUT del titular de la cuenta */
  accountRutOwner: '#bank_account_holder_rut',

  /** Input nombre del titular de la cuenta */
  accountNameOwner: '#bank_account_holder_name',

  /** Input email del titular */
  accountEmailOwner: '#bank_account_email',

  /** Texto de validación de comunidad actualizada */
  checkTextUpdateCommunity: 'Comunidad actualizada correctamente',
});
