import apiClient from "./api-client";

/* ─── Types ─── */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  specifications: Record<string, string | number>;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "rating" | "newest";
}

export interface Review {
  _id: string;
  user: { id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  total: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: unknown;
}

/* ─── API calls ─── */

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  });
  const res = await apiClient.get<Envelope<ProductsResponse>>(
    `/products?${params.toString()}`
  );
  return res.data.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await apiClient.get<Envelope<{ product: Product }>>(
    `/products/${id}`
  );
  return res.data.data.product;
}

export async function getCategories(): Promise<string[]> {
  const res = await apiClient.get<Envelope<{ categories: string[] }>>(
    "/products/categories"
  );
  return res.data.data.categories;
}

export async function getReviews(
  productId: string,
  page = 1,
  limit = 5
): Promise<ReviewsResponse> {
  const res = await apiClient.get<Envelope<ReviewsResponse>>(
    `/products/${productId}/reviews?page=${page}&limit=${limit}`
  );
  return res.data.data;
}

export async function postReview(
  productId: string,
  payload: { rating: number; comment: string }
): Promise<Review> {
  const res = await apiClient.post<Envelope<{ review: Review }>>(
    `/products/${productId}/reviews`,
    payload,
    { withCredentials: true }
  );
  return res.data.data.review;
}
