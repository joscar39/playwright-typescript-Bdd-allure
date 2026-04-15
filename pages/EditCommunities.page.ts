/**
 * @file EditCommunities.page.ts
 * @description Page Object para el módulo de edición de comunidad.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { EditCommunityLocators } from './locators/EditCommunities.locators';
import { CommonLocators } from './locators/CommonLocators';
import { BankDataGenerator } from '@utils/generators/BankDataGenerator';

export class EditCommunitiesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ---------------------------------------------------------------------------
  // PERMISOS TEMPORALES
  // ---------------------------------------------------------------------------

  async activeTemporaryPermissions(): Promise<void> {
    const isDisabled = await this.isVisible(CommonLocators.permissionDisable, 5);

    if (isDisabled) {
      await this.screenshot('Permisos temporales deshabilitados - activando...');
      await this.click(CommonLocators.permissionDisable);
      await this.expectVisible(
        CommonLocators.permissionEnable,
        'Los permisos temporales no se activaron correctamente.',
        10
      );
    } else {
      await this.expectVisible(
        CommonLocators.permissionEnable,
        'No se visualizó el candado de permisos temporales de superadmin.',
        5
      );
      await this.screenshot('Permisos temporales ya están habilitados');
    }
  }

  // ---------------------------------------------------------------------------
  // CARGA DE IMÁGENES
  // ---------------------------------------------------------------------------

  async insertImageOfCommunity(imagePath: string): Promise<void> {
    await this.uploadFile(EditCommunityLocators.avatarCommunity, imagePath);
    console.log(`[EditCommunities] Imagen de comunidad subida: ${imagePath}`);
  }

  async insertImageOfAdministration(imagePath: string): Promise<void> {
    await this.scrollToElement(EditCommunityLocators.sectionAdministrationEdit);
    await this.uploadFile(EditCommunityLocators.avatarAdministration, imagePath);
    console.log(`[EditCommunities] Logo de administración subido: ${imagePath}`);
  }

  // ---------------------------------------------------------------------------
  // DATOS BANCARIOS
  // ---------------------------------------------------------------------------

  async fillFormDataBank(dataMap: Map<string, string>): Promise<Map<string, string>> {
    const country = dataMap.get('Country') ?? '';
    const sectionSelector = CommonLocators.textInScreen(EditCommunityLocators.sectionDataBankEdit);

    await this.expectVisible(
      sectionSelector,
      'La sección de datos bancarios no está visible en la página.',
      10
    );
    await this.scrollToElement(sectionSelector);

    if (country.toLowerCase() === 'chile') {
      await this._fillBankDataChile(dataMap);
    } else {
      await this._fillBankDataInternational(dataMap);
    }

    await this.click(CommonLocators.saveBtn);
    await this.waitForNavigation();

    return dataMap;
  }

  private async _fillBankDataChile(dataMap: Map<string, string>): Promise<void> {
    await this.click(EditCommunityLocators.selectBankTypeCl);

    const optionTexts = await this.getTextList(EditCommunityLocators.locNameBanksAvailable);
    const bankOptions = optionTexts.filter(
      t => t.length > 0 && !t.toLowerCase().includes('seleccionar banco')
    );

    if (bankOptions.length === 0) {
      throw new Error('No se encontraron opciones de banco en el dropdown de Chile.');
    }

    const bankCommunity = bankOptions[Math.floor(Math.random() * bankOptions.length)];
    await this.click(EditCommunityLocators.selectOptionDropdownBanksAccount(bankCommunity));
    dataMap.set('CommunityBank', bankCommunity);

    const accountTypes = [
      { name: 'Cuenta corriente', selector: EditCommunityLocators.radioBtnTypeCurrent },
      { name: 'Cuenta de ahorro',  selector: EditCommunityLocators.radioBtnTypeSaving },
      { name: 'Cuenta vista/RUT',  selector: EditCommunityLocators.radioBtnTypeAccountRut },
    ];
    const selected = accountTypes[Math.floor(Math.random() * accountTypes.length)];
    await this.click(selected.selector);
    dataMap.set('TypeBankAccount', selected.name);

    const newAccountNumber = BankDataGenerator.generateAccountNumber(10);
    dataMap.set('BankNumberAccount', newAccountNumber);

    await this.fill(EditCommunityLocators.accountBankNumber, newAccountNumber);
    await this.fill(EditCommunityLocators.accountRutOwner, dataMap.get('CommunityIDNumber(RUTorRFC)') ?? '');
    await this.fill(EditCommunityLocators.accountNameOwner, dataMap.get('NameCommunity') ?? '');
    await this.fill(EditCommunityLocators.accountEmailOwner, dataMap.get('EmailCommunity') ?? '');
  }

  private async _fillBankDataInternational(dataMap: Map<string, string>): Promise<void> {
    const newBankName = 'Banco editado manualmente';
    dataMap.set('CommunityBank', newBankName);
    await this.fill(EditCommunityLocators.accountBankNameInternational, newBankName);

    const newBankNumber = BankDataGenerator.generateAccountNumber(10);
    dataMap.set('BankNumberAccount', newBankNumber);
    await this.fill(EditCommunityLocators.accountBankNumberInternational, newBankNumber);

    const currencyOptions = await this.getSelectOptions(EditCommunityLocators.selectCurrencyBankInternational);
    if (currencyOptions.length > 0) {
      const typeCurrency = currencyOptions[Math.floor(Math.random() * currencyOptions.length)];
      await this.selectOption(EditCommunityLocators.selectCurrencyBankInternational, 'label', typeCurrency);
      dataMap.set('TypeCurrencyAccount', typeCurrency);
    }
  }

  // ---------------------------------------------------------------------------
  // VALIDACIONES
  // ---------------------------------------------------------------------------

  async checkUpdateCommunitySuccess(): Promise<boolean> {
    const selector = CommonLocators.textInScreen(EditCommunityLocators.checkTextUpdateCommunity);
    await this.expectVisible(
      selector,
      'No se mostró el mensaje de comunidad actualizada correctamente.',
      10
    );
    await this.screenshot('Comunidad actualizada exitosamente');
    return true;
  }
}
