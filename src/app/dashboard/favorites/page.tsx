"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import apiClient from "@/lib/api-client";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: null;
}

async function fetchFavorites(): Promise<Product[]> {
  const res = await apiClient.get("/favorites");
  return (res as unknown as Envelope<{ products: Product[] }>).data?.products ?? [];
}

export default function FavoritesPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Favorites</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface shadow-soft p-4 space-y-3">
              <Skeleton width="100%" height={160} shape="rounded" />
              <Skeleton width="70%" height={16} shape="rounded" />
              <Skeleton width="40%" height={14} shape="rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Favorites</h1>
      {!products || products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-text-secondary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            No favorites yet
          </h2>
          <p className="text-sm text-text-secondary max-w-sm">
            Browse products and tap the heart icon to add items to your favorites.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {products.map((product) => (
            <Card key={product._id} padding="none" className="overflow-hidden">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-xs text-text-secondary">{product.brand}</p>
                <h3 className="text-sm font-semibold text-text-primary truncate mt-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-bold font-mono text-text-primary">
                    ${product.price.toLocaleString()}
                  </span>
                  <a
                    href={`/products/${product._id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
