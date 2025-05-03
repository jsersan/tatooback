import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IOrderLine } from '../interfaces/order.interface';

export default function(sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IOrderLine>> {
  /**
   * Clase OrderLine que extiende el Model de Sequelize
   * Implementa la interfaz IOrderLine para tipado fuerte
   */
  class OrderLine extends Model<IOrderLine> implements IOrderLine {
    // Propiedades del modelo
    public id!: number;
    public idpedido!: number;
    public idprod!: number;
    public color!: string;
    public cant!: number;
    public nombre?: string;

    // Timestamps automáticos de Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Método estático para definir asociaciones con otros modelos
     * @param models Objeto con todos los modelos disponibles
     */
    public static associate(models: any) {
      // Una línea de pedido pertenece a un pedido
      OrderLine.belongsTo(models.Order, {
        foreignKey: 'idpedido',
        as: 'order'
      });

      // Una línea de pedido está asociada a un producto
      OrderLine.belongsTo(models.Product, {
        foreignKey: 'idprod',
        as: 'product'
      });
    }
  }

  // Inicializar el modelo con sus atributos y opciones
  OrderLine.init(
    {
      // Definición de columnas
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      idpedido: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders', // Referencia a la tabla de pedidos
          key: 'id'
        },
        comment: 'ID del pedido al que pertenece esta línea'
      },
      idprod: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products', // Referencia a la tabla de productos
          key: 'id'
        },
        comment: 'ID del producto incluido en esta línea'
      },
      color: {
        type: dataTypes.STRING,
        allowNull: false,
        comment: 'Color seleccionado para el producto'
      },
      cant: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1 // La cantidad mínima es 1
        },
        comment: 'Cantidad del producto'
      },
      nombre: {
        type: dataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del producto (para mantener histórico aunque se modifique el producto)'
      }
    },
    {
      sequelize,
      modelName: 'OrderLine',
      tableName: 'lineapedido', // Cambiado a 'lineapedido' para usar la tabla existente,
      timestamps: false,
      // Índices para mejorar el rendimiento de las consultas
      indexes: [
        { fields: ['idpedido'] }, // Índice para búsquedas por pedido
        { fields: ['idprod'] }    // Índice para búsquedas por producto
      ]
    }
  );

  return OrderLine;
}