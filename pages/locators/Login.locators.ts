/**
 * @file Login.locators.ts
 * @description Selectores exclusivos de la pantalla de Login y flujos de autenticación.
 */
import { PropertiesManager } from '@config/PropertiesManager';

export const LoginLocators = Object.freeze({
  /** URL de la pantalla de login (construida dinámicamente según el entorno activo) */
  get LOGIN_URL(): string {
    return PropertiesManager.getLoginUrl();
  },

  /** Texto que aparece en el dashboard del superadmin tras login exitoso */
  checkLoginSuperAdmin: 'ADMIN DASHBOARD',

  /** Input de email en el formulario de login */
  emailBox: '#email',

  /** Input de contraseña en el formulario de login */
  passwordBox: '#password',

  /** Botón de envío del formulario de login */
  loginBtn: "button[type='submit']",

  /** Título de la página de Términos y Condiciones */
  checkPageTermAndConditions: "xpath=//h1[contains(text(), 'Términos y Condiciones')]",

  /** Botón "He leído y acepto los Términos y Condiciones" */
  btnAcceptTermConditions: "xpath=//a[@href='/usuarios/aceptar_condiciones'][.//div[contains(text(), 'He leído y acepto')]]",

  /** Texto de validación en la página "Mis Comunidades" */
  checkMyCommunitiesPage: "xpath=//div[contains(text(), 'Comunidades que administro')]",

  /** Input para ingresar la nueva contraseña */
  inputNewPassword: '#new_password',

  /** Input para confirmar la nueva contraseña */
  inputConfirmNewPass: '#confirm_password',

  /** Botón para guardar la nueva contraseña */
  btnChangePassword: '#submit-button',
});
