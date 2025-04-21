/**
 * Configuración de entornos
 * Carga y valida variables de entorno específicas para cada entorno de ejecución
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determinar el entorno actual
const environment = process.env.NODE_ENV || 'development';

// Cargar variables de entorno del archivo .env correspondiente al entorno
const envFile = path.resolve(process.cwd(), `.env.${environment}`);
const defaultEnvFile = path.resolve(process.cwd(), '.env');

// Intentar cargar el archivo específico del entorno, si no existe usar el predeterminado
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Cargando variables de entorno desde: ${envFile}`);
} else {
  dotenv.config({ path: defaultEnvFile });
  console.log(`Archivo .env.${environment} no encontrado, usando .env predeterminado`);
}

// Interfaz para nuestra configuración de entorno
interface EnvConfig {
  // Servidor
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'test' | 'production';
  
  // Base de datos
  DB_HOST: string;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  DB_DIALECT: string;
  DB_POOL_MAX: number;
  DB_POOL_MIN: number;
  DB_POOL_ACQUIRE: number;
  DB_POOL_IDLE: number;
  
  // Autenticación
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Logging
  LOG_LEVEL: string;
  
  // Carpetas de archivos subidos
  UPLOADS_DIR: string;
}

// Valores predeterminados para variables requeridas
const defaults = {
  PORT: 3000,
  HOST: 'localhost',
  NODE_ENV: 'development',
  
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASS: 'password',
  DB_NAME: 'tatoodenda_db',
  DB_DIALECT: 'mysql',
  DB_POOL_MAX: 5,
  DB_POOL_MIN: 0,
  DB_POOL_ACQUIRE: 30000,
  DB_POOL_IDLE: 10000,
  
  JWT_SECRET: 'tatoodenda-secret-key',
  JWT_EXPIRES_IN: '24h',
  
  LOG_LEVEL: 'info',
  
  UPLOADS_DIR: path.join(process.cwd(), 'uploads')
};

// Función para obtener variables de entorno con valores predeterminados
const getEnvVar = <T>(key: keyof EnvConfig, defaultValue: T): T => {
  const value = process.env[key];
  
  if (value === undefined) {
    return defaultValue;
  }
  
  // Convertir según el tipo del valor predeterminado
  if (typeof defaultValue === 'number') {
    return Number(value) as unknown as T;
  }
  
  if (typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as unknown as T;
  }
  
  return value as unknown as T;
};

// Configuración construida a partir de variables de entorno
const config: EnvConfig = {
  PORT: getEnvVar('PORT', defaults.PORT),
  HOST: getEnvVar('HOST', defaults.HOST),
  NODE_ENV: getEnvVar('NODE_ENV', defaults.NODE_ENV) as 'development' | 'test' | 'production',
  
  DB_HOST: getEnvVar('DB_HOST', defaults.DB_HOST),
  DB_USER: getEnvVar('DB_USER', defaults.DB_USER),
  DB_PASS: getEnvVar('DB_PASS', defaults.DB_PASS),
  DB_NAME: getEnvVar('DB_NAME', defaults.DB_NAME),
  DB_DIALECT: getEnvVar('DB_DIALECT', defaults.DB_DIALECT),
  DB_POOL_MAX: getEnvVar('DB_POOL_MAX', defaults.DB_POOL_MAX),
  DB_POOL_MIN: getEnvVar('DB_POOL_MIN', defaults.DB_POOL_MIN),
  DB_POOL_ACQUIRE: getEnvVar('DB_POOL_ACQUIRE', defaults.DB_POOL_ACQUIRE),
  DB_POOL_IDLE: getEnvVar('DB_POOL_IDLE', defaults.DB_POOL_IDLE),
  
  JWT_SECRET: getEnvVar('JWT_SECRET', defaults.JWT_SECRET),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', defaults.JWT_EXPIRES_IN),
  
  LOG_LEVEL: getEnvVar('LOG_LEVEL', defaults.LOG_LEVEL),
  
  UPLOADS_DIR: getEnvVar('UPLOADS_DIR', defaults.UPLOADS_DIR)
};

// Validar configuración crítica
if (config.NODE_ENV === 'production' && config.JWT_SECRET === defaults.JWT_SECRET) {
  console.warn('ADVERTENCIA: Usando clave JWT predeterminada en producción. ¡Esto es inseguro!');
}

export default config;