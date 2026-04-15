# Importante
- [ ] He leído y confirmo que:
  - Se siguen las reglas del framework definidas en [`CLAUDE.md`](../CLAUDE.md).
  - Todo selector nuevo está en su archivo de locators correspondiente (`*.locators.ts`), no inline.
  - Todo Page Object nuevo extiende `BasePage` con el formato obligatorio de acciones (console.log + try/catch).
  - No se usa `waitForTimeout()` salvo en los casos documentados (polling de importación asíncrona o componentes custom).
  - No hay `try/catch` en specs ni en flows.
  - Si se agregaron helpers, incluyen bloque `require.main === module` para validación aislada.

## Breaking changes
> Eliminar esta sección si no hay cambios riesgosos

Cambios que pueden afectar specs existentes. Ej:
1. Se modificó un locator compartido en `CommonLocators.ts`.
2. Se renombró un método de un Page Object usado en múltiples specs.
3. Se cambió la firma de una función de flow.

## Resumen

Acá va el resumen del trabajo realizado. Debe ser claro, **en español**, preciso, incluir imágenes o videos si es necesario, y **sin errores ortográficos**.

## Desarrollo

Acá se describe el trabajo para que los reviewers sepan en qué enfocarse.

- Specs afectados:
- Page Objects creados/modificados:
- Locators creados/modificados:
- Flows creados/modificados:

## Jira

[ID de la tarjeta](Insertar link)

## Video
> Eliminar esta sección si no hay video

[Video](Insertar link)
