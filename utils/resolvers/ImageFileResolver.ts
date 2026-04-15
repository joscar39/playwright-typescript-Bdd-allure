/**
 * @file ImageFileResolver.ts
 * @description Selecciona aleatoriamente una imagen de prueba disponible en disco
 * según la categoría indicada (comunidad o administración).
 */
import path from 'path';
import fs from 'fs';

export type ImageCategory = 'community' | 'admin';

const IMAGE_DIR = path.join(process.cwd(), 'test-data', 'files', '{documents,imagen}');

const IMAGE_FILES: Readonly<Record<ImageCategory, string[]>> = {
  community: [
    'urbanismo.jpeg',
    'Torre.jpeg',
    'apartamento.jpg',
    'condominio.jpg',
    'conjunto residencial.jpg',
  ],
  admin: [
    'Administracion uno.png',
    'Administracion dos.png',
    'Administracion tres.png',
    'Administracion cuatro.png',
    'Administracion cinco.png',
  ],
};

export class ImageFileResolver {
  /**
   * Retorna la ruta absoluta de una imagen aleatoria disponible en disco
   * para la categoría indicada.
   * @param category - Categoría de imagen: 'community' o 'admin'.
   */
  static resolveRandom(category: ImageCategory): string {
    const list = IMAGE_FILES[category];
    const shuffled = [...list].sort(() => Math.random() - 0.5);

    for (const fileName of shuffled) {
      const fullPath = path.join(IMAGE_DIR, path.basename(fileName));
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    throw new Error(
      `No se encontró ningún archivo de imagen válido en: ${IMAGE_DIR}. ` +
      `Archivos esperados: [${list.join(', ')}]`
    );
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/resolvers/ImageFileResolver.ts
if (require.main === module) {
  console.log('[community] →', ImageFileResolver.resolveRandom('community'));
  console.log('[admin]     →', ImageFileResolver.resolveRandom('admin'));
}
