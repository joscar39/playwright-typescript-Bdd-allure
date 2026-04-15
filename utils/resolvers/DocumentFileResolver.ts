/**
 * @file DocumentFileResolver.ts
 * @description Resuelve la ruta absoluta de archivos Excel de importación
 * según el tipo de documento y el tipo de comunidad (CC o SC).
 *
 * Para agregar un nuevo tipo: añadir la entrada en el mapa correspondiente
 * con la clave en minúsculas y el nombre exacto del archivo.
 * Total de opciones disponibles en el importador: 21.
 */
import path from 'path';

export type CommunityType = 'CC' | 'SC';

const FILES_DIR = path.join(process.cwd(), 'test-data', 'files', '{documents,imagen}');

const DOCUMENT_FILES: Readonly<Record<CommunityType, Record<string, string>>> = {
  CC: {
    'copropietarios': 'Plantilla Propiedades Comunidad CC.xlsx',
    'saldos':         'Plantilla Saldos Comunidades CC.xlsx',
    // Agregar los tipos CC restantes cuando se implementen
  },
  SC: {
    'copropietarios': 'Plantilla Propiedades Comunidad SC.xlsx',
    'saldos': 'Plantilla Propiedades Comunidad SC.xlsx',
    'cargos':'Plantilla Cargos Comunidad SC.xlsx',
    // Agregar los tipos SC restantes cuando se implementen
  },
};

export class DocumentFileResolver {
  /**
   * Retorna la ruta absoluta del archivo Excel para el tipo de documento
   * y tipo de comunidad indicados.
   * @param typeDocument - Tipo de documento (ej: 'copropietarios', 'saldos').
   * @param communityType - Tipo de comunidad: 'CC' (Chile) o 'SC' (México).
   */
  static resolve(typeDocument: string, communityType: CommunityType): string {
    const key = typeDocument.toLowerCase();
    const map = DOCUMENT_FILES[communityType];
    const fileName = map[key];

    if (!fileName) {
      const available = Object.keys(map).join(', ');
      throw new Error(
        `Tipo de documento no reconocido: "${typeDocument}" para comunidad ${communityType}. ` +
        `Disponibles: ${available}`
      );
    }

    return path.join(FILES_DIR, fileName);
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/resolvers/DocumentFileResolver.ts
if (require.main === module) {
  console.log('[CC] copropietarios →', DocumentFileResolver.resolve('copropietarios', 'CC'));
  console.log('[CC] saldos         →', DocumentFileResolver.resolve('saldos', 'CC'));
  console.log('[SC] copropietarios →', DocumentFileResolver.resolve('copropietarios', 'SC'));
  try {
    DocumentFileResolver.resolve('invalido', 'CC');
  } catch (err) {
    console.error('[ERROR esperado]', (err as Error).message);
  }
}
