export interface IProduct {
  id?: number;          // ID único (opcional para nuevos productos)
  nombre: string;       // Nombre del producto
  descripcion: string;  // Descripción detallada
  precio: number;       // Precio en euros
  carpetaimg: string;   // Carpeta donde se almacenan las imágenes
  imagen: string;       // Nombre de archivo de la imagen principal
  categoria: number;    // ID de la categoría a la que pertenece
}

export interface IProductColor {
  id?: number;          // ID único
  idprod: number;       // ID del producto al que pertenece
  color: string;        // Nombre del color
  imagen: string;       // Nombre de archivo de la imagen para este color
}

export interface IProductSearchResult extends IProduct {
  categoryName?: string;  // Nombre de la categoría
  colorsCount?: number;   // Número de colores disponibles
}

export interface IProductFormData {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number | string; // Permite recibir precio como string desde formularios
  carpetaimg: string;
  categoria: number | string; // Permite recibir categoría como string desde formularios
}