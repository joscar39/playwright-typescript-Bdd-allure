/**
 * @file ResidentPropertiesAdmin.page.ts
 * @description Page Object para el módulo de Unidades/Propiedades del dashboard de administrador de comunidad.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { ResidentPropertiesAdmin } from '@pages/locators/ResidentPropertiesAdmin.locators';
import { CommunityDocumentValidator } from '@utils/validators/CommunityDocumentValidator';

export class ResidentPropertiesAdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verifica la redirección correcta al módulo de Unidades comprobando
   * la visibilidad del título dinámico "Unidades de {communityName}".
   *
   * @param communityName - Nombre de la comunidad (dataMap: NameCommunity).
   */
  async checkRedirectionToPropertiesPageSuccess(communityName: string): Promise<void> {
    await this.expectVisible(
      ResidentPropertiesAdmin.communityUnitsTitle(communityName),
      `No se redirigió correctamente al módulo de Unidades de "${communityName}".`,
      15
    );
    await this.screenshot('Módulo de Unidades cargado correctamente');
  }

  /**
   * Obtiene el total de prorrateo mostrado en la web y verifica que coincida
   * (dentro de la tolerancia permitida) con la suma de property[size] del Excel de propiedades CC.
   *
   * Tolerancia: 0.1 — cubre el redondeo del front cuando el decimal ≥ 0.095.
   *
   * @param communityType - 'CC' (Chile) o 'SC' (México).
   * @returns true si |webTotal - excelSum| <= 0.1; false si excede la tolerancia.
   */
  async checkDataApportionmentCCIsCorrect(communityType: string): Promise<boolean> {
    const webTotalText = await this.getText(ResidentPropertiesAdmin.apportionmentTotalAmount);

    const validator = new CommunityDocumentValidator();
    const result = await validator.apportionmentMatchesExcel(webTotalText, communityType);

    if (result) {
      await this.screenshot('Prorrateo verificado correctamente');
    } else {
      await this.screenshot('Error: Prorrateo no coincide con Excel');
    }
    return result;
  }

  /**
   * Obtiene los saldos visibles en la web (primera página) y verifica que cada uno
   * cumpla la regla de inversión de signo respecto al Excel de saldos de la comunidad.
   *
   * Regla: Excel negativo → web positivo | Excel positivo → web negativo | 0 → 0.
   *
   * @param communityType - 'CC' (Chile) o 'SC' (México).
   * @returns true si todos los saldos web cumplen la regla de inversión; false si alguno no coincide.
   */
  async checkDataBalanceCCIsCorrect(communityType: string): Promise<boolean> {
    const webBalanceTexts = await this.getTextList(ResidentPropertiesAdmin.balanceColumnValues);

    const validator = new CommunityDocumentValidator();
    const result = await validator.balancesMatchExcel(webBalanceTexts, communityType);

    if (result) {
      await this.screenshot('Saldos verificados correctamente');
    } else {
      await this.screenshot('Error: Saldos no coinciden con Excel');
    }
    return result;
  }
}
