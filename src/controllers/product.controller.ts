/**
 * Controlador de Productos
 * Maneja la lógica de negocio para operaciones relacionadas con productos
 */
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import db from '../models';
import { IProduct } from '../interfaces/product.interface';
import { Op } from 'sequelize';

// Referencias a los modelos necesarios
const Product = db.Product;
const ProductColor = db.ProductColor;
const Category = db.Category;

/**
 * Controlador de productos
 */
const productController = {
  /**
   * Obtiene todos los productos (con filtro opcional por categoría)
   * GET /api/productos
   * GET /api/productos?categoria=:id
   */
  index: async (req: Request, res: Response): Promise<Response> => {
    try {
      // Parámetros de consulta opcionales
      const categoriaId = req.query.categoria ? parseInt(req.query.categoria as string) : null;

      // Construir cláusula where según filtros
      let whereClause: any = {};

      if (categoriaId) {
        whereClause.category_id = categoriaId;  // Actualizado de categoria a category_id
      }

      // Buscar productos con filtros y relaciones
      const products = await Product.findAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',  // Actualizado de categoryInfo a category
            attributes: ['id', 'nombre']
          }
        ],
        order: [['nombre', 'ASC']] // Ordenar alfabéticamente
      });

      // Mapear los productos para incluir carpetaimg automáticamente
      const productsJson = products.map((product: any) => product.toJSON());

      return res.json(productsJson);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener productos' });
    }
  },

  /**
   * Busca productos por término
   * GET /api/productos/search?q=:term
   */
  search: async (req: Request, res: Response): Promise<Response> => {
    try {
      const term = req.query.q as string;

      if (!term) {
        return res.status(400).json({ message: 'Término de búsqueda requerido' });
      }

      // Buscar productos que coincidan con el término en nombre o descripción
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${term}%` } },
            { descripcion: { [Op.like]: `%${term}%` } }
          ]
        },
        include: [
          {
            model: Category,
            as: 'category',  // Actualizado de categoryInfo a category
            attributes: ['id', 'nombre']
          }
        ],
        order: [['nombre', 'ASC']] // Ordenar alfabéticamente
      });

      // Mapear los productos para incluir carpetaimg automáticamente
      const productsJson = products.map((product: any) => product.toJSON());

      return res.json(productsJson);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al buscar productos' });
    }
  },

  /**
   * Obtiene un producto específico por ID
   * GET /api/productos/:id
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);

      // Buscar producto por ID con relaciones
      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',  // Actualizado de categoryInfo a category
            attributes: ['id', 'nombre']
          }
        ]
      });

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      return res.json(product.toJSON());
    } catch (err) {
      console.error('Error al obtener producto:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener el producto' });
    }
  },

  /**
   * Obtiene productos por categoría
   * GET /api/productos/categoria/:categoryId
   */
  getProductsByCategory: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.params;
      
      const products = await Product.findAll({
        where: { category_id: categoryId },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'nombre']
        }]
      });

      // Mapear los productos para incluir carpetaimg automáticamente
      const productsJson = products.map((product: any) => product.toJSON());

      console.log(`Productos encontrados para categoría ${categoryId}: ${productsJson.length}`);
      
      return res.status(200).json(productsJson);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error al obtener productos por categoría' });
    }
  },

  /**
   * Obtiene colores disponibles para un producto
   * GET /api/productos/:id/colores
   */
  getColors: async (req: Request, res: Response): Promise<Response> => {
    try {
      const productId = parseInt(req.params.id);

      // Verificar si el producto existe
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Obtener colores asociados con imágenes
      const colors = await ProductColor.findAll({
        where: { product_id: productId },  // Actualizado de idprod a product_id
        order: [['color', 'ASC']] // Ordenar alfabéticamente
      });

      // Si no hay colores definidos, crear algunos predeterminados
      if (colors.length === 0) {
        const productData = product.get();

        // Colores predeterminados basados en el tipo de producto
        const defaultColors = [];
        const productName = (productData.nombre as string).toLowerCase();

        if (productName.includes('túnel') || productName.includes('tunel') ||
          productName.includes('plug') || productName.includes('dilat') ||
          productName.includes('expander')) {
          defaultColors.push(
            { color: 'negro', imagen: productData.imagen },
            { color: 'plateado', imagen: productData.imagen },
            { color: 'dorado', imagen: productData.imagen }
          );
        } else if (productName.includes('barbell') || productName.includes('piercing')) {
          defaultColors.push(
            { color: 'plateado', imagen: productData.imagen },
            { color: 'negro', imagen: productData.imagen },
            { color: 'dorado', imagen: productData.imagen }
          );
        } else {
          defaultColors.push(
            { color: 'negro', imagen: productData.imagen },
            { color: 'plateado', imagen: productData.imagen }
          );
        }

        // Devolver colores predeterminados sin guardarlos en la base de datos
        return res.json(defaultColors);
      }

      // Preparar respuesta con los colores e imágenes correspondientes
      const colorResponse = colors.map((color: any) => {
        const colorData = color.get();
        return {
          color: colorData.color,
          imagen: colorData.imagen
        };
      });

      return res.json(colorResponse);
    } catch (err) {
      console.error('Error al obtener colores:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener colores del producto' });
    }
  },

  /**
   * Crea un nuevo producto
   * POST /api/productos
   */
  store: async (req: Request, res: Response): Promise<Response> => {
    try {
      const productData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        category_id: req.body.categoria || req.body.category_id,
        imagen: req.body.imagen
      };

      // Verificar que la categoría existe
      const category = await Category.findByPk(productData.category_id);

      if (!category) {
        return res.status(400).json({ message: 'La categoría seleccionada no existe' });
      }

      // Crear el producto
      const product = await Product.create(productData);

      return res.status(201).json(product.toJSON());
    } catch (err) {
      console.error('Error al crear producto:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al crear el producto' });
    }
  },

  /**
   * Actualiza un producto existente
   * PUT /api/productos/:id
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const productData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        category_id: req.body.categoria || req.body.category_id,
        imagen: req.body.imagen
      };

      // Verificar si el producto existe
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Si se cambia la categoría, verificar que exista
      if (productData.category_id) {
        const category = await Category.findByPk(productData.category_id);

        if (!category) {
          return res.status(400).json({ message: 'La categoría seleccionada no existe' });
        }
      }

      // Actualizar el producto
      await product.update(productData);

      return res.json(product.toJSON());
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  },

  /**
   * Elimina un producto
   * DELETE /api/productos/:id
   */
  destroy: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);

      // Verificar si el producto existe
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Eliminar colores asociados
      await ProductColor.destroy({
        where: { product_id: id }  // Actualizado de idprod a product_id
      });

      // Eliminar el producto
      await product.destroy();

      return res.json({ message: 'Producto eliminado con éxito' });
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  },

  /**
   * Añade un color a un producto
   * POST /api/productos/:id/colores
   */
  addColor: async (req: Request, res: Response): Promise<Response> => {
    try {
      const productId = parseInt(req.params.id);
      const { color, imagen } = req.body;

      // Verificar si el producto existe
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Verificar que no exista ya este color para el producto
      const existingColor = await ProductColor.findOne({
        where: {
          product_id: productId,  // Actualizado de idprod a product_id
          color: color
        }
      });

      if (existingColor) {
        return res.status(400).json({ message: 'Ya existe este color para el producto' });
      }

      // Crear el color con la imagen específica
      const productColor = await ProductColor.create({
        product_id: productId,  // Actualizado de idprod a product_id
        color,
        imagen,
        color_id: 0  // Valor predeterminado
      });

      return res.status(201).json(productColor);
    } catch (err) {
      console.error('Error al añadir color:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al añadir color al producto' });
    }
  },

  /**
   * Sube imágenes para un producto
   * POST /api/productos/:id/images
   * (Requiere middleware upload de Multer)
   */
  uploadImages: async (req: Request, res: Response): Promise<Response> => {
    try {
      // Req.files es provisto por multer
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: 'No se han subido archivos' });
      }

      const productId = parseInt(req.params.id);

      // Verificar si el producto existe
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Procesar archivos subidos
      const uploadedFiles = req.files as Express.Multer.File[];
      const fileDetails = uploadedFiles.map(file => ({
        filename: file.filename,
        path: file.path.replace(/\\/g, '/').split('uploads/')[1] // Obtener ruta relativa
      }));

      // Si es la primera imagen, actualizar el campo imagen del producto
      if (fileDetails.length > 0 && !product.get('imagen')) {
        await product.update({ imagen: fileDetails[0].filename });
      }

      return res.status(200).json({
        message: 'Imágenes subidas con éxito',
        files: fileDetails
      });
    } catch (err) {
      console.error('Error al subir imágenes:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al subir imágenes' });
    }
  },

  /**
   * Obtener imagen del producto
   * GET /images/:categoria/:imagen
   */
  getImage: (req: Request, res: Response): void => {
    try {
      const { categoria, imagen } = req.params;
      const imagePath = path.join(__dirname, '../../public/images', categoria, imagen);

      if (!fs.existsSync(imagePath)) {
        res.status(404).json({ message: 'Imagen no encontrada' });
        return;
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      res.status(500).json({ 
        message: 'Error al obtener imagen', 
        error: (error as Error).message 
      });
    }
  }
};

export default productController;