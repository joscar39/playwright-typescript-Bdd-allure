/**
 * @file PropertiesManager.ts
 * @description Gestión centralizada de configuración de URLs y propiedades de la aplicación.
 * Lee variables del archivo .env usando dotenv y construye las URLs del entorno dinámicamente.
 *
 * Equivalente a PropertiesManager.java + application.properties del proyecto Selenium.
 *
 * @example
 * const loginUrl = PropertiesManager.getLoginUrl();
 * // => "https://test5.comunidadfeliz.com"
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Entornos válidos de la plataforma ComunidadFeliz.
 */
const VALID_ENVIRONMENTS = [
  'admin', 'app', 'app2', 'smoke', 'saas', 'saas2',
  'test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7',
];

/** Base domain del entorno activo */
const BASE_DOMAIN = 'comunidadfeliz.com';

export class PropertiesManager {
  /**
   * Obtiene el nombre del entorno activo desde la variable ENV.
   * @throws Error si el entorno no es válido.
   */
  static getEnvironment(): string {
    const env = process.env.ENV;
    if (!env || !VALID_ENVIRONMENTS.includes(env)) {
      throw new Error(
        `Ambiente inválido o no definido: "${env}". ` +
        `Valores válidos: ${VALID_ENVIRONMENTS.join(', ')}`
      );
    }
    return env;
  }

  /**
   * Construye la URL base del entorno activo.
   * @example "https://test5.comunidadfeliz.com"
   */
  static getBaseUrl(): string {
    const env = this.getEnvironment();
    return `https://${env}.${BASE_DOMAIN}`;
  }

  /**
   * URL de la pantalla de login (raíz del entorno).
   * @example "https://test5.comunidadfeliz.com"
   */
  static getLoginUrl(): string {
    return this.getBaseUrl();
  }

  /**
   * URL del panel de administrador de comunidad.
   * @example "https://test5.comunidadfeliz.com/panel/administrador"
   */
  static getPanelAdminUrl(): string {
    return `${this.getBaseUrl()}/panel/administrador`;
  }

  /**
   * Nombre del archivo de Google Sheets que actúa como base de datos de pruebas.
   * @throws Error si la variable no está definida.
   */
  static getGoogleSheetsDatabaseName(): string {
    const dbName = process.env.GOOGLE_SHEETS_DB_NAME;
    if (!dbName || dbName.trim() === '') {
      throw new Error(
        'ERROR CRÍTICO: La variable GOOGLE_SHEETS_DB_NAME no está definida en .env. ' +
        'La ejecución se detendrá porque el nombre de la BD es obligatorio.'
      );
    }
    return dbName;
  }

  /**
   * Ruta al archivo JSON de credenciales de Google Service Account.
   * @throws Error si la variable no está definida.
   */
  static getGoogleCredentialsPath(): string {
    const credPath = process.env.GOOGLE_CREDENTIALS_PATH;
    if (!credPath || credPath.trim() === '') {
      throw new Error(
        'ERROR CRÍTICO: La variable GOOGLE_CREDENTIALS_PATH no está definida en .env.'
      );
    }
    return path.resolve(process.cwd(), credPath);
  }

  // -------------------------------------------------------------------------
  // Datos de pagos de prueba (equivalente a las propiedades Webpay/Kushki)
  // -------------------------------------------------------------------------

  static getWebpayCardNumber(): string { return '4051885600446623'; }
  static getWebpayCardOptional(): string { return '370000000002032'; }
  static getWebpayCcv(): string { return '123'; }
  static getWebpayCcvOptional(): string { return '1234'; }
  static getWebpayExpirationDate(): string { return '1230'; }
  static getTransBankRut(): string { return '11.111.111-1'; }
  static getTransBankPass(): string { return '123'; }

  static getKushkiCardNumber(): string { return '5451951574925480'; }
  static getKushkiExpirationDate(): string { return '1230'; }
  static getKushkiCcv(): string { return '123'; }
}
