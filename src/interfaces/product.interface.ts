// src/interfaces/product.interface.ts
export interface IProduct {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  category_id: number;  // <- Cambiado de 'categoria' a 'category_id'
  imagen: string;
  carpetaimg?: string;  // <- Hacerlo opcional
  category?: any;
  createdAt?: Date;
  updatedAt?: Date;
}