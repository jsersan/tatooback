/**
 * Controlador de Categorías
 * Maneja la lógica de negocio para operaciones relacionadas con categorías
 */
import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';
import { ICategory } from '../interfaces/category.interface';

// Referencia al modelo Category
const Category = db.Category;
const Product = db.Product;

/**
 * Controlador de categorías
 */
const categoryController = {
  /**
   * Obtiene todas las categorías
   * GET /api/categorias
   */
  findAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      // Buscar todas las categorías
      const categoria = await Category.findAll({
        order: [['nombre', 'ASC']] // Ordenar alfabéticamente
      });
      
      return res.json(categoria);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener categorías' });
    }
  },
  
  /**
   * Obtiene una categoría específica por ID
   * GET /api/categorias/:id
   */
  findOne: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar la categoría por ID
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'childCategories', // Incluir subcategorías
            attributes: ['id', 'nombre']
          }
        ]
      });
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Contar productos en esta categoría
      const productsCount = await Product.count({
        where: { categoria: id }
      });
      
      // Preparar respuesta con datos adicionales
      const response = {
        ...category.toJSON(),
        productsCount
      };
      
      return res.json(response);
    } catch (err) {
      console.error('Error al obtener categoría:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener la categoría' });
    }
  },
  
  /**
   * Crea una nueva categoría
   * POST /api/categorias
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      // Modificamos esto para permitir el string 'sin'
      const categoryData = req.body as { 
        nombre: string;
        padre: number | string; // Permitir que padre sea number o string
      };
      
      // Si se especifica "sin" como padre, establecer padre = -1
      if (categoryData.padre === 'sin') {
        categoryData.padre = -1;
      }
      
      // Crear nueva categoría (asegurando que padre es number)
      const category = await Category.create({
        nombre: categoryData.nombre,
        padre: typeof categoryData.padre === 'string' 
          ? parseInt(categoryData.padre) 
          : categoryData.padre
      });
      
      // Si es una categoría principal (sin padre), actualizar su valor de padre a su propio ID
      if ((categoryData.padre as number) === -1) {
        await category.update({ padre: category.get('id') });
      }
      
      return res.status(201).json(category);
    } catch (err) {
      console.error('Error al crear categoría:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al crear la categoría' });
    }
  },
  
  /**
   * Actualiza una categoría existente
   * PUT /api/categorias/:id
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      
      // Mismo enfoque que en create para permitir 'sin'
      const categoryData = req.body as {
        nombre: string;
        padre: number | string;
      };
      
      // Si se especifica "sin" como padre, establecer padre = id (será la propia categoría)
      if (categoryData.padre === 'sin') {
        categoryData.padre = id;
      }
      
      // Verificar si la categoría existe
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar que no se genere un ciclo (una categoría no puede ser su propia subcategoría)
      if (categoryData.padre !== id && typeof categoryData.padre === 'number') {
        // Obtener todas las subcategorías
        const subcategories = await Category.findAll({
          where: { padre: id }
        });
        
        // Verificar que no se cree un ciclo
        if (subcategories.some((subcat: any) => subcat.get('id') === categoryData.padre)) {
          return res.status(400).json({
            message: 'No se puede establecer como padre una de sus propias subcategorías'
          });
        }
      }
      
      // Actualizar la categoría
      await category.update({
        nombre: categoryData.nombre,
        padre: typeof categoryData.padre === 'string' 
          ? parseInt(categoryData.padre) 
          : categoryData.padre
      });
      
      return res.json(category);
    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al actualizar la categoría' });
    }
  },
  
  /**
   * Elimina una categoría
   * DELETE /api/categorias/:id
   */
  delete: async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar si la categoría existe
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si hay subcategorías que dependen de esta categoría
      const subcategories = await Category.findAll({
        where: {
          padre: id,
          id: { [Op.ne]: id } // Excluir a sí misma (para categorías principales)
        }
      });
      
      if (subcategories.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar la categoría porque tiene subcategorías asociadas'
        });
      }
      
      // Verificar si hay productos asociados a esta categoría
      const productsCount = await Product.count({
        where: { categoria: id }
      });
      
      if (productsCount > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar la categoría porque tiene productos asociados'
        });
      }
      
      // Eliminar la categoría
      await category.destroy();
      
      return res.json({ message: 'Categoría eliminada con éxito' });
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al eliminar la categoría' });
    }
  }
};

export default categoryController;