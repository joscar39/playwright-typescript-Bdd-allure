/**
 * @file viewCommunity.steps.ts
 * @description Step definitions para el feature de vista de comunidad y asignación de administrador.
 */
import { Given, When, Then } from '@support/fixtures';
import { GoogleSheetsService } from '@utils/services/GoogleSheetsService';

// Claves para datos temporales entre steps (extras reemplaza this[KEY] del World)
const RESULT_PROPERTIES  = '_properties_result';
const COMMUNITY_TYPE_KEY = '_community_type';


// =============================================================================
// PASOS DE VER COMUNIDAD
// =============================================================================

Given(
  'el usuario superadmin accede al modulo ver comunidades',
  async ({ app, scenarioData }) => {
    const name = scenarioData.dataMap.get('NameCommunity') ?? '';
    const id   = scenarioData.dataMap.get('IdCommunity') ?? '';
    await app.communities.insertIdCommunityInInputSearch(id);
    await app.communities.clickOnButtonSearch();
    await app.communities.checkIsCommunityIsVisibleOnResults(name, id);
    await app.communities.clickOnButtonViewComm();
    await app.communities.checkRedirectionViewCommPage(name, id);
  }
);

When(
  'llena datos del adminsitrador a asignar a la comunidad',
  async ({ app, scenarioData }) => {
    await app.viewCommunity.fillFormToAssignAdminToCommunity(scenarioData.dataMap);
  }
);

When(
  'Se pulsa el boton asignar administrador',
  async ({ app }) => {
    await app.viewCommunity.clickButtonSaveAssignAdmin();
  }
);

Then(
  'Se valida la asignacion correcta de administrador para la comunidad',
  async ({ app, scenarioData }) => {
    const ok = await app.viewCommunity.checkCommunityAdminAssignedSuccess();

    if (ok) {
      const finalData = scenarioData.toRecord();
      finalData['StatusCommunity'] = 'AdminAssigned';
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, finalData);
      console.log('[ViewCommunitySteps] Estado actualizado a "AdminAssigned" en la BD.');
    }
  }
);

// =============================================================================
// PASOS DE CARGAR DOCUMENTOS
// =============================================================================

When(
  'el usuario carga, valida y registra documento de {string} para comunidad CC',
  async ({ app, scenarioData }, typeDocument: string) => {
    scenarioData.extras.set(COMMUNITY_TYPE_KEY, 'CC');
    await app.viewCommunity.selectTypeDocumentSubmit(typeDocument);
    await app.viewCommunity.sendFileToUpload(typeDocument, 'CC');
    await app.viewCommunity.clickSubmitImport();
    await app.viewCommunity.checkPreviewData();
    await app.viewCommunity.clickButtonNext();
    await app.viewCommunity.waitForImportProcess();
  }
);

When(
  'el usuario carga, valida y registra documento de {string} para comunidad SC',
  async ({ app, scenarioData }, typeDocument: string) => {
    scenarioData.extras.set(COMMUNITY_TYPE_KEY, 'SC');
    await app.viewCommunity.selectTypeDocumentSubmit(typeDocument);
    await app.viewCommunity.sendFileToUpload(typeDocument, 'SC');
    await app.viewCommunity.clickSubmitImport();
    await app.viewCommunity.checkPreviewData();
    await app.viewCommunity.clickButtonNext();
    await app.viewCommunity.waitForImportProcess();
  }
);

Then(
  'se muestran los registros de propiedades exitosamente',
  async ({ app, scenarioData }) => {
    const communityType = scenarioData.extras.get(COMMUNITY_TYPE_KEY) as string;
    const communityName = scenarioData.dataMap.get('NameCommunity') ?? '';

    await app.homeAdminCommunity.navigateToPanelAdmin();
    await app.homeAdminCommunity.goIntoResidentsModule();
    await app.residentModuleAdmin.checkRedirectionToResidentPageSuccess();

    const propertiesOk = await app.residentModuleAdmin.checkDataPropertiesIsCorrect(communityType);

    await app.residentModuleAdmin.goToPropertiesModule();
    await app.residentPropertiesAdmin.checkRedirectionToPropertiesPageSuccess(communityName);

    scenarioData.extras.set(RESULT_PROPERTIES, propertiesOk);
  }
);

Then(
  'se muestran los registros de saldos correctamente y se actualiza la BD',
  async ({ app, scenarioData }) => {
    const communityType  = scenarioData.extras.get(COMMUNITY_TYPE_KEY) as string;
    const propertiesOk   = scenarioData.extras.get(RESULT_PROPERTIES) as boolean;

    const apportionmentOk = await app.residentPropertiesAdmin.checkDataApportionmentCCIsCorrect(communityType);
    const balancesOk      = await app.residentPropertiesAdmin.checkDataBalanceCCIsCorrect(communityType);

    if (propertiesOk && apportionmentOk && balancesOk) {
      const finalData = scenarioData.toRecord();
      finalData['StatusCommunity'] = 'AdminAndDocumentReady';
      await GoogleSheetsService.updateOrSaveData(scenarioData.sheetName, finalData);
      console.log('[ViewCommunitySteps] Estado actualizado a "AdminAndDocumentReady" en la BD.');
    }
  }
);
