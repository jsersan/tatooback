/* Configuración de rutas principales
 * Agrupa todas las rutas de la API */
import { Router } from 'express';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

// Crear un router para todas las rutas
const router = Router();

// Registrar las rutas por dominio
router.use('/users', userRoutes);        // Rutas de usuarios y autenticación
router.use('/categoria', categoryRoutes); // Rutas de categorías
router.use('/productos', productRoutes);   // Rutas de productos
router.use('/pedido', orderRoutes);      // Rutas de pedidos

export default router;