@Login
Feature: Login

  Background:
    Given la aplicación está inicializada y en la pantalla de login

  @LoginSuperAdminSuccess
  Scenario: Login como superadmin exitosamente
    #Escenario: Login como superadmin exitosamente
    When Se ingresas las credenciales como superadmin
    Then Se redireccionar al home como superadmin exitosamente

  @LoginAdminFirstTimeSuccess
  Scenario Outline: Login como administrador por primera vez
    #Escenario: Login como administrador por primera vez
    Given se leen los datos de la BD para acceder como admin: "<SheetBD>" con status: "<StatusCommunity>"
    When Se ingresas las credenciales de usuario admin de una comunidad
    And se muestra redireccion hacia pantalla de terminos y condiciones
    And Se debe configurar contraseña nueva como admin
    Then Se redirecciona a la pantalla de mis comunidades

    @LoginAdminFirstTimeCC
    Examples: Chile
      | SheetBD       |    StatusCommunity     |
      | ComunidadesCL | AdminAndDocumentReady  |

    @LoginAdminFirstTimeSC
    Examples: Mexico
      | SheetBD       |     StatusCommunity   |
      | ComunidadesMX | AdminAndDocumentReady |
