/**
 * @file communities.steps.ts
 * @description Step definitions para el feature de listado y gestión de comunidades.
 * Incluye búsqueda, filtrado y acceso a las acciones de cada comunidad.
 */
import { Given, When, Then } from '@support/fixtures';
import { GoogleSheetsService } from '@utils/services/GoogleSheetsService';

// Clave para guardar el status inicial entre steps (reemplaza this[KEY] del World)
const INITIAL_STATUS_KEY = '_comm_initialStatus';

// =============================================================================
// PASOS DE COMUNIDADES
// =============================================================================

Given(
  'el usuario superadmin se encuentra en el modulo comunidades',
  async ({ app }) => {
    await app.home.goIntoModuleCommunities();
    await app.communities.checkRedirectionToCommunitiesPage();
  }
);

Given(
  'se leen y extraen los datos de pruebas desde la BD: {string}, con status: {string}',
  async ({ scenarioData }, sheetName: string, statusCommunity: string) => {
    scenarioData.extras.set(INITIAL_STATUS_KEY, statusCommunity);
    scenarioData.sheetName = sheetName;

    const data = await GoogleSheetsService.getAndLockRowByStatus(sheetName, statusCommunity);

    if (!data || Object.keys(data).length === 0) {
      throw new Error(
        `No se encontró ningún registro en la hoja "${sheetName}" ` +
        `con estado "${statusCommunity}".`
      );
    }

    scenarioData.fromRecord(data);
  }
);

When(
  'Ingresa id de comunidad a buscar',
  async ({ app, scenarioData }) => {
    const id = scenarioData.dataMap.get('IdCommunity') ?? '';
    await app.communities.insertIdCommunityInInputSearch(id);
  }
);

When(
  'Se pulsa boton filtrar',
  async ({ app }) => {
    await app.communities.clickOnButtonSearch();
  }
);

Then(
  'se muestra resultados exitosos de busqueda de comunidad',
  async ({ app, scenarioData }) => {
    const name  = scenarioData.dataMap.get('NameCommunity') ?? '';
    const idCommunity = scenarioData.dataMap.get('IdCommunity') ?? '';
    const found = await app.communities.checkIsCommunityIsVisibleOnResults(name, idCommunity);

    if (found) {
      const data = scenarioData.toRecord();
      data['StatusCommunity'] = scenarioData.extras.get(INITIAL_STATUS_KEY) as string;
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, data);
    }
  }
);

When(
  'Se pulsar el boton de accion Editar Comunidad',
  async ({ app }) => {
    await app.communities.clickOnButtonEditComm();
  }
);

Then(
  'se muestra redireccion exitosa al modulo de edicion de comunidad',
  async ({ app, scenarioData }) => {
    const ok = await app.communities.checkRedirectionEditCommPage();

    if (ok) {
      const data = scenarioData.toRecord();
      data['StatusCommunity'] = scenarioData.extras.get(INITIAL_STATUS_KEY) as string;
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, data);
    }
  }
);

When(
  'Se pulsar el boton de accion visualizar Comunidad',
  async ({ app }) => {
    await app.communities.clickOnButtonViewComm();
  }
);

Then(
  'se muestra redireccion exitosa al modulo de ver comunidad',
  async ({ app, scenarioData }) => {
    const name = scenarioData.dataMap.get('NameCommunity') ?? '';
    const id   = scenarioData.dataMap.get('IdCommunity') ?? '';
    const ok   = await app.communities.checkRedirectionViewCommPage(name, id);

    if (ok) {
      const data = scenarioData.toRecord();
      data['StatusCommunity'] = scenarioData.extras.get(INITIAL_STATUS_KEY) as string;
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, data);
    }
  }
);

When(
  'Se pulsar el boton de accion impersonar administrador',
  async ({ app }) => {
    await app.communities.clickOnButtonPersonifyAdmin();
  }
);
