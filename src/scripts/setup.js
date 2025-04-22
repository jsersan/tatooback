/** 
 * Script de configuración inicial del proyecto
 * Crea directorios necesarios, verifica dependencias y configura entorno 
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

// Directorios a crear
const directories = [
  'logs',
  'src',
  'src/controllers',
  'src/models',
  'src/views',
  'src/utils',
  'public',
  'public/assets',
  'public/css',
  'public/js',
  'config',
  'tests'
];

// Archivos de configuración a crear
const configFiles = [
  {
    path: '.env.example',
    content: `# Configuración de entorno
            PORT=3000
            NODE_ENV=development
            DB_CONNECTION=mongodb
            DB_HOST=localhost
            DB_PORT=27017
            DB_DATABASE=myapp
            DB_USERNAME=
            DB_PASSWORD=
            `
  },
  {
    path: 'config/app.js',
    content: `module.exports = {
  name: 'MyApp',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info'
};
`
  }
];

// Función para crear directorios
function createDirectories() {
  console.log('Creando estructura de directorios...');
  
  directories.forEach(dir => {
    const dirPath = join(process.cwd(), dir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Directorio creado: ${dir}`);
    } else {
      console.log(`→ Directorio ya existe: ${dir}`);
    }
  });
}

// Función para crear archivos de configuración
function createConfigFiles() {
  console.log('\nCreando archivos de configuración...');
  
  configFiles.forEach(file => {
    const filePath = join(process.cwd(), file.path);
    const dirName = dirname(filePath);
    
    if (!existsSync(dirName)) {
      mkdirSync(dirName, { recursive: true });
    }
    
    if (!existsSync(filePath)) {
      writeFileSync(filePath, file.content);
      console.log(`✓ Archivo creado: ${file.path}`);
    } else {
      console.log(`→ Archivo ya existe: ${file.path}`);
    }
  });
}

// Verificar dependencias necesarias
function checkDependencies() {
  console.log('\nVerificando dependencias...');
  
  const requiredDeps = ['node', 'npm'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    try {
      execSync(`which ${dep}`, { stdio: 'ignore' });
      console.log(`✓ ${dep} instalado`);
    } catch (error) {
      console.error(`✗ ${dep} no encontrado`);
      missingDeps.push(dep);
    }
  });
  
  return missingDeps;
}

// Instalar dependencias del proyecto
function installDependencies() {
  console.log('\nInstalando dependencias del proyecto...');
  
  try {
    // Verificar si package.json existe
    if (!existsSync('package.json')) {
      console.log('Inicializando package.json...');
      execSync('npm init -y', { stdio: 'inherit' });
    }
    
    console.log('Instalando dependencias básicas...');
    execSync('npm install express dotenv mongoose winston cors', { stdio: 'inherit' });
    
    console.log('Instalando dependencias de desarrollo...');
    execSync('npm install --save-dev nodemon jest supertest', { stdio: 'inherit' });
    
    // Actualizar package.json con scripts útiles
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    packageJson.scripts = {
      ...packageJson.scripts,
      start: 'node src/index.js',
      dev: 'nodemon src/index.js',
      test: 'jest'
    };
    
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✓ Scripts configurados en package.json');
    
  } catch (error) {
    console.error('Error al instalar dependencias:', error.message);
  }
}

// Crear archivo básico de aplicación
function createIndexFile() {
  console.log('\nCreando archivo de entrada de la aplicación...');
  
  const indexPath = join(process.cwd(), 'src/index.js');
  
  if (!existsSync(indexPath)) {
    const indexContent = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('../config/app');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
  res.send({ message: 'API funcionando correctamente' });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(\`Servidor iniciado en http://localhost:\${PORT}\`);
});
`;
    
    writeFileSync(indexPath, indexContent);
    console.log(`✓ Archivo creado: src/index.js`);
  } else {
    console.log(`→ Archivo ya existe: src/index.js`);
  }
}

// Función principal
function setup() {
  console.log('=== CONFIGURACIÓN INICIAL DEL PROYECTO ===\n');
  
  // 1. Verificar dependencias
  const missingDeps = checkDependencies();
  if (missingDeps.length > 0) {
    console.error(`\n⚠️  Faltan dependencias: ${missingDeps.join(', ')}`);
    console.error('Por favor, instale estas dependencias y vuelva a ejecutar el script.');
    process.exit(1);
  }
  
  // 2. Crear estructura de directorios
  createDirectories();
  
  // 3. Crear archivos de configuración
  createConfigFiles();
  
  // 4. Crear archivo index.js
  createIndexFile();
  
  // 5. Instalar dependencias del proyecto
  const installDeps = process.argv.includes('--install');
  if (installDeps) {
    installDependencies();
  } else {
    console.log('\nPara instalar las dependencias del proyecto, ejecute:');
    console.log('node setup.js --install');
  }
  
  console.log('\n✅ Configuración inicial completada!');
}

// Ejecutar configuración
setup();