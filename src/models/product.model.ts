import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IProduct } from '../interfaces/product.interface';

// Extender la interfaz Model para incluir associate
interface ProductModel extends Model<IProduct>, IProduct {
  associate?: (models: any) => void;
}

export default function(sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<ProductModel> {
  /**
   * Clase Product extendida para incluir métodos virtuales
   */
  class Product extends Model<IProduct> implements IProduct {
    public id!: number;
    public nombre!: string;
    public descripcion!: string;
    public precio!: number;
    public category_id!: number;
    public imagen!: string;
    public carpetaimg?: string;
    public category?: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Override del método toJSON para incluir carpetaimg automáticamente
     */
    public toJSON(): any {
      const values = Object.assign({}, this.get());
      
      // Mapear el category_id a carpetaimg
      if (values.category_id) {
        values.carpetaimg = this.getCarpetaImg();
      }
      
      return values;
    }

    /**
     * Método para obtener el nombre de carpeta de imagen según la categoría
     */
    public getCarpetaImg(): string {
      const categoryMap: { [key: number]: string } = {
        9: 'cuadros',
        10: 'escultura',
        11: 'libro',
        12: 'musica'
      };

      return categoryMap[this.category_id] || 'default';
    }
  }

  /**
   * Definir el modelo Product con sus atributos
   */
  const ProductModel = Product.init({
    id: {
      type: dataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre es requerido'
        },
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        }
      }
    },
    descripcion: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
    precio: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El precio es requerido'
        },
        isDecimal: {
          msg: 'El precio debe ser un número decimal'
        },
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo'
        }
      }
    },
    category_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La categoría es requerida'
        }
      }
    },
    imagen: {
      type: dataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: false,
    paranoid: false,
    freezeTableName: true,
  });

  /**
   * Definir asociaciones del modelo Product
   */
  (ProductModel as any).associate = (models: any) => {
    ProductModel.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  return ProductModel;
}