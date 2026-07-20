"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBuild } from "@/lib/build-context";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/lib/products";

export function useAddToBuild() {
  const ctx = useBuild();
  const { showToast } = useToast();
  const router = useRouter();

  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = useCallback(
    (product: Product) => {
      if (product.stock === 0) {
        showToast("error", "This product is out of stock");
        return;
      }

      if (ctx.isInBuild(product._id)) {
        showToast("info", "This product is already in your build");
        return;
      }

      const existing = ctx.items.find((i) => i.category === product.category);
      if (existing) {
        setPendingProduct(product);
        return;
      }

      setAdding(true);
      setTimeout(() => {
        ctx.addToBuild(product);
        setAdding(false);
        showToast("success", `${product.name} added to build`);
      }, 300);
    },
    [ctx, showToast]
  );

  const confirmReplace = useCallback(() => {
    if (!pendingProduct) return;
    const product = pendingProduct;
    setPendingProduct(null);
    setAdding(true);
    setTimeout(() => {
      ctx.replaceInBuild(product);
      setAdding(false);
      showToast("success", `${product.name} replaced in build`);
    }, 300);
  }, [pendingProduct, ctx, showToast]);

  const cancelReplace = useCallback(() => {
    setPendingProduct(null);
  }, []);

  const goToBuild = useCallback(() => {
    router.push("/builds/current");
  }, [router]);

  return {
    handleAdd,
    adding,
    pendingProduct,
    confirmReplace,
    cancelReplace,
    goToBuild,
  };
}
