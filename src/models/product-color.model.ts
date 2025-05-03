import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IProductColor } from '../interfaces/product-color.interface';

export default function(sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IProductColor>> {
  /**
   * Definir el modelo ProductColor con sus atributos
   */
  const ProductColor = sequelize.define<Model<IProductColor>>('ProductColor', {
    id: {
      type: dataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    product_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    color_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'colors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    modelName: 'ProductColor',
    tableName: 'product_colors',
    timestamps: true,
    underscored: false,
    paranoid: false,
    freezeTableName: true,
  });

  /**
   * Definir asociaciones del modelo ProductColor
   */
  (ProductColor as any).associate = (models: any) => {
    ProductColor.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
    
    ProductColor.belongsTo(models.Color, {
      foreignKey: 'color_id',
      as: 'color'
    });
  };

  return ProductColor;
}