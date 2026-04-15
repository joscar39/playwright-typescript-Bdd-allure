/**
 * @file AdministratorPublicGenerator.ts
 * @description Generador de nombres y correos de administradores públicos o entidades legales.
 * Genera nombres realistas como "Consorcio Alborada", "Gerente Juan" o "Alborada Compañia".
 *
 * Equivalente a AdministratorPublicGenerator.java del proyecto Selenium.
 *
 * @example
 * const nombre = AdministratorPublicGenerator.publicNameGenerator();
 * // => "Consorcio Alborada"
 *
 * const email = AdministratorPublicGenerator.corporateEmailGenerator(nombre);
 * // => "consorcioalborada42@yopmail.com"
 */
export class AdministratorPublicGenerator {
  private static readonly INDIVIDUAL_NAMES: readonly string[] = [
    'Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia',
    'Diego', 'Elena', 'Javier', 'Carmen', 'Daniel', 'Paula',
  ];

  private static readonly ENTITY_NAMES: readonly string[] = [
    'Alborada', 'Central', 'Norte', 'Sur', 'Pacifico', 'Andina', 'ProGest',
    'Urbania', 'Siglo XXI', 'Horizonte', 'Patrimonial', 'Integral', 'Bravo',
  ];

  private static readonly ORGANIZATIONS: readonly string[] = [
    'Buffete', 'Consorcio', 'Sociedad', 'Administraciones', 'Asociados',
    'Organizacion', 'Grupo', 'Consultores', 'Estudio',
  ];

  private static readonly KEYWORDS: readonly string[] = [
    'Administrador', 'Director', 'Gerente', 'Compañia', 'Sindicato', 'Gestor',
  ];

  private static readonly EMAIL_DOMAINS: readonly string[] = [
    'admin.com', 'gestioncf.cl', 'edificio.mx', 'comunidad.com', 'yopmail.com',
  ];

  /**
   * Genera un nombre de administrador público o entidad legal aleatoria.
   * Formatos posibles:
   * - Organización + Entidad (ej: "Consorcio Alborada")
   * - Cargo + Nombre individual (ej: "Gerente Juan")
   * - Entidad + Cargo (ej: "Alborada Compañia")
   *
   * @returns Nombre generado como string.
   */
  static publicNameGenerator(): string {
    const option = Math.floor(Math.random() * 3);
    const rand = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

    switch (option) {
      case 0:
        return `${rand(this.ORGANIZATIONS)} ${rand(this.ENTITY_NAMES)}`;
      case 1:
        return `${rand(this.KEYWORDS)} ${rand(this.INDIVIDUAL_NAMES)}`;
      case 2:
        return `${rand(this.ENTITY_NAMES)} ${rand(this.KEYWORDS)}`;
      default:
        return `${rand(this.ORGANIZATIONS)} ${rand(this.ENTITY_NAMES)}`;
    }
  }

  /**
   * Genera un correo corporativo basado en el nombre de la entidad.
   * Limpia tildes, espacios y caracteres especiales antes de construir el email.
   *
   * @param publicName - Nombre generado por publicNameGenerator().
   * @returns Email corporativo como string.
   */
  static corporateEmailGenerator(publicName: string): string {
    const cleanName = publicName
      .toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

    const num = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    const domain = this.EMAIL_DOMAINS[Math.floor(Math.random() * this.EMAIL_DOMAINS.length)];

    return `${cleanName}${num}@${domain}`;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/AdministratorPublicGenerator.ts
if (require.main === module) {
  console.log('=== AdministratorPublicGenerator ===');

  for (let i = 0; i < 5; i++) {
    const name = AdministratorPublicGenerator.publicNameGenerator();
    const email = AdministratorPublicGenerator.corporateEmailGenerator(name);
    console.log(`Nombre: ${name} | Email: ${email}`);
  }
}
