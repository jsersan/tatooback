import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar definiciones de modelos
import productModel from './product.model';
import categoryModel from './category.model';
import productColorModel from './product-color.model';
import userModel from './user.model';
import orderModel from './order.model';
import orderLineModel from './order-line.model';

// Crear instancia de Sequelize usando directamente las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!, // Nota: aquí usamos DB_PASS como está en tu .env
  {
    host: process.env.DB_HOST!,
    dialect: 'mysql', // Especifica el dialecto directamente
    logging: console.log, // Para debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Crear objeto de base de datos
const db: any = {
  sequelize,
  Sequelize,
  Product: productModel(sequelize, DataTypes),
  Category: categoryModel(sequelize, DataTypes),
  ProductColor: productColorModel(sequelize, DataTypes),
  User: userModel(sequelize, DataTypes),
  Order: orderModel(sequelize, DataTypes),
  OrderLine: orderLineModel(sequelize, DataTypes)
};

// Establecer asociaciones entre modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;