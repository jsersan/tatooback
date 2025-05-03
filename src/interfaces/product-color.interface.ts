// src/interfaces/product-color.interface.ts
export interface IProductColor {
    id?: number;
    product_id: number;
    color_id: number;
    createdAt?: Date;
    updatedAt?: Date;
  }