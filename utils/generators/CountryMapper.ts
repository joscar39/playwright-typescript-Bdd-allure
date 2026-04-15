// noinspection JSNonASCIINames
/**
 * @file CountryMapper.ts
 * @description Mapea nombres de regiones/países a sus códigos ISO para
 * el selector de país en el formulario de comunidades.
 *
 * Equivalente a CountryMapper.java del proyecto Selenium.
 *
 * @example
 * const code = CountryMapper.getCode('Chile');
 * // => "CL"
 *
 * const code = CountryMapper.getCode('Mexico');
 * // => "MX"
 */
export class CountryMapper {
  private static readonly MAP: Readonly<Record<string, string>> = {
    chile:   'CL',
    méxico:  'MX',
    mexico:  'MX',
  };

  /**
   * Retorna el código ISO del país a partir del nombre de la región.
   * La comparación es insensible a mayúsculas y tildes.
   *
   * @param region - Nombre del país o región.
   * @returns Código ISO de 2 letras (ej: "CL", "MX").
   * @throws Error si el país no está soportado.
   */
  static getCode(region: string): string {
    const key = region.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const code = this.MAP[key];

    if (!code) {
      throw new Error(
        `País no soportado: "${region}". ` +
        `Países disponibles: ${Object.keys(this.MAP).join(', ')}`
      );
    }

    return code;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/CountryMapper.ts
if (require.main === module) {
  console.log('=== CountryMapper ===');

  console.log('Chile ->', CountryMapper.getCode('Chile'));
  console.log('Mexico ->', CountryMapper.getCode('Mexico'));
  console.log('México (con tilde) ->', CountryMapper.getCode('México'));

  try {
    CountryMapper.getCode('Argentina');
  } catch (e) {
    console.log('Error esperado:', (e as Error).message);
  }
}
