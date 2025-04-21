import { Model, DataTypes, Sequelize } from 'sequelize';
import { IUser } from '../interfaces/user.interface';

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  /**
   * Clase User que extiende el Model de Sequelize
   * Implementa la interfaz IUser para tipado fuerte
   */
  class User extends Model<IUser> implements IUser {
    // Propiedades del modelo
    public id!: number;
    public username!: string;
    public password!: string;
    public nombre!: string;
    public email!: string;
    public direccion!: string;
    public ciudad!: string;
    public cp!: string;
    public role!: string;

    // Timestamps automáticos de Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Método estático para definir asociaciones con otros modelos
     * @param models Objeto con todos los modelos disponibles
     */
    public static associate(models: any) {
      // Un usuario puede tener muchos pedidos
      User.hasMany(models.Order, {
        foreignKey: 'iduser',
        as: 'orders'
      });
    }
  }

  // Inicializar el modelo con sus atributos y opciones
  User.init(
    {
      // Definición de columnas
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 30] // Longitud mínima y máxima
        }
      },
      password: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      nombre: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true // Validar formato de email
        }
      },
      direccion: {
        type: dataTypes.STRING,
        allowNull: false
      },
      ciudad: {
        type: dataTypes.STRING,
        allowNull: false
      },
      cp: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^\d{5}$/ // Validar formato de código postal (5 dígitos)
        }
      },
      role: {
        type: dataTypes.STRING,
        defaultValue: 'user', // Roles: 'user' o 'admin'
        validate: {
          isIn: [['user', 'admin']] // Validar que solo sean estos valores
        }
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users' // Nombre específico para la tabla en la BD
    }
  );

  return User;
};