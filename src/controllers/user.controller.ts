/**
 * Controlador de Usuarios
 * Maneja la lógica de negocio para operaciones relacionadas con usuarios
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import db from '../models';
import authConfig from '../config/auth';
import { IUser, IUserResponse, ILoginRequest } from '../interfaces/user.interface';

// Referencia al modelo User
const User = db.User;

/**
 * Generador de token JWT
 * @param userId ID del usuario para incluir en el payload
 * @returns Token JWT firmado
 */
const generateToken = (userId: number): string => {
  return jwt.sign(
    { id: userId },
    authConfig.secret as Secret,
    {
      expiresIn: authConfig.expiresIn
    }
  );
};

/**
 * Elimina campos sensibles para la respuesta
 * @param user Modelo de usuario completo
 * @returns Versión segura para enviar al cliente
 */
const sanitizeUser = (user: any): IUserResponse => {
  const userObject = user.toJSON();
  delete userObject.password; // Nunca enviar la contraseña al cliente
  return userObject;
};

/**
 * Controlador de usuarios
 */
const userController = {
  /**
   * Registra un nuevo usuario
   * POST /api/users/register
   */
  register: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, password, email, nombre, direccion, ciudad, cp } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: { username }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'El nombre de usuario ya está en uso'
        });
      }
      
      // Verificar si el email ya existe
      const existingEmail = await User.findOne({
        where: { email }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          message: 'El email ya está registrado'
        });
      }
      
      // Hashear la contraseña (10 rondas de sal)
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Crear el nuevo usuario
      const newUser = await User.create({
        username,
        password: hashedPassword,
        email,
        nombre,
        direccion,
        ciudad,
        cp,
        // 'admin' especial solo si el username es 'admin'
        role: username === 'admin' ? 'admin' : 'user'
      });
      
      // Devolver datos del usuario (sin contraseña)
      return res.status(201).json(sanitizeUser(newUser));
    } catch (err) {
      console.error('Error en registro:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }
  },
  
  /**
   * Inicia sesión para un usuario
   * POST /api/users/login
   */
  login: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, password }: ILoginRequest = req.body;
      
      // Buscar el usuario por nombre de usuario
      const user = await User.findOne({
        where: { username }
      });
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }
      
      // Verificar la contraseña
      const passwordIsValid = bcrypt.compareSync(
        password,
        user.get('password') as string
      );
      
      if (!passwordIsValid) {
        return res.status(401).json({
          message: 'Contraseña incorrecta'
        });
      }
      
      // Generar token JWT
      const token = generateToken(user.get('id') as number);
      
      // Preparar respuesta con datos de usuario y token
      const userResponse: IUserResponse = {
        ...sanitizeUser(user),
        token
      };
      
      return res.status(200).json(userResponse);
    } catch (err) {
      console.error('Error en login:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  },
  
  /**
   * Actualiza los datos de un usuario
   * PUT /api/users/:id
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Verificar que el usuario autenticado está actualizando su propio perfil
      // o que es un administrador
      if (req.userId !== userId && !(await isAdmin(req.userId))) {
        return res.status(403).json({ message: 'No autorizado para actualizar este usuario' });
      }
      
      // Preparar datos para actualizar
      const updateData: Partial<IUser> = {
        email: req.body.email,
        nombre: req.body.nombre,
        direccion: req.body.direccion,
        ciudad: req.body.ciudad,
        cp: req.body.cp
      };
      
      // Si se proporciona contraseña, hashearla
      if (req.body.password) {
        updateData.password = bcrypt.hashSync(req.body.password, 10);
      }
      
      // Actualizar usuario
      await user.update(updateData);
      
      // Devolver datos actualizados
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      console.error('Error en actualización:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },
  
  /**
   * Obtiene el perfil del usuario actual
   * GET /api/users/profile
   */
  profile: async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'No autenticado' });
      }
      
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener perfil' });
    }
  }
};

/**
 * Función auxiliar para verificar si un usuario es administrador
 * @param userId ID del usuario a verificar
 * @returns true si es admin, false si no
 */
const isAdmin = async (userId: number | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  const user = await User.findByPk(userId);
  return user && (user.get('username') === 'admin' || user.get('role') === 'admin');
};

export default userController;