/**
 * Configuración de la base de datos
 * Define los parámetros de conexión a la base de datos MySQL/PostgreSQL
 */
import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Interfaz que define la estructura de la configuración de base de datos
 */
interface DbConfig {
  host: string;       // Servidor de base de datos
  user: string;       // Usuario de la base de datos
  password: string;   // Contraseña del usuario
  database: string;   // Nombre de la base de datos
  dialect: Dialect;   // Tipo de base de datos (mysql, postgres, etc.)
  pool: {
    max: number;      // Número máximo de conexiones en el pool
    min: number;      // Número mínimo de conexiones en el pool
    acquire: number;  // Tiempo máximo (ms) para adquirir una conexión
    idle: number;     // Tiempo máximo (ms) que una conexión puede estar inactiva
  };
}

// Configuración extraída de variables de entorno con valores por defecto
const config: DbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'tatoodenda_db',
  dialect: (process.env.DB_DIALECT as Dialect) || 'mysql',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000')
  }
};

export default config;