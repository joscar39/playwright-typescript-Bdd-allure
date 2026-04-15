/**
 * @file newCommunity.steps.ts
 * @description Step definitions para el feature de creación de nueva comunidad normal.
 * Flujo completo: login superadmin → navegación al módulo → formulario 2 pasos → guardado en BD.
 */
import { Given, When, Then } from '@support/fixtures';
import { CredentialsManager } from '@config/CredentialsManager';
import { GoogleSheetsService } from '@utils/services/GoogleSheetsService';

// Claves para datos temporales entre steps (extras reemplaza this[KEY] del World)
const RESULT_KEY = '_newComm_result';
const ID_KEY     = '_newComm_id';

// =============================================================================
// PASOS DE CREACIÓN DE NUEVA COMUNIDAD
// =============================================================================

Given(
  'un usuario superadmin se encuentra loggeado en CF',
  async ({ app }) => {
    await app.login.checkRedirectionToLoginPage();
    await app.login.loginAs(
      CredentialsManager.getEmail(),
      CredentialsManager.getPassword()
    );
    await app.login.checkLoginSuperAdmin();
  }
);

Given(
  'el usuario ingresa al modulo nueva comunidad normal desde el sidebar',
  async ({ app }) => {
    await app.home.goIntoModuleCreateNormalCommunity();
  }
);

When(
  'llenar formulario de creacion de nueva comunidad normal de tipo: {string} en la region: {string}',
  async ({ app, scenarioData }, typeCommunity: string, regionCommunity: string) => {
    const data = await app.newCommunity.fillFormNormalCommunityRegistration(
      typeCommunity,
      regionCommunity
    );
    scenarioData.replaceDataMap(data);
  }
);

Then(
  'se muestra el mensaje de confirmacion de cuenta creada',
  async ({ app, scenarioData }) => {
    const result = await app.newCommunity.checkCommunityCreatedSuccess();
    scenarioData.extras.set(RESULT_KEY, result);
  }
);

Then(
  'se muestra el Id y nombre de la comunidad creada',
  async ({ app, scenarioData }) => {
    const communityId = await app.newCommunity.checkCommunityIdCreatedSuccess();
    scenarioData.extras.set(ID_KEY, communityId);
  }
);

Then(
  'Se almacenan los datos registrados en la BD: {string}',
  async ({ scenarioData }, nameSheetBd: string) => {
    const createdOk   = scenarioData.extras.get(RESULT_KEY) as boolean;
    const communityId = scenarioData.extras.get(ID_KEY) as string;

    if (createdOk && communityId) {
      const finalData = scenarioData.toRecord();
      finalData['IdCommunity']      = communityId;
      finalData['StatusCommunity']  = 'CommunityRegistered';

      await GoogleSheetsService.saveDataInLastEmptyRow(nameSheetBd, finalData);
      console.log(`[NewCommunitySteps] Datos sincronizados en Google Sheets: ${nameSheetBd}`);
    } else {
      throw new Error('La comunidad no fue creada correctamente o falta el ID generado.');
    }
  }
);
