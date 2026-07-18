"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Card, Badge, Skeleton } from "@/components/ui";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Card hover padding="none" className="overflow-hidden group">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-square focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] rounded-t-xl"
        aria-label={`View ${product.name}`}
      >
        {!imgLoaded && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-2 flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3">
          <Badge variant="accent">{product.category}</Badge>
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <Link
          href={`/products/${product.id}`}
          className="focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
        >
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-text-secondary">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.rating)
                    ? "text-accent fill-accent"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold font-mono text-text-primary">
            ${product.price.toLocaleString()}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              product.stock > 0 ? "bg-success" : "bg-error"
            }`}
            title={product.stock > 0 ? "In stock" : "Out of stock"}
            aria-label={product.stock > 0 ? "In stock" : "Out of stock"}
          />
        </div>

        {/* Actions — visible on hover desktop, always on mobile */}
        <div className="flex gap-2 pt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </Link>
          <button
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-primary-hover hover:shadow-glow-primary transition-all disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Build
          </button>
        </div>
      </div>
    </Card>
  );
}
