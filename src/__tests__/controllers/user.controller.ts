import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userController from '../../controllers/user.controller';
import db from '../../models';

// Mock de las dependencias
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  }
}));

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn().mockReturnValue('hashed_password'),
  compareSync: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_jwt_token'),
}));

// Helpers para las pruebas
const mockRequest = (body = {}, params = {}, userId?: number) => {
  const req = {
    body,
    params,
  } as Request;
  
  if (userId) {
    req.userId = userId;
  }
  
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => {
    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      // Configurar mocks
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nombre: 'Test User',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          nombre: 'Test User',
          password: 'hashed_password',
        }),
      };
      
      (db.User.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // username no existe
        .mockResolvedValueOnce(null); // email no existe
        
      (db.User.create as jest.Mock).mockResolvedValue(mockUser);

      // Ejecutar la función
      const req = mockRequest({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        nombre: 'Test User',
        direccion: 'Calle Test 123',
        ciudad: 'Test City',
        cp: '12345',
      });
      const res = mockResponse();

      await userController.register(req, res);

      // Verificaciones
      expect(db.User.findOne).toHaveBeenCalledTimes(2);
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
      expect(db.User.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashed_password',
        email: 'test@example.com',
        nombre: 'Test User',
        direccion: 'Calle Test 123',
        ciudad: 'Test City',
        cp: '12345',
        role: 'user',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nombre: 'Test User',
      });
    });

    it('debería rechazar el registro si el username ya existe', async () => {
      // Configurar el mock para simular que el username ya existe
      (db.User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        username: 'testuser',
      });

      // Ejecutar la función
      const req = mockRequest({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        nombre: 'Test User',
        direccion: 'Calle Test 123',
        ciudad: 'Test City',
        cp: '12345',
      });
      const res = mockResponse();

      await userController.register(req, res);

      // Verificaciones
      expect(db.User.findOne).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El nombre de usuario ya está en uso',
      });
    });
  });

  describe('login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      // Configurar mocks
      const mockUser = {
        get: jest.fn().mockImplementation(key => {
          const data = {
            id: 1,
            password: 'hashed_password',
          };
          return data[key];
        }),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          nombre: 'Test User',
          password: 'hashed_password',
        }),
      };
      
      (db.User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      // Ejecutar la función
      const req = mockRequest({
        username: 'testuser',
        password: 'password123',
      });
      const res = mockResponse();

      await userController.login(req, res);

      // Verificaciones
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'fake_jwt_token',
      }));
    });

    it('debería rechazar el inicio de sesión con credenciales inválidas', async () => {
      // Configurar mocks
      const mockUser = {
        get: jest.fn().mockImplementation(key => {
          const data = {
            id: 1,
            password: 'hashed_password',
          };
          return data[key];
        }),
      };
      
      (db.User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false); // Contraseña incorrecta

      // Ejecutar la función
      const req = mockRequest({
        username: 'testuser',
        password: 'wrong_password',
      });
      const res = mockResponse();

      await userController.login(req, res);

      // Verificaciones
      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Contraseña incorrecta',
      });
    });
  });

  // Puedes añadir más pruebas para los otros métodos (profile, update) siguiendo la misma estructura
});