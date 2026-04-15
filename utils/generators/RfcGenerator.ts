/**
 * @file RfcGenerator.ts
 * @description Generador de RFC (Registro Federal de Contribuyentes) para México.
 * Genera un RFC simulado para persona física con la estructura:
 * [4 letras][6 dígitos de fecha YYMMDD][3 caracteres homoclave]
 *
 * Equivalente a RfcGenerator.java del proyecto Selenium.
 *
 * @example
 * const rfc = RfcGenerator.generateRandomRfc();
 * // => "ABCD900205XYZ"
 */
export class RfcGenerator {
  private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  /**
   * Genera un RFC aleatorio válido para persona física.
   *
   * Estructura:
   * - 4 letras (iniciales de nombre y apellidos)
   * - 6 dígitos de fecha de nacimiento (YYMMDD)
   * - 3 caracteres alfanuméricos (homoclave)
   *
   * @returns RFC generado en mayúsculas.
   */
  static generateRandomRfc(): string {
    const letters = this.generateRandomLetters(4);
    const datePart = this.generateBirthDatePart();
    const homoclave = this.generateAlphanumeric(3);

    return `${letters}${datePart}${homoclave}`.toUpperCase();
  }

  /**
   * Genera N letras aleatorias del alfabeto.
   * @param count - Número de letras a generar.
   */
  private static generateRandomLetters(count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += this.ALPHABET[Math.floor(Math.random() * this.ALPHABET.length)];
    }
    return result;
  }

  /**
   * Genera la parte de fecha de nacimiento simulada (YYMMDD).
   * Edad simulada entre 18 y 60 años.
   */
  private static generateBirthDatePart(): string {
    const yearsToSubtract = 18 + Math.floor(Math.random() * 42);
    const daysToSubtract = Math.floor(Math.random() * 365);

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - yearsToSubtract);
    birthDate.setDate(birthDate.getDate() - daysToSubtract);

    const yy = String(birthDate.getFullYear()).slice(-2);
    const mm = String(birthDate.getMonth() + 1).padStart(2, '0');
    const dd = String(birthDate.getDate()).padStart(2, '0');

    return `${yy}${mm}${dd}`;
  }

  /**
   * Genera N caracteres alfanuméricos aleatorios.
   * @param count - Número de caracteres a generar.
   */
  private static generateAlphanumeric(count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += this.ALPHANUMERIC[Math.floor(Math.random() * this.ALPHANUMERIC.length)];
    }
    return result;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/RfcGenerator.ts
if (require.main === module) {
  console.log('=== RfcGenerator ===');

  for (let i = 0; i < 5; i++) {
    console.log('RFC:', RfcGenerator.generateRandomRfc());
  }
}
