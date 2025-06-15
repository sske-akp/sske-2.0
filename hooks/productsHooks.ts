import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/productsServices";
import { ProductWithPrices } from "@/types/products";

export function useProducts() {
  return useQuery<ProductWithPrices[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
