/* Rutas de Categoría
 * Define endpoints para gestión de categorías */

import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

// Crear un router para las rutas de categoría
const router = Router();

// Rutas públicas (no requieren autenticación)
/* GET /api/categorias
 * Obtiene todas las categorías */
router.get('/', categoryController.findAll);

/* GET /api/categorias/:id
 * Obtiene una categoría específica por ID */
router.get('/:id', categoryController.findOne);

// Rutas administrativas (requieren autenticación y permisos de admin)
/* POST /api/categorias
 * Crea una nueva categoría */
router.post('/', [verifyToken, isAdmin], categoryController.create);

/* PUT /api/categorias/:id
 * Actualiza una categoría existente */
router.put('/:id', [verifyToken, isAdmin], categoryController.update);

/* DELETE /api/categorias/:id
 * Elimina una categoría */
router.delete('/:id', [verifyToken, isAdmin], categoryController.delete);

export default router;