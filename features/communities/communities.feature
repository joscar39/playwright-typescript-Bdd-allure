@Communities @regression
Feature: Comunidades

  Background:
    Given un usuario superadmin se encuentra loggeado en CF
    And el usuario superadmin se encuentra en el modulo comunidades

  @SearchCommunityByNameSuccess
  Scenario Outline: Buscar comunidad por nombre
    Given se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    When Ingresa id de comunidad a buscar
    And Se pulsa boton filtrar
    Then se muestra resultados exitosos de busqueda de comunidad

    @SearchCommunityByNameCC
    Examples: Chile
      | SheetBD       | StatusCommunity     |
      | ComunidadesCL | CommunityRegistered |

    @SearchCommunityByNameSC
    Examples: Mexico
      | SheetBD       | StatusCommunity     |
      | ComunidadesMX | CommunityRegistered |


  @GoToEditCommunitySuccess
  Scenario Outline: Acceder a editar Comunidad
    Given se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    When Ingresa id de comunidad a buscar
    And Se pulsa boton filtrar
    And Se pulsar el boton de accion Editar Comunidad
    Then se muestra redireccion exitosa al modulo de edicion de comunidad

    @GoToEditCommunityCC
    Examples: Chile
      | SheetBD       | StatusCommunity     |
      | ComunidadesCL | CommunityRegistered |

    @GoToEditCommunitySC
    Examples: Mexico
      | SheetBD       | StatusCommunity     |
      | ComunidadesMX | CommunityRegistered |


  @GoToViewCommunitySuccess
  Scenario Outline: Acceder a ver una Comunidad
    Given se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    When Ingresa id de comunidad a buscar
    And Se pulsa boton filtrar
    And Se pulsar el boton de accion visualizar Comunidad
    Then se muestra redireccion exitosa al modulo de ver comunidad

    @GoToViewCommunityCC
    Examples: Chile
      | SheetBD       | StatusCommunity     |
      | ComunidadesCL | CommunityRegistered |

    @GoToViewCommunitySC
    Examples: Mexico
      | SheetBD       | StatusCommunity     |
      | ComunidadesMX | CommunityRegistered |

  # Este es un escenario que aun no se estara utilizando, pero se integrara a futuro
  @ImpersonateAdminSuccess
  Scenario Outline: Impersonar Administrador en una comunidad exitosamente por primera vez
    Given se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    When Ingresa id de comunidad a buscar
    And Se pulsa boton filtrar
    And Se pulsar el boton de accion impersonar administrador
    And se muestra redireccion hacia pantalla de terminos y condiciones
    Then Se redirecciona a la pantalla de mis comunidades

    @ImpersonateAdminIntoCommunityCC
    Examples: Chile
      | SheetBD       | StatusCommunity|
      | ComunidadesCL | AdminRecurring  |

    @ImpersonateAdminIntoCommunitySC
    Examples: Mexico
      | SheetBD       | StatusCommunity|
      | ComunidadesMX | AdminRecurring  |
