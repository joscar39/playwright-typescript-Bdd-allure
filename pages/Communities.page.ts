/**
 * @file Communities.page.ts
 * @description Page Object para el módulo de listado y gestión de comunidades.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CommunitiesLocators } from './locators/Communities.locators';
import { CommonLocators } from './locators/CommonLocators';

export class CommunitiesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async checkRedirectionToCommunitiesPage(): Promise<void> {
    await this.expectVisible(
      CommunitiesLocators.checkCommunitiesPage,
      'No se visualizó el listado de comunidades.',
      10
    );
    await this.screenshot('Listado de comunidades visible');
  }

  async insertIdCommunityInInputSearch(idCommunity: string): Promise<void> {
    await this.fill(CommunitiesLocators.inputSearchCommunity, idCommunity);
  }

  async clickOnButtonSearch(): Promise<void> {
    await this.click(CommunitiesLocators.searchBtn);
    await this.waitForNavigation();
  }

  async checkIsCommunityIsVisibleOnResults(nameCommunity: string, idCommunity: string ): Promise<boolean> {
    const selector = CommunitiesLocators.uniqueCommunityRowFound(idCommunity, nameCommunity)
    await this.expectVisible(
      selector,
      `La comunidad "${nameCommunity}" no aparece en los resultados de búsqueda.`,
      15
    );
    await this.screenshot(`Comunidad "${nameCommunity}" visible en resultados`);
    return true;
  }

  async clickOnButtonEditComm(): Promise<void> {
    await this.click(CommunitiesLocators.actionEditComm);
    await this.waitForNavigation();
  }

  async clickOnButtonViewComm(): Promise<void> {
    await this.click(CommunitiesLocators.actionSeeComm);
    await this.waitForNavigation();
  }

  async clickOnButtonDeactivateComm(): Promise<void> {
    await this.click(CommunitiesLocators.actionDeactivateComm);
  }

  async clickOnButtonPersonifyAdmin(): Promise<void> {
    await this.click(CommunitiesLocators.actionImperAdmin);
    await this.waitForNavigation();
  }

  async checkRedirectionEditCommPage(): Promise<boolean> {
    const selector = CommonLocators.textInScreen(CommunitiesLocators.checkRedirectionEditComm);
    await this.expectVisible(
      selector,
      'No se visualizó la pantalla de edición de comunidad.',
      15
    );
    await this.screenshot('Página de editar comunidad visible');
    return true;
  }

  async checkRedirectionViewCommPage(name: string, id: string): Promise<boolean> {
    const selector = CommunitiesLocators.checkRedirectionViewComm(name, id);
    await this.expectVisible(
      selector,
      `No se visualizó la pantalla de ver comunidad: "${name}" #${id}.`,
      15
    );
    await this.screenshot('Página de ver comunidad visible');
    return true;
  }
}
