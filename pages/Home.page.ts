/**
 * @file Home.page.ts
 * @description Page Object para la navegación del sidebar del dashboard de superadmin.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { HomeLocators } from './locators/Home.locators';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goIntoModuleCommunities(): Promise<void> {
    await this.forceActiveState(HomeLocators.sidebarContainer);
    await this.waitVisible(HomeLocators.optionCommunitiesSideBar);
    await this.click(HomeLocators.optionCommunitiesSideBar);
    await this.waitForNavigation();
    console.log('[HomePage] Navegando al módulo de Comunidades.');
  }

  async goIntoModuleCreateNormalCommunity(): Promise<void> {
    await this.forceActiveState(HomeLocators.sidebarContainer);
    await this.forceExpandDropdown(HomeLocators.dropdownNewCommunity);
    await this.click(HomeLocators.optionCreateNormalCommunity);
    await this.waitForNavigation();
    console.log('[HomePage] Navegando al módulo de Nueva Comunidad Normal.');
  }
}
