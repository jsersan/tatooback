import { Model, DataTypes, Sequelize } from 'sequelize';
import { IOrder } from '../interfaces/order.interface';

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  /**
   * Clase Order que extiende el Model de Sequelize
   * Implementa la interfaz IOrder para tipado fuerte
   */
  class Order extends Model<IOrder> implements IOrder {
    // Propiedades del modelo
    public id!: number;
    public iduser!: number;
    public fecha!: string;
    public total!: number;

    // Timestamps automáticos de Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Método estático para definir asociaciones con otros modelos
     * @param models Objeto con todos los modelos disponibles
     */
    public static associate(models: any) {
      // Un pedido pertenece a un usuario
      Order.belongsTo(models.User, {
        foreignKey: 'iduser',
        as: 'user'
      });

      // Un pedido tiene muchas líneas de pedido
      Order.hasMany(models.OrderLine, {
        foreignKey: 'idpedido',
        as: 'lineas',
        onDelete: 'CASCADE' // Si se elimina el pedido, se eliminan sus líneas
      });
    }
  }

  // Inicializar el modelo con sus atributos y opciones
  Order.init(
    {
      // Definición de columnas
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      iduser: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Referencia a la tabla de usuarios
          key: 'id'
        },
        comment: 'ID del usuario que realizó el pedido'
      },
      fecha: {
        type: dataTypes.DATEONLY, // Solo fecha, sin hora
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha en que se realizó el pedido'
      },
      total: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0 // El total no puede ser negativo
        },
        comment: 'Importe total del pedido'
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders', // Nombre específico para la tabla en la BD
      // Índices para mejorar el rendimiento de las consultas
      indexes: [
        { fields: ['iduser'] }, // Índice para búsquedas por usuario
        { fields: ['fecha'] }   // Índice para búsquedas por fecha
      ]
    }
  );

  return Order;
};