import { ProductWithPrices } from "@/types/products";

export async function fetchProducts(): Promise<ProductWithPrices[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${baseUrl}/products/with_batches/`)
    if (!response.ok) {
        throw new Error('Failed to fetch products')
    }
    const data = await response.json()
    return data
}
