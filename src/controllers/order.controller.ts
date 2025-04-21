/**
 * Controlador de Pedidos
 * Maneja la lógica de negocio para operaciones relacionadas con pedidos
 */
import { Request, Response } from 'express';
import db from '../models';
import { IOrder, IOrderLine } from '../interfaces/order.interface';
import { Transaction } from 'sequelize';

// Referencias a los modelos necesarios
const Order = db.Order;
const OrderLine = db.OrderLine;
const User = db.User;
const Product = db.Product;

/**
 * Controlador de pedidos
 */
const orderController = {
  /**
   * Obtiene pedidos de un usuario específico
   * GET /api/pedidos/user/:userId
   */
  findByUser: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verificar que el usuario autenticado está accediendo a sus propios pedidos
      // o que es un administrador
      if (req.userId !== userId && !await isAdmin(req.userId)) {
        return res.status(403).json({ message: 'No autorizado para ver estos pedidos' });
      }
      
      // Verificar si el usuario existe
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Obtener pedidos con sus líneas
      const orders = await Order.findAll({
        where: { iduser: userId },
        include: [
          {
            model: OrderLine,
            as: 'lineas'
          }
        ],
        order: [['fecha', 'DESC']] // Pedidos más recientes primero
      });
      
      return res.json(orders);
    } catch (err) {
      console.error('Error al obtener pedidos del usuario:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener pedidos' });
    }
  },
  
  /* Obtiene un pedido específico con todos sus detalles
   * GET /api/pedidos/:id */
  findOne: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar pedido por ID con relaciones
      const order = await Order.findByPk(id, {
        include: [
          {
            model: OrderLine,
            as: 'lineas',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'nombre', 'precio', 'imagen', 'carpetaimg']
              }
            ]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nombre', 'email']
          }
        ]
      });
      
      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      // Verificar que el usuario autenticado es el propietario del pedido o un administrador
      if (order.get('iduser') !== req.userId && !await isAdmin(req.userId)) {
        return res.status(403).json({ message: 'No autorizado para ver este pedido' });
      }
      
      return res.json(order);
    } catch (err) {
      console.error('Error al obtener pedido:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener el pedido' });
    }
  },
  
  /**
   * Crea un nuevo pedido
   * POST /api/pedidos
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderData: IOrder = req.body;
      
      // Verificar que el usuario autenticado está creando su propio pedido
      if (req.userId !== orderData.iduser) {
        return res.status(403).json({ message: 'No autorizado para crear pedidos para otro usuario' });
      }
      
      // Verificar que hay líneas de pedido
      if (!orderData.lineas || orderData.lineas.length === 0) {
        return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
      }
      
      // Iniciar transacción para garantizar integridad
      const result = await db.sequelize.transaction(async (t: Transaction) => {
        // Crear el pedido
        const order = await Order.create(
          {
            iduser: orderData.iduser,
            fecha: orderData.fecha || new Date().toISOString().split('T')[0], // Fecha actual si no se proporciona
            total: orderData.total
          },
          { transaction: t }
        );
        
        // Obtener el ID del pedido creado
        const orderId = order.get('id') as number;
        
        // Crear líneas de pedido
        const orderLines: IOrderLine[] = orderData.lineas.map(line => ({
          ...line,
          idpedido: orderId
        }));
        
        await OrderLine.bulkCreate(orderLines, { transaction: t });
        
        // Obtener el pedido completo con sus líneas
        return await Order.findByPk(orderId, {
          include: [
            {
              model: OrderLine,
              as: 'lineas'
            }
          ],
          transaction: t
        });
      });
      
      return res.status(201).json(result);
    } catch (err) {
      console.error('Error al crear pedido:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al crear el pedido' });
    }
  }
};

/**
 * Función auxiliar para verificar si un usuario es administrador
 * @param userId ID del usuario a verificar
 * @returns true si es admin, false si no
 */
const isAdmin = async (userId: number | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  const user = await User.findByPk(userId);
  return user && (user.get('username') === 'admin' || user.get('role') === 'admin');
};

export default orderController;