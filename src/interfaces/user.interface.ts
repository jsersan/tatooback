/**
 * Interfaces relacionadas con usuarios
 * Define tipos para usuario, autenticación y respuestas
 */

/**
 * Interfaz principal de Usuario
 * Define la estructura de datos de un usuario en la aplicación
 */
export interface IUser {
  id?: number;        // ID único del usuario (opcional para nuevos usuarios)
  username: string;   // Nombre de usuario (único)
  password: string;   // Contraseña (hasheada en la base de datos)
  nombre: string;     // Nombre completo
  email: string;      // Correo electrónico (único)
  direccion: string;  // Dirección postal
  ciudad: string;     // Ciudad
  cp: string;         // Código postal
  role?: string;      // Rol (user/admin)
}

/**
 * Interfaz para respuestas de usuario
 * Versión de usuario sin contraseña y con posible token JWT
 */
export interface IUserResponse extends Omit<IUser, 'password'> {
  token?: string;     // Token JWT para autenticación
}

/**
 * Interfaz para solicitudes de inicio de sesión
 */
export interface ILoginRequest {
  username: string;   // Nombre de usuario
  password: string;   // Contraseña
}

/**
 * Interfaz para solicitudes de registro
 */
export interface IRegisterRequest extends IUser {
  // Extiende IUser, sin campos adicionales
}

/**
 * Interfaz para actualización de usuario
 * Todos los campos son opcionales
 */
export interface IUpdateUserRequest {
  nombre?: string;
  email?: string;
  password?: string;
  direccion?: string;
  ciudad?: string;
  cp?: string;
}