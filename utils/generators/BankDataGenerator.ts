/**
 * @file BankDataGenerator.ts
 * @description Generador de datos bancarios aleatorios para los tests de automatización.
 * Proporciona nombres de bancos, números de cuenta y detalles completos.
 *
 * Equivalente a BankDataGenerator.java del proyecto Selenium.
 *
 * @example
 * const banco = BankDataGenerator.getRandomBankName();
 * // => "Banco Santander"
 *
 * const cuenta = BankDataGenerator.generateAccountNumber(10);
 * // => "4523187690"
 */
export class BankDataGenerator {
  private static readonly BANKS: readonly string[] = [
    'Banco Santander',
    'Banco de Chile',
    'Banco Estado',
    'BCI',
    'Scotiabank',
    'Itaú',
    'Banco Falabella',
    'Banco Provincial',
    'Banco Banesco',
    'Banco Nacional de Credito',
    'Banco BBVA',
  ];

  /**
   * Retorna un nombre de banco aleatorio de la lista predefinida.
   * @returns Nombre del banco seleccionado.
   */
  static getRandomBankName(): string {
    return this.BANKS[Math.floor(Math.random() * this.BANKS.length)];
  }

  /**
   * Genera un número de cuenta bancaria de longitud específica.
   * @param length - Cantidad de dígitos del número de cuenta.
   * @returns Número de cuenta como string numérico.
   */
  static generateAccountNumber(length: number): string {
    let number = '';
    for (let i = 0; i < length; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    return number;
  }

  /**
   * Retorna un string completo con banco y número de cuenta.
   * @returns String con formato "Banco - N° XXXXXXXXXXXX".
   */
  static getFullBankDetails(): string {
    return `${this.getRandomBankName()} - N° ${this.generateAccountNumber(12)}`;
  }
}

// ── local test ────────────────────────────────────────────────────────────────
// Ejecutar: npx tsx utils/generators/BankDataGenerator.ts
if (require.main === module) {
  console.log('=== BankDataGenerator ===');

  for (let i = 0; i < 5; i++) {
    console.log('Banco:', BankDataGenerator.getRandomBankName());
    console.log('Cuenta (10 dígitos):', BankDataGenerator.generateAccountNumber(10));
    console.log('Detalle completo:', BankDataGenerator.getFullBankDetails());
    console.log('---');
  }
}
