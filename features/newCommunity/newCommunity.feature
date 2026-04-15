@CreateCommunity @suiteInvoice
Feature: Crear Nuevas Comunidades

  @CreateNewCommunityNormal
  Scenario Outline: Crear nueva comunidad normal
    Given un usuario superadmin se encuentra loggeado en CF
    And el usuario ingresa al modulo nueva comunidad normal desde el sidebar
    When llenar formulario de creacion de nueva comunidad normal de tipo: "<TypeCommunity>" en la region: "<RegionCommunity>"
    Then se muestra el mensaje de confirmacion de cuenta creada
    And se muestra el Id y nombre de la comunidad creada
    And Se almacenan los datos registrados en la BD: "<SheetBD>"

    @CreateNewCommunityNormalCC
    Examples: Chile
      | TypeCommunity | RegionCommunity | SheetBD       |
      | CC            | Chile           | ComunidadesCL |

    @CreateNewCommunityNormalSC
    Examples: Mexico
      | TypeCommunity | RegionCommunity | SheetBD       |
      | SC            | Mexico          | ComunidadesMX |
