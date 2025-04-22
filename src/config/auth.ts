/**
 * Configuración de autenticación
 * Define parámetros relacionados con JWT y autenticación
 */
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración de autenticación
 * - secret: Clave secreta para firmar tokens JWT
 * - expiresIn: Tiempo de expiración de los tokens JWT
 */
// src/config/auth.ts
export default {
  // Clave secreta para firmar tokens JWT
  secret: String(process.env.JWT_SECRET || 'tatoodenda-secret-key'),
  
  // Tiempo de expiración del token
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};