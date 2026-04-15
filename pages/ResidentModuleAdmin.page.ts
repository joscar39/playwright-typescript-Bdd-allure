/**
 * @file ResidentModuleAdmin.page.ts
 * @description Page Object para el módulo de Residentes del dashboard de administrador de comunidad.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { ResidentModuleAdminLocators } from '@pages/locators/ResidentModuleAdmin.locators';
import { CommunityDocumentValidator } from '@utils/validators/CommunityDocumentValidator';

export class ResidentModuleAdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Cierra el modal de bienvenida al módulo de Residentes si está visible.
   * El modal aparece la primera vez que el admin ingresa al módulo.
   */
  private async dismissOnboardingModalIfVisible(): Promise<void> {
    if (await this.isVisible(ResidentModuleAdminLocators.modalContainer, 3)) {
      console.log('[ResidentModuleAdmin] Modal de bienvenida detectado, cerrando...');
      await this.click(ResidentModuleAdminLocators.btnMaybeLater);
    }
  }

  /**
   * Verifica la redirección correcta al módulo de Residentes comprobando
   * la visibilidad del encabezado "Residentes". También cierra el modal de
   * bienvenida si aparece tras la navegación.
   */
  async checkRedirectionToResidentPageSuccess(): Promise<void> {
    await this.expectVisible(
      ResidentModuleAdminLocators.residentsHeaderText,
      'No se redirigió correctamente al módulo de Residentes.',
      15
    );
    await this.dismissOnboardingModalIfVisible();
    await this.screenshot('Módulo de Residentes cargado correctamente');
  }

  /**
   * Obtiene los valores de la columna "Unidad" de la primera página del módulo
   * de Residentes y verifica que cada uno exista en el archivo Excel de propiedades
   * correspondiente al tipo de comunidad indicado.
   *
   * Solo evalúa la primera página — no recorre la paginación completa.
   *
   * @param communityType - 'CC' (Chile) o 'SC' (México).
   * @returns true si todos los valores de la web existen en el Excel; false si alguno no coincide.
   */
  async checkDataPropertiesIsCorrect(communityType: string): Promise<boolean> {
    const webUnits = await this.getTextList(ResidentModuleAdminLocators.unitColumnValues);

    const validator = new CommunityDocumentValidator();
    const result = await validator.unitsMatchExcel(webUnits, communityType);

    if (result) {
      await this.screenshot('Registros de propiedades verificados correctamente');
    } else {
      await this.screenshot('Error: Unidades de la web no coinciden con el Excel');
    }
    return result;
  }

  /**
   * Hace clic en el botón "Unidades" para navegar al módulo de propiedades/unidades.
   */
  async goToPropertiesModule(): Promise<void> {
    await this.click(ResidentModuleAdminLocators.btnUnitsProperties);
    await this.waitForNavigation();
  }
}
