/**
 * @file RutGenerator.ts
 * @description Generador de RUTs chilenos válidos con dígito verificador.
 * Utiliza el algoritmo Módulo 11 para calcular el dígito verificador,
 * idéntico al estándar del SII (Servicio de Impuestos Internos de Chile).
 *
 * Equivalente a RutGenerator.java del proyecto Selenium.
 *
 * @example
 * const rutFormateado = RutGenerator.generateRandomRut(true);
 * // => "12.345.678-5"
 *
 * const rutSinFormato = RutGenerator.generateRandomRut(false);
 * // => "123456785"
 */
export class RutGenerator {
  /**
   * Genera un RUT chileno aleatorio válido con su dígito verificador.
   *
   * @param formatted - Si es true retorna formato con puntos y guion (ej: 12.345.678-5),
   *                    si es false retorna solo números (ej: 123456785).
   * @returns RUT generado como string.
   */
  static generateRandomRut(formatted: boolean): string {
    // Rango común de RUTs actuales: entre 10 y 25 millones
    const numero = 10_000_000 + Math.floor(Math.random() * 15_000_000);
    const dv = this.calculateDV(numero);

    if (formatted) {
      return `${numero.toLocaleString('es-CL')}-${dv}`;
    }
    return `${numero}${dv}`;
  }

  /**
   * Calcula el dígito verificador de un RUT usando el algoritmo Módulo 11.
   *
   * @param rut - Número base del RUT (sin dígito verificador).
   * @returns Dígito verificador como string (puede ser '0'-'9' o 'K').
   */
  private static calculateDV(rut: number): string {
    let m = 0;
    let s = 1;
    let t = rut;

    for (; t !== 0; t = Math.floor(t / 10)) {
      s = (s + (t % 10) * (9 - (m++ % 6))) % 11;
    }

    // Si s = 0 => dígito es 'K' (código ASCII 75), de lo contrario es s + '0' (ASCII 48)
    const dvChar = s !== 0 ? String.fromCharCode(s + 47) : 'K';
    return dvChar;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/RutGenerator.ts
if (require.main === module) {
  console.log('=== RutGenerator ===');

  for (let i = 0; i < 5; i++) {
    console.log('Formateado:', RutGenerator.generateRandomRut(true));
    console.log('Sin formato:', RutGenerator.generateRandomRut(false));
    console.log('---');
  }
}
