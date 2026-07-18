"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManageProductsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/products");
  }, [router]);

  return null;
}
