/* Rutas de Producto
 * Define endpoints para gestión de productos */

import { Router } from 'express';
import productController from '../controllers/product.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';

// Crear un router para las rutas de producto
const router = Router();

// Rutas públicas (no requieren autenticación)
/* GET /api/productos
 * Obtiene todos los productos (opcionalmente filtrados por categoría) */
router.get('/', productController.index);

/* GET /api/productos/search
 * Busca productos por término */
router.get('/search', productController.search);

/* GET /api/productos/:id
 * Obtiene un producto específico por ID */
router.get('/:id', productController.show);

/* GET /api/productos/:id/colores
 * Obtiene colores disponibles para un producto */
router.get('/:id/color', productController.getColors);

/* GET /api/productos/categoria/:categoryId
 * Obtiene productos por categoría */
router.get('/categoria/:categoryId', productController.getProductsByCategory);

/* GET /images/:categoria/:imagen
 * Obtiene imágenes de productos */
router.get('/images/:categoria/:imagen', productController.getImage);

// Rutas administrativas (requieren autenticación y permisos de admin)
/* POST /api/productos
 * Crea un nuevo producto */
router.post('/', [verifyToken, isAdmin], productController.store);

/* PUT /api/productos/:id
 * Actualiza un producto existente */
router.put('/:id', [verifyToken, isAdmin], productController.update);

/* DELETE /api/productos/:id
 * Elimina un producto */
router.delete('/:id', [verifyToken, isAdmin], productController.destroy);

/* POST /api/productos/:id/colores
 * Añade un color a un producto */
router.post('/:id/color', [verifyToken, isAdmin], productController.addColor);

/* POST /api/productos/:id/images
 * Sube imágenes para un producto
 * Usa el middleware upload para gestionar la subida de archivos */
router.post('/:id/images', [
  verifyToken, 
  isAdmin, 
  upload.array('images', 10) // Permite hasta 10 imágenes a la vez
], productController.uploadImages);

export default router;