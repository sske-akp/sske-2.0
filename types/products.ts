export interface Product {
  item: string;
  hsncode: string;
  unit: string;
  brand_id: number;
  category_id: number;
  disabled: boolean;
  id: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface ProductWithPrices {
  product_name: string;
  price_per_unit: number;
  quantity: number;
}

// Example usage:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exampleProduct: Product = {
  item: "Implemented bifurcated intranet",
  hsncode: "526074",
  unit: "Kg",
  brand_id: 44,
  category_id: 79,
  disabled: false,
  id: 1,
  created_at: "2025-01-29T10:48:51.611644",
  updated_at: "2025-06-01T02:58:34.629732",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exampleProductWithPrice: ProductWithPrices = {
  product_name: "Ergonomic stable groupware",
  quantity: 548,
  price_per_unit: 722.07,
};
