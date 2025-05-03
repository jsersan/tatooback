import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IProductColor } from '../interfaces/product.interface';

export default function(sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IProductColor>> {
  /**
   * Clase ProductColor que extiende el Model de Sequelize
   * Implementa la interfaz IProductColor para tipado fuerte
   */
  class ProductColor extends Model<IProductColor> implements IProductColor {
    // Propiedades del modelo
    public id!: number;
    public idprod!: number;
    public color!: string;
    public imagen!: string;

    // Timestamps automáticos de Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Método estático para definir asociaciones con otros modelos
     * @param models Objeto con todos los modelos disponibles
     */
    public static associate(models: any) {
      // Un color pertenece a un producto
      ProductColor.belongsTo(models.Product, {
        foreignKey: 'idprod',
        as: 'product'
      });
    }
  }

  // Inicializar el modelo con sus atributos y opciones
  ProductColor.init(
    {
      // Definición de columnas
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      idprod: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'producto', // Cambiado de 'products' a 'producto'
          key: 'id'
        },
        comment: 'ID del producto al que pertenece este color'
      },
      color: {
        type: dataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del color del producto'
      },
      imagen: {
        type: dataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del archivo de imagen que muestra el producto en este color'
      }
    },
    {
      sequelize,
      modelName: 'ProductColor',
      tableName: 'color', // Cambiado de 'product_colors' a 'color',
      timestamps: false,
      // Restricción única para evitar duplicados de color para un mismo producto
      indexes: [
        {
          unique: true,
          fields: ['idprod', 'color'],
          name: 'unique_product_color'
        }
      ]
    }
  );

  return ProductColor;
}