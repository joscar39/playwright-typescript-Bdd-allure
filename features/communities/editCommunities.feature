@EditCommunities
Feature: Editar Comunidades

  @EditCommunityDataBankSuccess
  Scenario Outline: Editar Comunidad de forma exitosa
    Given un usuario superadmin se encuentra loggeado en CF
    And el usuario superadmin se encuentra en el modulo comunidades
    And se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    And el usuario superadmin accede al modulo editar comunidades
    When el usuario superadmin activa permisos temporales en la vista
    And Se ingresa imagen de la comunidad
    And Ingresa logo de la administracion
    And Se modifica datos bancarios para la comunidad segun la region
    Then se muestra mensaje de comunidad actualiza con exito

    @EditCommunityDataBankCC
    Examples: Chile
      | SheetBD       | StatusCommunity     |
      | ComunidadesCL | CommunityRegistered |

    @EditCommunityDataBankSC
    Examples: Mexico
      | SheetBD       | StatusCommunity     |
      | ComunidadesMX | CommunityRegistered |
