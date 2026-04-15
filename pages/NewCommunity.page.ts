/**
 * @file NewCommunity.page.ts
 * @description Page Object para el formulario de creación de nueva comunidad normal (2 pasos).
 *
 * Paso 1: Datos básicos (nombre, RUT/RFC, banco, administración, dirección, datos financieros).
 * Paso 2: Datos de facturación (contacto de la cuenta).
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { NewCommunityLocators } from './locators/NewCommunity.locators';
import { CommonLocators } from './locators/CommonLocators';
import { CommunityGenerator } from '@utils/generators/CommunityGenerator';
import { RutGenerator } from '@utils/generators/RutGenerator';
import { RfcGenerator } from '@utils/generators/RfcGenerator';
import { BankDataGenerator } from '@utils/generators/BankDataGenerator';
import { AdministratorPublicGenerator } from '@utils/generators/AdministratorPublicGenerator';
import { AddressGeneratorByCountry } from '@utils/generators/AddressGeneratorByCountry';
import { CountryMapper } from '@utils/generators/CountryMapper';
import { CredentialsManager } from '@config/CredentialsManager';

export class NewCommunityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Rellena el formulario completo de nueva comunidad normal en 2 pasos.
   * Genera todos los datos aleatoriamente y los retorna para guardar en la BD.
   */
  async fillFormNormalCommunityRegistration(
    typeCommunity: string,
    regionCommunity: string
  ): Promise<Map<string, string>> {
    const dataMap = new Map<string, string>();
    const isMexico = regionCommunity.toLowerCase() === 'mexico';
    const isChile = regionCommunity.toLowerCase() === 'chile';

    // -------------------------------------------------------------------------
    // GENERACIÓN DE DATOS ALEATORIOS
    // -------------------------------------------------------------------------
    const nameCommunity = CommunityGenerator.communityNameGenerator(regionCommunity, typeCommunity);
    const communityEmail = CommunityGenerator.communityEmailGenerator(nameCommunity);
    const rutOrRfc = isChile
      ? RutGenerator.generateRandomRut(true)
      : isMexico
        ? RfcGenerator.generateRandomRfc()
        : 'N/A';
    const bankName = BankDataGenerator.getRandomBankName();
    const balanceBank = Math.floor(Math.random() * (1_000_000 - 1_000 + 1) + 1_000);
    const adminName = AdministratorPublicGenerator.publicNameGenerator();
    const adminEmail = AdministratorPublicGenerator.corporateEmailGenerator(adminName);
    const cellphone = Math.floor(Math.random() * (99_999_999 - 10_000_000 + 1) + 10_000_000);
    const address = AddressGeneratorByCountry.generateAddress(regionCommunity);
    const zipCode = isMexico ? AddressGeneratorByCountry.createZipCodeMexico(address) : 'N/A';
    const isReal = Math.random() < 0.5;

    const expDay = Math.floor(Math.random() * 30 + 1);
    const percReserve = Math.floor(Math.random() * 100 + 1);
    const initReserve = Math.floor(Math.random() * 9_000_000 + 10_000);
    const initOperational = Math.floor(Math.random() * 9_000_000 + 10_000);

    const typeFineOptions = await this.getSelectOptions(NewCommunityLocators.selectTypeFine);
    const typeFine = typeFineOptions[Math.floor(Math.random() * typeFineOptions.length)];
    const amountFine = typeFine.toLowerCase().includes('porcentual')
      ? Math.floor(Math.random() * 10 + 1)
      : Math.floor(Math.random() * 40_000 + 10_000);

    const currencyOptions = await this.getSelectOptions(NewCommunityLocators.selectTypeCurrencyByFine);
    const currencyFine = currencyOptions[Math.floor(Math.random() * currencyOptions.length)];

    const freqOptions = await this.getSelectOptions(NewCommunityLocators.selectTypePeriodicityFine);
    const freqFine = freqOptions[Math.floor(Math.random() * freqOptions.length)];

    const minDebt = Math.floor(Math.random() * 50_000 + 50_000);
    const intRate = Math.floor(Math.random() * 10 + 1);

    const typeRateOptions = await this.getSelectOptions(NewCommunityLocators.selectTypeInterest);
    const typeRate = typeRateOptions[Math.floor(Math.random() * typeRateOptions.length)];

    const priorIntOptions = await this.getSelectOptions(NewCommunityLocators.selectTypeInterestCompound);
    const priorInt = priorIntOptions[Math.floor(Math.random() * priorIntOptions.length)];

    const calcAmountOptions = await this.getSelectOptions(NewCommunityLocators.selectInterestCalculateAmount);
    const calcIntAmount = calcAmountOptions[Math.floor(Math.random() * calcAmountOptions.length)];

    // -------------------------------------------------------------------------
    // ALMACENAMIENTO EN EL MAPA
    // -------------------------------------------------------------------------
    dataMap.set('NameCommunity', nameCommunity);
    dataMap.set('EmailCommunity', communityEmail);
    dataMap.set('CommunityIDNumber(RUTorRFC)', rutOrRfc);
    dataMap.set('CommunityBank', bankName);
    dataMap.set('InitialBalanceBankAccount', String(balanceBank));
    dataMap.set('NamePublicAdministration', adminName);
    dataMap.set('EmailPublicAdministration', adminEmail);
    dataMap.set('PasswordAdmin', CredentialsManager.getAdminInitialPassword());
    dataMap.set('CellphoneContact', String(cellphone));
    dataMap.set('CommunityIsReal', String(isReal));
    dataMap.set('Country', regionCommunity);
    dataMap.set('Address', address);
    dataMap.set('ZipCode', zipCode);
    dataMap.set('TypeCommunity', typeCommunity);
    dataMap.set('ExpirationDayCommosExpenses', String(expDay));
    dataMap.set('PercentageFoundReserve', String(percReserve));
    dataMap.set('InitialBalanceFoundReserve', String(initReserve));
    dataMap.set('InitialBalanceFoundOperational', String(initOperational));
    dataMap.set('TypeFine', typeFine);
    dataMap.set('MountFine', String(amountFine));
    dataMap.set('TypeCurrencyFine', currencyFine);
    dataMap.set('FrequencyCollecteFine', freqFine);
    dataMap.set('MinimunDebtForFine', String(minDebt));
    dataMap.set('InterestRate', String(intRate));
    dataMap.set('TypeRate', typeRate);
    dataMap.set('ConsiderPriorInterests', priorInt);
    dataMap.set('AmountCalculatingInterest', calcIntAmount);

    // =========================================================================
    // PASO 1: PRIMERA PÁGINA DEL FORMULARIO
    // =========================================================================

    await this.selectOption(NewCommunityLocators.selectCommunityCountry, 'value', CountryMapper.getCode(regionCommunity));
    await this.fill(NewCommunityLocators.communityName, nameCommunity);
    await this.fill(NewCommunityLocators.communityIdRutOrRfc, rutOrRfc);
    await this.fill(NewCommunityLocators.communityBankName, bankName);
    await this.fill(NewCommunityLocators.initialBalanceAccountBankCommunity, balanceBank);
    await this.fill(NewCommunityLocators.publicAdministrationName, adminName);
    await this.fill(NewCommunityLocators.publicAdministrationEmail, adminEmail);
    await this.fill(NewCommunityLocators.communityContactPhone, cellphone);

    const isCurrentlyChecked = await this.isChecked(NewCommunityLocators.communityRealCheck);
    if (isReal !== isCurrentlyChecked) {
      await this.click(NewCommunityLocators.communityRealCheck);
    }

    await this.scrollToElement(NewCommunityLocators.sectionAddress);

    await this.expectAttribute(
        NewCommunityLocators.communityCity,
        'class',
        /pac-target-input/, 30
    );

    // 1. Escribimos la dirección con simulación de teclado real para despertar a Google
    await this.type(NewCommunityLocators.communityCity, address);

    // 2. Usamos TU metodo de espera técnica en lugar del genérico de Playwright
    await this.waitVisible(NewCommunityLocators.googleAddressSuggestion, 5);

    // 3. Navegamos y seleccionamos con las flechas
    await this.pressKeys(
        NewCommunityLocators.communityCity,
        ['ArrowDown', 'Enter']
    );

    if (isMexico) {
      await this.fill(NewCommunityLocators.postalCodeMx, zipCode);
      await this.screenshot('CP ingresado en formulario México');
    }

    if (typeCommunity.toLowerCase() === 'cc') {
      const scSelected = await this.isChecked(NewCommunityLocators.checkWithoutControlCommunity);
      if (scSelected) {
        await this.click(NewCommunityLocators.checkWithControlCommunity);
      }
    } else if (typeCommunity.toLowerCase() === 'sc') {
      const ccSelected = await this.isChecked(NewCommunityLocators.checkWithControlCommunity);
      if (ccSelected) {
        await this.click(NewCommunityLocators.checkWithoutControlCommunity);
      }
    }

    await this.scrollToElement(NewCommunityLocators.sectionFundAndExpiration);
    await this.fill(NewCommunityLocators.expirationCommonExpensesDays, expDay);
    await this.fill(NewCommunityLocators.percentageFundReserve, percReserve);
    await this.fill(NewCommunityLocators.initialFundReservePrice, initReserve);
    await this.fill(NewCommunityLocators.initialFundOperationalPrice, initOperational);

    await this.scrollToElement(NewCommunityLocators.sectionFine);
    await this.selectOption(NewCommunityLocators.selectTypeFine, 'label', typeFine);
    await this.fill(NewCommunityLocators.inputAmountFine, amountFine);
    await this.selectOption(NewCommunityLocators.selectTypeCurrencyByFine, 'label', currencyFine);

    if (!typeFine.toLowerCase().includes('porcentual')) {
      await this.selectOption(NewCommunityLocators.selectTypePeriodicityFine, 'label', freqFine);
    }

    await this.fill(NewCommunityLocators.inputMinAmountDebt, minDebt);
    await this.fill(NewCommunityLocators.inputInterestsPercentage, intRate);
    await this.selectOption(NewCommunityLocators.selectTypeInterest, 'label', typeRate);
    await this.selectOption(NewCommunityLocators.selectTypeInterestCompound, 'label', priorInt);
    await this.selectOption(NewCommunityLocators.selectInterestCalculateAmount, 'label', calcIntAmount);

    await this.click(CommonLocators.saveBtn);
    await this.waitForNavigation();

    // =========================================================================
    // PASO 2: VALIDAR TRANSICIÓN Y COMPLETAR DATOS DE FACTURACIÓN
    // =========================================================================
    await this.expectVisible(
      NewCommunityLocators.confirmationMsgTitle,
      'No se detectó la transición al paso 2 del formulario.',
      15
    );
    await this.expectVisible(
      NewCommunityLocators.secondStepTitle,
      'El título del paso 2 no es visible.',
      10
    );
    await this.screenshot('Transición exitosa al paso 2 del formulario');

    if (isMexico) {
      await this.click(NewCommunityLocators.checkDefaultFiscalValueMx);
    }

    // El checkbox controla el email input vía un Stimulus toggle controller
    // (data-action="input->toggle#call"). El controller valida event.isTrusted,
    // por lo que ignora cualquier evento sintético de Playwright.
    // Se remueve el atributo 'disabled' directamente para habilitar el campo.
    // El checkbox queda marcado correctamente para el envío del formulario.
    await this.setCheckboxState(NewCommunityLocators.checkPrincipalContact, true);
    await this.forceRemoveAttribute(NewCommunityLocators.inputEmailContactCommunity, 'disabled');
    await this.fill(NewCommunityLocators.inputEmailContactCommunity, communityEmail);

    await this.click(CommonLocators.saveBtn);
    await this.waitForNavigation();

    return dataMap;
  }

  // ---------------------------------------------------------------------------
  // VALIDACIONES POST-CREACIÓN
  // ---------------------------------------------------------------------------

  async checkCommunityCreatedSuccess(): Promise<boolean> {
    await this.expectVisible(
      NewCommunityLocators.communityCreatedTitle,
      'No se visualizó la confirmación de comunidad registrada.',
      15
    );
    await this.screenshot('Comunidad registrada exitosamente');
    return true;
  }

  async checkCommunityIdCreatedSuccess(): Promise<string> {
    await this.expectVisible(
      NewCommunityLocators.communityIdCreated,
      'No se visualizó el ID o nombre de la comunidad registrada.',
      10
    );
    await this.screenshot('ID y título de comunidad creada visualizados correctamente');

    const elementText = await this.getText(NewCommunityLocators.communityIdCreated);
    const parts = elementText.split('#');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    throw new Error(`No se pudo extraer el ID del texto: "${elementText}"`);
  }
}
