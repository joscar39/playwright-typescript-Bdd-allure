---
paths:
  - "utils/**/*.ts"
---

# Estándar de utils

## Qué va en utils

Toda lógica que no sea interacción con la UI ni orquestación de steps pertenece a `utils/`:

- Resolución de rutas de archivos de test-data (mapas tipo→archivo, selección aleatoria)
- Generación de datos (RUT, RFC, direcciones, datos bancarios)
- Lectura/escritura de archivos (Excel, imágenes)
- Llamadas a servicios externos (Google Sheets API)

```typescript
// INCORRECTO — lógica de resolución de archivos en el step
const IMAGES = ['Torre.jpeg', 'urbanismo.jpeg'];
function getRandomImage(list: string[]): string { ... }

When('Se ingresa imagen', async ({ app }) => {
  const imgPath = getRandomImage(IMAGES);       // ← lógica que no es del step
  await app.editCommunities.insertImage(imgPath);
});

// CORRECTO — el step solo orquesta
When('Se ingresa imagen', async ({ app }) => {
  const imgPath = ImageFileResolver.resolveRandom('community');
  await app.editCommunities.insertImage(imgPath);
});
```

### Estructura de resolvers

Archivos que resuelven rutas o seleccionan datos de test van en `utils/resolvers/`:

```
utils/
  resolvers/
    DocumentFileResolver.ts   # tipo + país → ruta de Excel
    ImageFileResolver.ts      # categoría → ruta de imagen aleatoria
```

---

## Bloque `main` local

Todo archivo dentro de `utils/` **debe incluir** un bloque de ejecución local al final:

```typescript
// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/<ruta/archivo>.ts
if (require.main === module) {
  // Llamadas representativas de cada función pública del util
  console.log(MiUtil.metodo());
}
```

**Equivalente** al `public static void main(String[] args)` de Java/Selenium.

## Reglas del bloque `main`

- Siempre es el **último bloque** del archivo, después del cierre de clase/función.
- El comentario de encabezado incluye el comando exacto para ejecutarlo (`npx tsx ...`).
- Debe cubrir los **casos representativos** de cada método público (casos normales + error esperado si aplica).
- Para utils con dependencias externas (Google Sheets, .env), agregar un comentario `// Nota:` indicando los requisitos.
- Para utils async, el bloque usa IIFE: `(async () => { ... })();`
