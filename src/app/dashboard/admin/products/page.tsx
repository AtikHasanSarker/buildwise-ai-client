"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Eye,
} from "lucide-react";
import { Card, Button, Modal, Badge, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";
import { type Product } from "@/lib/products";

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: null;
}

const CATEGORIES = [
  "All",
  "CPU",
  "GPU",
  "Motherboard",
  "RAM",
  "SSD",
  "HDD",
  "PSU",
  "Case",
  "Cooler",
];

async function fetchProducts(
  page: number,
  limit: number,
  search: string,
  category: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (category && category !== "All") params.set("category", category);
  const res = await apiClient.get<Envelope<ProductsResponse>>(
    `/products?${params.toString()}`
  );
  return res.data.data;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", page, search, category],
    queryFn: () => fetchProducts(page, limit, search, category),
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      showToast("success", "Product deleted successfully");
      setDeleteProduct(null);
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to delete product");
    },
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Manage Products
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {data ? `${data.total} products total` : "Loading..."}
          </p>
        </div>
        <Link href="/dashboard/admin/products/new">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Product
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card hover={false} padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button variant="secondary" size="md" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div variants={item}>
        <Card hover={false} padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                    Brand
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Rating
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton width={40} height={40} shape="rounded" />
                          <Skeleton width={120} height={14} shape="rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Skeleton width={60} height={20} shape="rounded" />
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <Skeleton width={80} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={60} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Skeleton width={40} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Skeleton width={60} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={60} height={14} shape="rounded" />
                      </td>
                    </tr>
                  ))
                ) : data?.products && data.products.length > 0 ? (
                  data.products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-text-secondary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-text-secondary md:hidden">
                              {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Badge variant="default">{product.category}</Badge>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-text-secondary">
                          {product.brand}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-text-primary font-mono">
                          ${product.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`text-sm ${
                            product.stock > 0 ? "text-success" : "text-error"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                          <span className="text-sm text-text-secondary">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteProduct(product)}
                            className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <Package className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">
                        No products found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-text-secondary">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="text-sm text-text-secondary px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete Product Modal */}
      <Modal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Delete Product"
      >
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-text-primary">
            {deleteProduct?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteProduct(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (deleteProduct) {
                deleteMutation.mutate(deleteProduct.id);
              }
            }}
            className="bg-error hover:bg-error/90 text-white"
          >
            Delete Product
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
