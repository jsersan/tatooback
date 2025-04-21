 /* Rutas de Pedido
 * Define endpoints para gestión de pedidos */
import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { verifyToken } from '../middleware/auth.middleware';

// Crear un router para las rutas de pedido
const router = Router();

// Todas las rutas de pedidos requieren autenticación

/* GET /api/pedidos/user/:userId
 * Obtiene pedidos de un usuario específico */
router.get('/user/:userId', verifyToken, orderController.findByUser);

/* GET /api/pedidos/:id
 * Obtiene un pedido específico con todos sus detalles */
router.get('/:id', verifyToken, orderController.findOne);

/* POST /api/pedidos
 * Crea un nuevo pedido */
router.post('/', verifyToken, orderController.create);

export default router;