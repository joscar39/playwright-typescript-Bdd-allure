/**
 * @file editCommunities.steps.ts
 * @description Step definitions para el feature de edición de comunidades.
 * Incluye activación de permisos, carga de imágenes y actualización de datos bancarios.
 */
import { Given, When, Then } from '@support/fixtures';
import { GoogleSheetsService } from '@utils/services/GoogleSheetsService';
import { ImageFileResolver } from '@utils/resolvers/ImageFileResolver';

// =============================================================================
// PASOS DE EDICIÓN DE COMUNIDADES
// =============================================================================

Given(
  'el usuario superadmin accede al modulo editar comunidades',
  async ({ app, scenarioData }) => {
    const name = scenarioData.dataMap.get('NameCommunity') ?? '';
    const id = scenarioData.dataMap.get('IdCommunity') ?? '';
    await app.communities.insertIdCommunityInInputSearch(id);
    await app.communities.clickOnButtonSearch();
    await app.communities.checkIsCommunityIsVisibleOnResults(name, id);
    await app.communities.clickOnButtonEditComm();
    await app.communities.checkRedirectionEditCommPage();
  }
);

When(
  'el usuario superadmin activa permisos temporales en la vista',
  async ({ app }) => {
    await app.editCommunities.activeTemporaryPermissions();
  }
);

When(
  'Se ingresa imagen de la comunidad',
  async ({ app }) => {
    const imgPath = ImageFileResolver.resolveRandom('community');
    await app.editCommunities.insertImageOfCommunity(imgPath);
  }
);

When(
  'Ingresa logo de la administracion',
  async ({ app }) => {
    const imgPath = ImageFileResolver.resolveRandom('admin');
    await app.editCommunities.insertImageOfAdministration(imgPath);
  }
);

When(
  'Se modifica datos bancarios para la comunidad segun la region',
  async ({ app, scenarioData }) => {
    const updatedMap = await app.editCommunities.fillFormDataBank(scenarioData.dataMap);
    scenarioData.replaceDataMap(updatedMap);
  }
);

Then(
  'se muestra mensaje de comunidad actualiza con exito',
  async ({ app, scenarioData }) => {
    const ok = await app.editCommunities.checkUpdateCommunitySuccess();

    if (ok) {
      const finalData = scenarioData.toRecord();
      finalData['StatusCommunity'] = 'CommunityEdited';
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, finalData);
      console.log('[EditCommunitiesSteps] Estado actualizado a "CommunityEdited" en la BD.');
    }
  }
);
