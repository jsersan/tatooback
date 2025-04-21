-- Script de inicialización de la base de datos para TatooDenda
-- Este script crea la base de datos, tablas y algunos datos iniciales

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS tatoodenda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE tatoodenda_db;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  cp VARCHAR(10) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  padre INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoria_padre (padre)
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  carpetaimg VARCHAR(100) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  categoria INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria) REFERENCES categories(id),
  INDEX idx_producto_categoria (categoria),
  INDEX idx_producto_nombre (nombre)
);

-- Crear tabla de colores de productos
CREATE TABLE IF NOT EXISTS product_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idprod INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idprod) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_color (idprod, color)
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  iduser INT NOT NULL,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (iduser) REFERENCES users(id),
  INDEX idx_pedido_usuario (iduser),
  INDEX idx_pedido_fecha (fecha)
);

-- Crear tabla de líneas de pedido
CREATE TABLE IF NOT EXISTS order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idpedido INT NOT NULL,
  idprod INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  cant INT NOT NULL,
  nombre VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idpedido) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (idprod) REFERENCES products(id),
  INDEX idx_linea_pedido (idpedido),
  INDEX idx_linea_producto (idprod)
);

-- Insertar usuario administrador predeterminado
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (username, password, nombre, email, direccion, ciudad, cp, role)
VALUES (
  'admin',
  '$2a$10$rrCQGgC8MxyZY/SVnDlWVuSZ0q/BClS9sBhUb9URdWlLBcWCsZk0O',
  'Administrador',
  'admin@tatoodenda.com',
  'Calle Admin 1',
  'Madrid',
  '28001',
  'admin'
) ON DUPLICATE KEY UPDATE username = 'admin';

-- Insertar algunas categorías iniciales
INSERT INTO categories (id, nombre, padre) VALUES
(1, 'Tatuajes', 1),
(2, 'Piercings', 2),
(3, 'Accesorios', 3),
(4, 'Tatuajes Pequeños', 1),
(5, 'Tatuajes Medianos', 1),
(6, 'Tatuajes Grandes', 1),
(7, 'Piercings Oreja', 2),
(8, 'Piercings Nariz', 2),
(9, 'Piercings Labio', 2),
(10, 'Joyería', 3)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), padre = VALUES(padre);

-- Insertar algunos productos de ejemplo
INSERT INTO products (nombre, descripcion, precio, carpetaimg, imagen, categoria) VALUES
(
  'Tatuaje Tribal',
  'Tatuaje de estilo tribal con diseños geométricos. Ideal para brazos y piernas.',
  75.99,
  'tribal',
  'tribal-main.jpg',
  4
),
(
  'Tatuaje Maorí',
  'Tatuaje con motivos de la cultura maorí. Perfecto para expresar fortaleza y tradición.',
  120.50,
  'maori',
  'maori-main.jpg',
  5
),
(
  'Piercing Helix',
  'Piercing para el cartílago de la oreja. Incluye joya de acero quirúrgico.',
  25.00,
  'helix',
  'helix-main.jpg',
  7
),
(
  'Piercing Septum',
  'Piercing para el tabique nasal. Incluye aro de titanio hipoalergénico.',
  30.00,
  'septum',
  'septum-main.jpg',
  8
),
(
  'Expansor Oreja',
  'Expansor de lóbulo de oreja. Material acrílico transparente. Tamaño 8mm.',
  18.50,
  'expansor',
  'expansor-main.jpg',
  10
);

-- Insertar algunos colores para los productos
INSERT INTO product_colors (idprod, color, imagen) VALUES
(1, 'Negro', 'tribal-negro.jpg'),
(1, 'Azul', 'tribal-azul.jpg'),
(2, 'Negro', 'maori-negro.jpg'),
(2, 'Rojo', 'maori-rojo.jpg'),
(3, 'Plata', 'helix-plata.jpg'),
(3, 'Oro', 'helix-oro.jpg'),
(4, 'Plata', 'septum-plata.jpg'),
(4, 'Negro', 'septum-negro.jpg'),
(5, 'Transparente', 'expansor-transparente.jpg'),
(5, 'Negro', 'expansor-negro.jpg');