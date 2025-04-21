/* Middleware de Carga de Archivos
 * Configura Multer para gestionar subidas de imágenes */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/* Configurar el almacenamiento de archivos
 * Define dónde y cómo se guardarán los archivos subidos */
const storage = multer.diskStorage({
  // Función para determinar el directorio de destino
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Obtener la carpeta para el producto desde el cuerpo de la solicitud o URL
    const productId = req.params.id;
    const carpetaImg = req.body.carpetaimg || 'default';
    
    // Construir la ruta completa para guardar las imágenes
    const uploadPath = path.join(__dirname, '../../uploads/products', carpetaImg);
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Llamar al callback con la ruta de destino
    cb(null, uploadPath);
  },
  
  // Función para generar el nombre del archivo
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generar nombre único basado en timestamp y número aleatorio
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Obtener la extensión del archivo original
    const ext = path.extname(file.originalname);
    
    // Generar nombre final: prefijo + sufijo único + extensión
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

/* Filtro para tipos de archivo permitidos
 * Solo permite subir imágenes */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos MIME permitidos (solo imágenes)
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    // Archivo permitido
    cb(null, true);
  } else {
    // Archivo rechazado
    cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP).'));
  }
};

/* Configuración de Multer
 * Exporta un middleware listo para usar en rutas */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB por archivo
  }
});