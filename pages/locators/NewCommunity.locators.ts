/**
 * @file NewCommunity.locators.ts
 * @description Selectores del formulario de creación de nueva comunidad normal (2 pasos).
 */
export const NewCommunityLocators = Object.freeze({
  /** Input nombre de la comunidad */
  communityName: '#community_name',

  /** Input RUT (Chile) o RFC (México) */
  communityIdRutOrRfc: '#community_identifications_attributes_0_identity',

  /** Input nombre del banco para el balance inicial */
  communityBankName: '#community_bank',

  /** Input balance inicial de la cuenta bancaria */
  initialBalanceAccountBankCommunity: '#transaction_value',

  /** Input nombre de la administración pública */
  publicAdministrationName: '#community_contact_name',

  /** Input email de la administración pública */
  publicAdministrationEmail: '#community_contact_email',

  /** Input teléfono de contacto */
  communityContactPhone: '#community_contact_phone',

  /** Checkbox "Comunidad Real" */
  communityRealCheck: '#community_count_csm',

  /** Select de país */
  selectCommunityCountry: '#community_country_code',

  /** Sección de dirección (scroll target) */
  sectionAddress: "xpath=//h1[contains(text(), 'Dirección')]",

  /** Input de ciudad/dirección con autocompletado */
  communityCity: '#autocomplete',

  /** * Selector de sugerencias de Google Maps (clase interna de Google Places API).
   * Se usa como ancla de espera antes de presionar ArrowDown/Enter.
   */
  googleAddressSuggestion: '.pac-item >> nth=0',

  /** Input código postal (solo México) */
  postalCodeMx: '#community_mx_company_attributes_postal_code',

  /** Radio button "Con control" (tipo CC) */
  checkWithControlCommunity: '#period_control_yes',

  /** Radio button "Sin control" (tipo SC) */
  checkWithoutControlCommunity: '#period_control_no',

  /** Sección de fondo de reserva (scroll target) */
  sectionFundAndExpiration: "xpath=//h1[contains(text(), 'Fondo de reserva y expiración')]",

  /** Input día de vencimiento de gastos comunes */
  expirationCommonExpensesDays: '#community_expiration_day',

  /** Input porcentaje fondo de reserva */
  percentageFundReserve: '#community_reserve_fund',

  /** Input balance inicial fondo de reserva */
  initialFundReservePrice: '#community_initial_price',

  /** Input balance inicial fondo operacional */
  initialFundOperationalPrice: '#community_operational_fund_initial_price',

  /** Sección de multa (scroll target) */
  sectionFine: "xpath=//h1[contains(text(), 'Multa')]",

  /** Select tipo de multa */
  selectTypeFine: '#community_community_interests_attributes_0_price_type',

  /** Input monto de la multa */
  inputAmountFine: '#community_community_interests_attributes_0_price',

  /** Select moneda para la multa */
  selectTypeCurrencyByFine: '#community_community_interests_attributes_0_currency_id',

  /** Select periodicidad de la multa */
  selectTypePeriodicityFine: '#community_community_interests_attributes_0_fixed_daily_interest',

  /** Input deuda mínima para aplicar multa */
  inputMinAmountDebt: '#community_community_interests_attributes_0_minimun_debt',

  /** Input porcentaje de interés */
  inputInterestsPercentage: '#community_community_interests_attributes_0_amount',

  /** Select tipo de tasa de interés */
  selectTypeInterest: '#community_community_interests_attributes_0_rate_type',

  /** Select tipo de interés compuesto */
  selectTypeInterestCompound: '#community_community_interests_attributes_0_compound',

  /** Select cálculo base del interés */
  selectInterestCalculateAmount: '#community_community_interests_attributes_0_only_common_expenses',

  /** Mensaje de transición al paso 2 */
  confirmationMsgTitle: "xpath=//span[contains(text(), 'Queda un solo paso para tener la comunidad andando!')]",

  /** Título del paso 2 del formulario */
  secondStepTitle: "xpath=//h1[contains(text(), 'Paso 2: Configurar los datos de facturación')]",

  /** Checkbox de valores fiscales por defecto (solo México) */
  checkDefaultFiscalValueMx: "xpath=//div[@data-accounts--form-target='defaultFiscalValuesCheckbox']//input[@type='checkbox']",

  /** Checkbox del contacto principal */
  checkPrincipalContact: '#account_account_contacts_attributes_0__destroy',

  /** Input email del contacto de la comunidad */
  inputEmailContactCommunity: '#account_account_contacts_attributes_0_email',

  /** Mensaje de cuenta creada exitosamente */
  communityCreatedTitle: "xpath=//span[contains(text(), 'La cuenta fue creada!')]",

  /** Div con el ID y nombre de la comunidad creada */
  communityIdCreated: "xpath=//div[@class='header-box-title' and starts-with(normalize-space(), 'Comunidad:')]",
});
