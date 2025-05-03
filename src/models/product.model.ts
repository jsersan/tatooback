import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IProduct } from '../interfaces/product.interface';

export default function(sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IProduct>> {
  /**
   * Clase Product que extiende el Model de Sequelize
   * Implementa la interfaz IProduct para tipado fuerte
   */
  class Product extends Model<IProduct> implements IProduct {
    // Propiedades del modelo
    public id!: number;
    public nombre!: string;
    public descripcion!: string;
    public precio!: number;
    public carpetaimg!: string;
    public imagen!: string;
    public categoria!: number;

    // Timestamps automáticos de Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Método estático para definir asociaciones con otros modelos
     * @param models Objeto con todos los modelos disponibles
     */
    public static associate(models: any) {
      // Un producto pertenece a una categoría
      Product.belongsTo(models.Category, {
        foreignKey: 'categoria',
        as: 'categoryInfo'
      });

      // Un producto puede tener muchos colores
      Product.hasMany(models.ProductColor, {
        foreignKey: 'idprod',
        as: 'colors'
      });

      // Un producto puede estar en muchas líneas de pedido
      Product.hasMany(models.OrderLine, {
        foreignKey: 'idprod',
        as: 'orderLines'
      });
    }
  }

  // Inicializar el modelo con sus atributos y opciones
  Product.init(
    {
      // Definición de columnas
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      descripcion: {
        type: dataTypes.TEXT,
        allowNull: false
      },
      precio: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0 // El precio no puede ser negativo
        }
      },
      carpetaimg: {
        type: dataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de la carpeta donde se almacenan las imágenes del producto'
      },
      imagen: {
        type: dataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del archivo de la imagen principal'
      },
      categoria: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categoria', // Cambiado de 'categories' a 'categoria'
          key: 'id'
        },
        comment: 'ID de la categoría a la que pertenece el producto'
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'producto', // Cambiado de 'products' a 'producto'
      // Índices para mejorar el rendimiento de las consultas,
      timestamps: false,
      indexes: [
        { fields: ['categoria'] }, // Índice para búsquedas por categoría
        { fields: ['nombre'] }     // Índice para búsquedas por nombre
      ]
    }
  );

  return Product;
}