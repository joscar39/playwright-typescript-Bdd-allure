/**
 * @file CredentialsManager.ts
 * @description Gestión centralizada de credenciales de prueba.
 * Lee las credenciales primero desde .env y como fallback desde variables de entorno del sistema.
 *
 * Equivalente a CredentialsManager.java del proyecto Selenium.
 *
 * @example
 * const email = CredentialsManager.getEmail();
 * const pass = CredentialsManager.getPassword();
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class CredentialsManager {
  /**
   * Obtiene el email del usuario de automatización (superadmin).
   * @throws Error si no está definido en .env ni en variables de entorno.
   */
  static getEmail(): string {
    const value = process.env.EMAIL;
    if (!value) {
      throw new Error(
        'Credencial "EMAIL" no encontrada en .env ni en variables de entorno del sistema.'
      );
    }
    return value;
  }

  /**
   * Obtiene la contraseña del usuario de automatización (superadmin).
   * @throws Error si no está definida en .env ni en variables de entorno.
   */
  static getPassword(): string {
    const value = process.env.PASSWORD;
    if (!value) {
      throw new Error(
        'Credencial "PASSWORD" no encontrada en .env ni en variables de entorno del sistema.'
      );
    }
    return value;
  }

  /**
   * Obtiene la contraseña opcional (usada en flujos de Webpay/banco).
   * @returns Valor o cadena vacía si no está definida.
   */
  static getOptionalPassword(): string {
    return process.env.OPTIONAL_PASSWORD ?? '';
  }

  /**
   * Obtiene la contraseña de conexión bancaria.
   * @returns Valor o cadena vacía si no está definida.
   */
  static getBankConnectionPassword(): string {
    return process.env.BANK_CONNECTION ?? '';
  }

  /**
   * Contraseña inicial asignada al administrador de comunidad al crearlo.
   * Se usa en creación de comunidad y en el flujo de login como admin recurrente.
   * Configurable via ADMIN_INITIAL_PASSWORD en .env (default: 'Aa123456.').
   */
  static getAdminInitialPassword(): string {
    return process.env.ADMIN_INITIAL_PASSWORD ?? 'Aa123456.';
  }

  /**
   * Extrae el nombre del QA desde el email configurado.
   * Ejemplo: "joscar.sosa@comunidadfeliz.cl" -> "joscar.sosa"
   *
   * Se usa para el mecanismo de bloqueo de filas en Google Sheets:
   * StatusCommunity = "IN_PROGRESS - joscar.sosa"
   *
   * @returns Parte del email antes del '@', o "Unknown.QA" si no se puede extraer.
   */
  static getQaName(): string {
    try {
      const email = process.env.EMAIL ?? '';
      if (email.includes('@')) {
        return email.split('@')[0];
      }
    } catch {
      console.warn('[CredentialsManager] No se pudo extraer el nombre del QA desde EMAIL.');
    }
    return 'Unknown.QA';
  }
}
