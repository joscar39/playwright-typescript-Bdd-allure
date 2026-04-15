/**
 * @file ViewCommunity.page.ts
 * @description Page Object para el módulo de vista de detalle de comunidad.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { ViewCommunityLocators } from './locators/ViewCommunity.locators';
import { CommonLocators } from './locators/CommonLocators';
import { DocumentFileResolver, CommunityType } from '@utils/resolvers/DocumentFileResolver';

export class ViewCommunityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillFormToAssignAdminToCommunity(dataMap: Map<string, string>): Promise<void> {
    const fullName = dataMap.get('NamePublicAdministration') ?? '';
    const parts = fullName.split(' ');
    const name = parts[0] ?? '';
    const lastname = parts[1] ?? '';
    const emailAdmin = dataMap.get('EmailPublicAdministration') ?? '';
    const cellAdmin = dataMap.get('CellphoneContact') ?? '';
    const passAdmin = dataMap.get('PasswordAdmin') ?? '';

    await this.scrollToElement(ViewCommunityLocators.sectionAdministrator);

    await this.fill(ViewCommunityLocators.nameAdminAssigned, name);
    await this.fill(ViewCommunityLocators.lastnameAdminAssigned, lastname);
    await this.fill(ViewCommunityLocators.emailAdminAssigned, emailAdmin);
    await this.fill(ViewCommunityLocators.phoneAdminAssigned, cellAdmin);
    await this.fill(ViewCommunityLocators.passAdminAssigned, passAdmin);
    await this.fill(ViewCommunityLocators.confirmPassAdminAssigned, passAdmin);
  }

  async clickButtonSaveAssignAdmin(): Promise<void> {
    await this.click(ViewCommunityLocators.btnAssignAdmin);
    await this.waitForNavigation();
  }

  async checkCommunityAdminAssignedSuccess(): Promise<boolean> {
    const selector = CommonLocators.textInScreen(ViewCommunityLocators.checkAdminAssigned);
    await this.expectVisible(
      selector,
      'No se concretó la asignación de administrador para la comunidad.',
      15
    );
    await this.screenshot('Administrador asignado correctamente');
    return true;
  }

  async selectTypeDocumentSubmit(type: string): Promise<void> {
    await this.forceExpandDropdown(ViewCommunityLocators.selectorButtonDropDown);
    await this.expectVisible(ViewCommunityLocators.optionCaseInsensitive(type), "No se desplego el dropdown con las opciones visibles",10)
    const selector = ViewCommunityLocators.optionCaseInsensitive(type);
    await this.click(selector);
  }

  async sendFileToUpload(typeDocument: string, communityType: CommunityType): Promise<void> {
    const filePath = DocumentFileResolver.resolve(typeDocument, communityType);
    await this.uploadFile(ViewCommunityLocators.inputUploadFile, filePath);
    await this.expectVisible(
      ViewCommunityLocators.uploadFileSuccess,
      `El archivo del tipo "${typeDocument}" no se reflejó en la interfaz tras la carga.`,
      10
    );
  }

  async clickSubmitImport(): Promise<void> {
    await this.click(ViewCommunityLocators.btnSubmit);
  }

  async checkPreviewData(): Promise<void> {
    await this.expectVisible(ViewCommunityLocators.titlePreviewData,
        "La vista preliminar de la importación Excel no cargó correctamente.")
  }

  async clickButtonNext(): Promise<void> {
    await this.click(ViewCommunityLocators.btnNext);
    await this.waitForNavigation('domcontentloaded');
  }

  async waitForImportProcess(): Promise<void> {
    const maxRetries = 10;
    let currentRetry = 0;
    let isProcessed = false;

    console.log("[INFO] Iniciando monitoreo de importación...");

    while (currentRetry < maxRetries && !isProcessed) {
      currentRetry++;
      // 1. Refrescar la página para actualizar el estado del backend
      await this.reloadPage();
      console.log(`[Iteración ${currentRetry}] Refrescando página...`);
      // 2. Verificar Estado de ÉXITO
      if (await this.isVisible(ViewCommunityLocators.successIcon)) {
        console.log("✅ Importación completada con éxito.");
        isProcessed = true;
        return; // El test continúa
      }
      // 3. Verificar Estado de ERROR
      if (await this.isVisible(ViewCommunityLocators.errorIcon)) {
        // Capturamos el mensaje de error del elemento de al lado
        const errorDetail = await this.getText(ViewCommunityLocators.errorMessage);
        const fullMessage = `❌ Importación FALLIDA. Razón: ${errorDetail}`;
        console.error(fullMessage);
        // Lanzamos error para detener la prueba y que Allure lo capture
        throw new Error(fullMessage);
      }
      // 4. Si sigue en LOADING, esperamos un poco antes de la siguiente iteración
      if (await this.isVisible(ViewCommunityLocators.loadingIcon)) {
        console.log("⏳ El documento aún se está procesando...");
        // Espera de cortesía de 1 segundos antes de volver a refrescar
        await this.page.waitForTimeout(1000);
      }
    }
    // 5. Si salimos del bucle sin isProcessed, es un Timeout
    if (!isProcessed) {
      throw new Error("⛔ ERROR: El documento quedó en estado 'Loading' indefinidamente después de 10 intentos.");
    }
  }

}
