/**
 * Archivo de inicio de modelos
 * Configura Sequelize y establece relaciones entre modelos
 */
import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config/database';

// Inicializar Sequelize con la configuración
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    // Solo mostrar logs SQL en desarrollo
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Importar definiciones de modelos
import UserModel from './user.model';
import CategoryModel from './category.model';
import ProductModel from './product.model';
import ProductColorModel from './product-color.model';
import OrderModel from './order.model';
import OrderLineModel from './order-line.model';

// Inicializar modelos
const db: any = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize, DataTypes),
  Category: CategoryModel(sequelize, DataTypes),
  Product: ProductModel(sequelize, DataTypes),
  ProductColor: ProductColorModel(sequelize, DataTypes),
  Order: OrderModel(sequelize, DataTypes),
  OrderLine: OrderLineModel(sequelize, DataTypes)
};

// Establecer relaciones entre modelos
// Esto se hace llamando al método associate que cada modelo define
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exportar el objeto db que contiene todos los modelos y la conexión
export default db;