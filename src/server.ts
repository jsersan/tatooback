/**
 * Archivo principal - Punto de entrada de la aplicación
 * Configura y arranca el servidor Express
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde archivo .env
dotenv.config();

// Importaciones internas
import db from './models';
import routes from './routes';
import { errorHandler } from './utils/error-handler';

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar middleware
// Configurar CORS para permitir solicitudes desde tu aplicación Angular
app.use(cors({
  origin: 'http://localhost:4200', // URL de tu aplicación Angular
  credentials: true
}));
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Servir archivos estáticos (imágenes de productos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configurar rutas de la API
app.use('/api', routes);

// Ruta para comprobar el estado de la API
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejo global de errores
app.use(errorHandler);

// Sincronizar base de datos y arrancar servidor
db.sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
    
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err: Error) => {
    console.error('No se pudo conectar a la base de datos:', err.message);
  });

// Manejo de errores no capturados para evitar caídas del servidor
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // En producción, podrías querer reiniciar la aplicación o notificar a un servicio de monitoreo
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // En producción, lo ideal sería reiniciar la aplicación de forma segura
});