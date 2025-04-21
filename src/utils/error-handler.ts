/**
 * Gestor global de errores
 * Proporciona un middleware centralizado para el manejo de errores en Express
 */
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

/**
 * Interfaz que define la estructura de un error personalizado de la API
 */
interface APIError extends Error {
  statusCode?: number;
  errors?: any[];
  details?: string;
}

/**
 * Middleware para manejar errores de la aplicación
 * Procesa diferentes tipos de errores y devuelve respuestas consistentes
 * 
 * @param err Error capturado
 * @param req Objeto Request de Express
 * @param res Objeto Response de Express
 * @param next Función NextFunction de Express
 */
export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error capturado por el manejador global:', err);

  // Errores de Sequelize (validación, etc.)
  if (err instanceof ValidationError) {
    res.status(400).json({
      message: 'Error de validación',
      errors: err.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
    return;
  }

  // Errores personalizados con código de estado definido
  if ('statusCode' in err && err.statusCode) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details || undefined
    });
    return;
  }

  // Errores de SyntaxError (por ejemplo, JSON mal formado)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      message: 'Petición mal formada',
      details: 'El JSON enviado no es válido'
    });
    return;
  }

  // Cualquier otro error no manejado específicamente
  // En producción no enviamos detalles técnicos al cliente
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    message: 'Error interno del servidor',
    // Solo incluir stack trace y detalles en desarrollo
    details: isDevelopment ? err.message : undefined,
    stack: isDevelopment ? err.stack : undefined
  });
};

/**
 * Función de ayuda para crear errores de API con formato consistente
 * 
 * @param message Mensaje de error
 * @param statusCode Código de estado HTTP
 * @param details Detalles adicionales (opcional)
 * @returns Error personalizado con el formato requerido
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  details?: string
): APIError => {
  const error = new Error(message) as APIError;
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};

/**
 * Función de ayuda para envolver un bloque de código en un try-catch
 * y pasar cualquier error al middleware next() de Express
 * 
 * @param fn Función asíncrona a ejecutar con manejo de errores
 * @returns Middleware de Express con manejo de errores automático
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};