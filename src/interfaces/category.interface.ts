export interface ICategory {
  id?: number;      // ID único (opcional para nuevas categorías)
  nombre: string;   // Nombre de la categoría
  padre: number;    // ID de la categoría padre (-1 o mismo ID para categorías principales)
}

export interface ICategoryFormData {
  id?: number;
  nombre: string;
  padre: number | string; // 'sin' o ID de la categoría padre
}

export interface ICategoryWithDetails extends ICategory {
  subcategories?: ICategory[]; // Subcategorías
  products?: number;           // Número de productos en esta categoría
}