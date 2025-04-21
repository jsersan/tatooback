/* Middleware de Autenticación
 * Verifica tokens JWT para proteger rutas */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import authConfig from '../config/auth';

// Extender la interfaz Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/* Middleware para verificar tokens JWT
 * Añade el userId a la solicitud si el token es válido */

export const verifyToken = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Obtener el header de autorización
  const authHeader = req.headers.authorization;
  
  // Verificar que existe el header y tiene el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Token no proporcionado',
      details: 'Se requiere un token JWT en el header Authorization con formato Bearer'
    });
  }
  
  // Extraer el token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, authConfig.secret as Secret) as { id: number };
    
    // Añadir el ID del usuario a la solicitud para su uso en controladores
    req.userId = decoded.id;
    
    // Continuar con la siguiente función en la cadena
    next();
  } catch (err) {
    // Manejar error según su tipo
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expirado',
        details: 'La sesión ha expirado, por favor inicie sesión nuevamente'
      });
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Token inválido',
        details: 'El token proporcionado no es válido' 
      });
    }
    
    // Error genérico
    return res.status(401).json({ 
      message: 'Error de autenticación',
      details: err instanceof Error ? err.message : 'Error desconocido'
    });
  }
};