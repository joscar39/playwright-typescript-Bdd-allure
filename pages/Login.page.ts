/**
 * @file Login.page.ts
 * @description Page Object para la pantalla de login de ComunidadFeliz.
 */
import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { LoginLocators } from './locators/Login.locators';
import { CommonLocators } from './locators/CommonLocators';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async checkRedirectionToLoginPage(): Promise<void> {
    await this.navigateToUrl(LoginLocators.LOGIN_URL, 15);
    await this.expectVisible(
      LoginLocators.emailBox,
      'No se visualizó el formulario de login. El campo de email no está visible.',
      10
    );
    await this.screenshot('Pantalla de login visible');
  }

  async insertEmail(email: string): Promise<void> {
    if (!email || email.trim() === '') {
      throw new Error('El email ingresado no es válido o está vacío.');
    }
    await this.fill(LoginLocators.emailBox, email);
  }

  async insertPassword(password: string): Promise<void> {
    if (!password || password.trim() === '') {
      throw new Error('La contraseña ingresada no es válida o está vacía.');
    }
    await this.fill(LoginLocators.passwordBox, password);
  }

  async clickOnButtonLogin(): Promise<void> {
    await this.click(LoginLocators.loginBtn);
    await this.waitForNavigation();
  }

  async loginAs(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new Error('Credenciales inválidas: email o password vacíos.');
    }
    await this.insertEmail(email);
    await this.insertPassword(password);
    await this.clickOnButtonLogin();
  }

  async checkLoginSuperAdmin(): Promise<void> {
    const selector = CommonLocators.textInScreen(LoginLocators.checkLoginSuperAdmin);
    await this.expectVisible(
      selector,
      'Login como superadmin fallido: el ADMIN DASHBOARD no es visible.',
      15
    );
    await this.screenshot('Login como superadmin exitoso');
  }

  async checkRedirectionTermAndConditionsPage(): Promise<void> {
    await this.expectVisible(
      LoginLocators.checkPageTermAndConditions,
      'No se visualizó la pantalla de Términos y Condiciones.',
      10
    );
    await this.screenshot('Pantalla de Términos y Condiciones visible');
    await this.click(LoginLocators.btnAcceptTermConditions);
    await this.waitForNavigation();
  }

  async changeNewPassword(password: string): Promise<void> {
    await this.fill(LoginLocators.inputNewPassword, password);
    await this.fill(LoginLocators.inputConfirmNewPass, password);
    await this.click(LoginLocators.btnChangePassword);
    await this.waitForNavigation();
  }

  async checkRedirectionMyCommunitiesPage(): Promise<boolean> {
    await this.expectVisible(
      LoginLocators.checkMyCommunitiesPage,
      'No se visualizó la pantalla de Mis Comunidades.',
      15
    );
    await this.screenshot('Pantalla de Mis Comunidades visible');
    return true;
  }
}
