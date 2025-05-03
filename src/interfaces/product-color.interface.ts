// src/interfaces/product-color.interface.ts
export interface IProductColor {
    id?: number;
    product_id: number;
    color_id: number;
    color: string;    // Agregado
    imagen: string;   // Agregado
    createdAt?: Date;
    updatedAt?: Date;
  }