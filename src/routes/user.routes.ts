/* Rutas de Usuario
 * Define endpoints para gestión de usuarios y autenticación */
import { Router } from 'express';
import userController from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

// Crear un router para las rutas de usuario
const router = Router();

// Rutas públicas (no requieren autenticación)
/* POST /api/users/register
 * Registra un nuevo usuario */
router.post('/register', userController.register);

/* POST /api/users/login
 * Inicia sesión para un usuario existente */
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
/* GET /api/users/profile
 * Obtiene el perfil del usuario autenticado */
router.get('/profile', verifyToken, userController.profile);

/* PUT /api/users/:id
 * Actualiza los datos de un usuario específico */
router.put('/:id', verifyToken, userController.update);

export default router;