@ViewCommunity
Feature: Ver Comunidad

  @SetNewAdminSuccess
  Scenario Outline: Configurar nuevo administrador en una comunidad
    Given un usuario superadmin se encuentra loggeado en CF
    And el usuario superadmin se encuentra en el modulo comunidades
    And se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    And el usuario superadmin accede al modulo ver comunidades
    When el usuario superadmin activa permisos temporales en la vista
    And llena datos del adminsitrador a asignar a la comunidad
    And Se pulsa el boton asignar administrador
    Then Se valida la asignacion correcta de administrador para la comunidad

    @SetNewAdminCC
    Examples: Chile
      | SheetBD       | StatusCommunity  |
      | ComunidadesCL | CommunityEdited  |

    @SetNewAdminSC
    Examples: Mexico
      | SheetBD       | StatusCommunity   |
      | ComunidadesMX | CommunityEdited   |

  @SetFileToCommunityCC
  Scenario Outline: Asignar documentos a una comunidad CC
    Given un usuario superadmin se encuentra loggeado en CF
    And el usuario superadmin se encuentra en el modulo comunidades
    And se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
    And el usuario superadmin accede al modulo ver comunidades
    When el usuario carga, valida y registra documento de "copropietarios" para comunidad CC
    And el usuario carga, valida y registra documento de "saldos" para comunidad CC
    Then se muestran los registros de propiedades exitosamente
    And se muestran los registros de saldos correctamente y se actualiza la BD

    Examples: Chile
      | SheetBD       | StatusCommunity     |
      | ComunidadesCL | AdminAssigned |

#   @SetFileToCommunitySC
#   Scenario Outline: Asignar documentos a una comunidad SC
#     Given un usuario superadmin se encuentra loggeado en CF
#     And el usuario superadmin se encuentra en el modulo comunidades
#     And se leen y extraen los datos de pruebas desde la BD: "<SheetBD>", con status: "<StatusCommunity>"
#     And el usuario superadmin accede al modulo ver comunidades
#     When el usuario carga, valida y registra documento de "copropietarios" para comunidad SC
#     And el usuario carga, valida y registra documento de "saldos" para comunidad SC
#     And el usuario carga, valida y registra documento de "cargos" para comunidad SC
#     Then se muestran los registros de cargos exitosamente
#     And se muestran los registros de propiedades exitosamente
#     And se muestran los registros de saldos correctamente y se actualiza la BD
#
#     Examples: Mexico
#       | SheetBD       | StatusCommunity     |
#       | ComunidadesMX | AdminAssigned  |