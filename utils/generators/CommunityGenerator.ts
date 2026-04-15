/**
 * @file CommunityGenerator.ts
 * @description Generador de nombres y correos electrónicos de comunidades.
 * Los nombres siguen el patrón: "[TIPO] [USUARIO_QA] [NOMBRE_RANDOM] [PAÍS] Selenium [FECHA]"
 *
 * Equivalente a CommunityGenerator.java del proyecto Selenium.
 *
 * @example
 * const name = CommunityGenerator.communityNameGenerator('Chile', 'CC');
 * // => "CC joscar.sosa Don Ricardo CL Selenium 10-02-2026"
 *
 * const email = CommunityGenerator.communityEmailGenerator(name);
 * // => "admin.cc.donricardo88@yopmail.com"
 */
import { CredentialsManager } from '../../config/CredentialsManager';

export class CommunityGenerator {
  private static readonly NAMES: readonly string[] = [
    'Los Olivos', 'Vista Hermosa', 'Santa María', 'Don Ricardo', 'El Mirador',
    'Res. Oriente', 'Altos Mirandinos', 'San Francisco', 'La Arboleda', 'Bella Vista',
    'Pinares', 'Costa Azul', 'Los Fundadores', 'San Agustín', 'Portal Sol',
    'Villas Prado', 'Monte Verde', 'Los Castaños', 'Santa Elena', 'Río Claro',
    'Valle Nevado', 'Sierra Linda', 'Las Acacias', 'Camino Real', 'Altos Bosque',
    'Jardines Sur', 'Puerta Hierro', 'Lomas Sol', 'Brisa Marina', 'San Sebastián',
    'Mirador Lago', 'Hacienda Real', 'Praderas Chile', 'Los Alerces', 'Paseo Ribera',
    'San Valentín', 'Cerro Grande', 'Quinta Real', 'Los Robles', 'Montaña Azul',
    'Jardín Andes', 'Nueva Esperanza', 'Altamira', 'Palmar Lilas', 'San Jerónimo',
    'Piedra Blanca', 'Los Manantiales', 'Miraflores', 'Bosque Nativo', 'Valles Norte',
    'San Andrés', 'Tierra Santa', 'Agua Dulce', 'Cumbres Maipú', 'Portal Reina',
    'Rincón Valle', 'San Rodrigo', 'Los Copihues', 'Aurora Alba', 'Vía Seda',
  ];

  /**
   * Genera un nombre de comunidad basado en la región y tipo.
   * Formato: "[TIPO] [USUARIO_QA] [NOMBRE_RANDOM] [PAÍS] Selenium [DD-MM-YYYY]"
   *
   * @param region - "Chile" o "Mexico" (case-insensitive).
   * @param typeCommunity - "CC" (Con Control) o "SC" (Sin Control).
   * @returns Nombre de comunidad formateado.
   */
  static communityNameGenerator(region: string, typeCommunity: string): string {
    const userPrefix = this.getUserFromEnv();
    const name = this.NAMES[Math.floor(Math.random() * this.NAMES.length)];
    const datePart = this.getFormattedDate();

    const normalizedRegion = region.toLowerCase();

    switch (normalizedRegion) {
      case 'chile': {
        const type = typeCommunity.toUpperCase() === 'CC' ? 'CC' : 'SC';
        return `${type} ${userPrefix} ${name} CL Selenium ${datePart}`;
      }
      case 'mexico':
      case 'méxico':
        return `SC ${userPrefix} ${name} MX Selenium ${datePart}`;
      default:
        return `${userPrefix} ${name} ${datePart}`;
    }
  }

  /**
   * Genera el email de la comunidad a partir de su nombre completo.
   * Extrae el tipo (CC/SC) y la parte del nombre para construir el email.
   *
   * Ejemplo entrada: "CC joscar.sosa Don Ricardo CL Selenium 10-02-2026"
   * Resultado: "admin.cc.donricardo88@yopmail.com"
   *
   * @param communityName - Nombre generado por communityNameGenerator().
   * @returns Email de administración de la comunidad.
   */
  static communityEmailGenerator(communityName: string): string {
    const parts = communityName.toLowerCase().split(/\s+/);

    if (parts.length < 1) return 'admin.test@yopmail.com';

    const type = parts[0]; // "cc" o "sc"

    // Extraer el nombre de la comunidad (después del índice 2, antes de "cl"/"selenium"/fecha)
    const communityParts: string[] = [];
    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];
      if (part === 'cl' || part === 'mx' || part === 'selenium' || /\d{2}-\d{2}-\d{4}/.test(part)) {
        break;
      }
      communityParts.push(part);
    }

    let cleanName = communityParts.join('').replace(/[^a-z0-9]/g, '');
    if (cleanName === '') cleanName = 'comunidad';

    const randomNum = Math.floor(Math.random() * 99);
    return `admin.${type}.${cleanName}${randomNum}@yopmail.com`;
  }

  // ---------------------------------------------------------------------------
  // Métodos privados de soporte
  // ---------------------------------------------------------------------------

  /**
   * Extrae el nombre del QA desde la variable EMAIL del .env.
   * Ejemplo: "joscar.sosa@comunidadfeliz.cl" -> "joscar.sosa"
   */
  private static getUserFromEnv(): string {
    try {
      return CredentialsManager.getQaName();
    } catch {
      return 'Tester';
    }
  }

  /**
   * Retorna la fecha actual en formato "DD-MM-YYYY".
   */
  private static getFormattedDate(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/CommunityGenerator.ts
// Nota: requiere .env con la variable EMAIL configurada (si no, usa "Tester" como fallback)
if (require.main === module) {
  console.log('=== CommunityGenerator ===');

  const nameCL_CC = CommunityGenerator.communityNameGenerator('Chile', 'CC');
  console.log('Chile CC nombre:', nameCL_CC);
  console.log('Chile CC email:', CommunityGenerator.communityEmailGenerator(nameCL_CC));

  const nameCL_SC = CommunityGenerator.communityNameGenerator('Chile', 'SC');
  console.log('Chile SC nombre:', nameCL_SC);
  console.log('Chile SC email:', CommunityGenerator.communityEmailGenerator(nameCL_SC));

  const nameMX = CommunityGenerator.communityNameGenerator('Mexico', 'SC');
  console.log('Mexico nombre:', nameMX);
  console.log('Mexico email:', CommunityGenerator.communityEmailGenerator(nameMX));
}
