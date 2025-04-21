/**
 * Script para inicializar la base de datos
 * Ejecuta el archivo SQL de inicialización
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
const environment = process.env.NODE_ENV || 'development';
const envFile = path.resolve(process.cwd(), `.env.${environment}`);
const defaultEnvFile = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Cargando variables de entorno desde: ${envFile}`);
} else {
  dotenv.config({ path: defaultEnvFile });
  console.log(`Archivo .env.${environment} no encontrado, usando .env predeterminado`);
}

// Opciones de conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  multipleStatements: true // Necesario para ejecutar múltiples consultas
};

// Ruta al archivo SQL
const sqlFilePath = path.join(__dirname, 'db-init.sql');

// Ejecutar la inicialización
async function initializeDatabase() {
  console.log('Iniciando configuración de base de datos...');
  
  try {
    // Leer el archivo SQL
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Conectar a MySQL sin especificar base de datos (para poder crearla)
    console.log('Conectando a MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Ejecutando script SQL...');
    await connection.query(sqlScript);
    
    console.log('Base de datos inicializada correctamente.');
    
    // Cerrar conexión
    await connection.end();
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
initializeDatabase();