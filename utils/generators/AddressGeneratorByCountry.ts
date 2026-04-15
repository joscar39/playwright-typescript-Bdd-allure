/**
 * @file AddressGeneratorByCountry.ts
 * @description Generador de direcciones por país para los formularios de prueba.
 * Soporta direcciones para Chile y México, e incluye generación de
 * códigos postales para México.
 *
 * Equivalente a AddressGeneratorByCountry.java del proyecto Selenium.
 *
 * @example
 * const addr = AddressGeneratorByCountry.generateAddress('Chile');
 * // => "Viña del Mar Chile"
 *
 * const cp = AddressGeneratorByCountry.createZipCodeMexico('Ciudad de México CDMX Mexico');
 * // => "01345"
 */
export class AddressGeneratorByCountry {
  private static readonly CHILE_ADDRESSES: readonly string[] = [
    'Santiago Metropolitan Region Chile',
    'Bellavista Providencia Chile',
    'Viña del Mar Chile',
    'Cañete Chile',
    'Lago Ranco Chile',
  ];

  private static readonly MEXICO_ADDRESSES: readonly string[] = [
    'Ciudad de México CDMX Mexico',
    'San Luis Potosi Mexico',
  ];

  /** Prefijos de CP por estado mexicano */
  private static readonly PREFIJOS_CP_MEXICO: Readonly<Record<string, string[]>> = {
    CDMX:          ['01', '03', '06', '11'],
    Jalisco:       ['44', '45'],
    'Nuevo Leon':  ['64', '66'],
    'State of Mexico': ['50', '55'],
    Oaxaca:        ['68', '71'],
  };

  /**
   * Genera una dirección aleatoria según el país proporcionado.
   *
   * @param region - "Chile" o "Mexico" (case-insensitive).
   * @returns Dirección aleatoria del listado correspondiente.
   */
  static generateAddress(region: string): string {
    const normalizedRegion = region.toLowerCase();

    if (normalizedRegion === 'chile') {
      return this.CHILE_ADDRESSES[
        Math.floor(Math.random() * this.CHILE_ADDRESSES.length)
      ];
    }

    if (normalizedRegion === 'mexico' || normalizedRegion === 'méxico') {
      return this.MEXICO_ADDRESSES[
        Math.floor(Math.random() * this.MEXICO_ADDRESSES.length)
      ];
    }

    return `ERROR: Región no soportada (${region})`;
  }

  /**
   * Crea un código postal de México basado en el estado presente en la dirección.
   *
   * @param addressCity - Dirección generada por generateAddress().
   * @returns Código postal de 5 dígitos como string.
   */
  static createZipCodeMexico(addressCity: string): string {
    if (addressCity.includes('ERROR') || addressCity.includes('Chile')) {
      return '';
    }

    let prefix = '01'; // Default CDMX

    for (const [state, prefixes] of Object.entries(this.PREFIJOS_CP_MEXICO)) {
      if (addressCity.includes(state)) {
        prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        break;
      }
    }

    const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}${suffix}`;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/AddressGeneratorByCountry.ts
if (require.main === module) {
  console.log('=== AddressGeneratorByCountry ===');

  const chileAddr = AddressGeneratorByCountry.generateAddress('Chile');
  console.log('Chile:', chileAddr);

  const mexicoAddr = AddressGeneratorByCountry.generateAddress('Mexico');
  console.log('Mexico:', mexicoAddr);
  console.log('ZIP Mexico:', AddressGeneratorByCountry.createZipCodeMexico(mexicoAddr));

  console.log('País no soportado:', AddressGeneratorByCountry.generateAddress('Argentina'));
}
