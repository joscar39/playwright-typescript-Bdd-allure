/**
 * @file HomeAdminCommunity.page.ts
 * @description Page Object para la navegación del sidebar del dashboard de administrador de comunidad.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { HomeAdminCommunityLocators } from '@pages/locators/HomeAdminCommunity.locators';
import { PropertiesManager } from '@config/PropertiesManager';

export class HomeAdminCommunityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navega al panel del administrador de comunidad.
   * URL: {baseUrl}/panel/administrador
   */
  async navigateToPanelAdmin(): Promise<void> {
    const url = PropertiesManager.getPanelAdminUrl();
    await this.navigateToUrl(url);
    await this.waitForNavigation();
    await this.expectVisible(
      HomeAdminCommunityLocators.sidebarContainer,
      'No se cargó el panel del administrador de comunidad.',
      15
    );
  }

  /**
   * Expande el dropdown "Comunidad conectada" en el sidebar del admin y
   * hace clic en la opción "Residente" para acceder al módulo de residentes.
   */
  async goIntoResidentsModule(): Promise<void> {
    await this.forceExpandDropdown(HomeAdminCommunityLocators.menuCommunityConnected);
    await this.click(HomeAdminCommunityLocators.optionCreateNormalCommunity);
    await this.waitForNavigation();
  }
}
