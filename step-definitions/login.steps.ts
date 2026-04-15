/**
 * @file login.steps.ts
 * @description Step definitions para el feature de Login.
 * Cubre login como superadmin y login como administrador recurrente con
 * configuración de contraseña nueva y actualización de estado en Google Sheets.
 */
import { Given, When, Then } from '@support/fixtures';
import { CredentialsManager } from '@config/CredentialsManager';
import { GoogleSheetsService } from '@utils/services/GoogleSheetsService';

// =============================================================================
// PASOS DE LOGIN COMO SUPERADMIN
// =============================================================================

Given(
  'la aplicación está inicializada y en la pantalla de login',
  async ({ app }) => {
    await app.login.checkRedirectionToLoginPage();
  }
);

When(
  'Se ingresas las credenciales como superadmin',
  async ({ app }) => {
    await app.login.loginAs(
      CredentialsManager.getEmail(),
      CredentialsManager.getPassword()
    );
  }
);

Then(
  'Se redireccionar al home como superadmin exitosamente',
  async ({ app }) => {
    await app.login.checkLoginSuperAdmin();
  }
);

// =============================================================================
// PASOS DE LOGIN COMO ADMINISTRADOR POR PRIMERA VEZ
// =============================================================================

Given(
  'se leen los datos de la BD para acceder como admin: {string} con status: {string}',
  async ({ app, scenarioData }, sheetName: string, statusCommunity: string) => {
    const data = await GoogleSheetsService.getAndLockRowByStatus(sheetName, statusCommunity);

    if (!data || Object.keys(data).length === 0) {
      throw new Error(
        `No se encontró ningún registro en la hoja "${sheetName}" ` +
        `con estado "${statusCommunity}".`
      );
    }

    scenarioData.fromRecord(data);
    scenarioData.sheetName = sheetName;
  }
);

When(
  'Se ingresas las credenciales de usuario admin de una comunidad',
  async ({ app, scenarioData }) => {
    const email    = scenarioData.dataMap.get('EmailPublicAdministration') ?? '';
    const password = scenarioData.dataMap.get('PasswordAdmin') ?? '';
    await app.login.loginAs(email, password);
  }
);

When(
  'se muestra redireccion hacia pantalla de terminos y condiciones',
  async ({ app }) => {
    await app.login.checkRedirectionTermAndConditionsPage();
  }
);

When(
  'Se debe configurar contraseña nueva como admin',
  async ({ app, scenarioData }) => {
    const password = scenarioData.dataMap.get('PasswordAdmin') ?? '';
    await app.login.changeNewPassword(password);
  }
);

Then(
  'Se redirecciona a la pantalla de mis comunidades',
  async ({ app, scenarioData }) => {
    const visible = await app.login.checkRedirectionMyCommunitiesPage();

    if (visible) {
      const finalData = scenarioData.toRecord();
      finalData['StatusCommunity'] = 'AdminRecurring';
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, finalData);
      console.log('[LoginSteps] Estado actualizado a "AdminRecurring" en la BD.');
    }
  }
);
