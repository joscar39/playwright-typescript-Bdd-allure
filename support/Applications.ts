/**
 * @file Applications.ts
 * @description Contenedor de todos los page objects del framework.
 * Centraliza la instanciación de páginas y las proporciona como propiedades
 * de fácil acceso desde los steps.
 *
 * Equivalente a Applications.java del proyecto Selenium.
 *
 * @example
 * // En TestContext:
 * const app = new Applications(page);
 * await app.login.checkRedirectionToLoginPage();
 * await app.home.goIntoModuleCreateNormalCommunity();
 */
import { Page } from '@playwright/test';
import { LoginPage } from '@pages/Login.page';
import { HomePage } from '@pages/Home.page';
import { CommunitiesPage } from '@pages/Communities.page';
import { EditCommunitiesPage } from '@pages/EditCommunities.page';
import { ViewCommunityPage } from '@pages/ViewCommunity.page';
import { NewCommunityPage } from '@pages/NewCommunity.page';
import { HomeAdminCommunityPage } from '@pages/HomeAdminCommunity.page';
import { ResidentModuleAdminPage } from '@pages/ResidentModuleAdmin.page';
import { ResidentPropertiesAdminPage } from '@pages/ResidentPropertiesAdmin.page';

export class Applications {
  /** Página de Login */
  public readonly login: LoginPage;

  /** Dashboard y sidebar de navegación */
  public readonly home: HomePage;

  /** Listado de comunidades */
  public readonly communities: CommunitiesPage;

  /** Edición de comunidad */
  public readonly editCommunities: EditCommunitiesPage;

  /** Vista de detalle de comunidad */
  public readonly viewCommunity: ViewCommunityPage;

  /** Creación de nueva comunidad normal (formulario 2 pasos) */
  public readonly newCommunity: NewCommunityPage;

  /** Dashboard y sidebar del administrador de comunidad */
  public readonly homeAdminCommunity: HomeAdminCommunityPage;

  /** Módulo de Residentes (admin comunidad) */
  public readonly residentModuleAdmin: ResidentModuleAdminPage;

  /** Módulo de Unidades/Propiedades (admin comunidad) */
  public readonly residentPropertiesAdmin: ResidentPropertiesAdminPage;

  /**
   * Crea todas las instancias de páginas con la misma instancia de Page.
   *
   * @param page - Instancia activa de Playwright Page.
   */
  constructor(page: Page) {
    this.login = new LoginPage(page);
    this.home = new HomePage(page);
    this.communities = new CommunitiesPage(page);
    this.editCommunities = new EditCommunitiesPage(page);
    this.viewCommunity = new ViewCommunityPage(page);
    this.newCommunity = new NewCommunityPage(page);
    this.homeAdminCommunity = new HomeAdminCommunityPage(page);
    this.residentModuleAdmin = new ResidentModuleAdminPage(page);
    this.residentPropertiesAdmin = new ResidentPropertiesAdminPage(page);
  }
}
