"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { Skeleton, Button } from "@/components/ui";
import { getProduct } from "@/lib/products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton width={40} height={40} shape="rounded" />
          <div className="space-y-2">
            <Skeleton width={200} height={24} shape="rounded" />
            <Skeleton width={300} height={14} shape="rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton width="100%" height={200} shape="rounded" />
          <Skeleton width="100%" height={150} shape="rounded" />
          <Skeleton width="100%" height={150} shape="rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-text-secondary mb-4">Product not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <ProductForm mode="edit" initialData={product} productId={id} />;
}
