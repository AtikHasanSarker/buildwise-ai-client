"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";
import { getCategories, type Product } from "@/lib/products";

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Product;
  productId?: string;
}

interface FormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  description: string;
  images: string[];
  specifications: Record<string, string>;
  stock: string;
}

interface FormErrors {
  name?: string;
  brand?: string;
  category?: string;
  price?: string;
  description?: string;
  stock?: string;
}

const CATEGORIES = [
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

export function ProductForm({ mode, initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    price: initialData?.price?.toString() || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
    specifications: initialData?.specifications
      ? Object.fromEntries(
          Object.entries(initialData.specifications).map(([k, v]) => [k, String(v)])
        )
      : {},
    stock: initialData?.stock?.toString() || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        name: data.name,
        brand: data.brand,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        images: data.images,
        specifications: Object.fromEntries(
          Object.entries(data.specifications).map(([k, v]) => [k, v])
        ),
        stock: parseInt(data.stock, 10),
      };
      const res = await apiClient.post("/products", payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("success", "Product created successfully");
      router.push("/dashboard/admin/products");
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        name: data.name,
        brand: data.brand,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        images: data.images,
        specifications: Object.fromEntries(
          Object.entries(data.specifications).map(([k, v]) => [k, v])
        ),
        stock: parseInt(data.stock, 10),
      };
      const res = await apiClient.put(`/products/${productId}`, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("success", "Product updated successfully");
      router.push("/dashboard/admin/products");
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to update product");
    },
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.stock || parseInt(formData.stock, 10) < 0)
      newErrors.stock = "Valid stock quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (mode === "add") {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const handleAddImage = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      showToast("error", "Please enter a valid URL starting with http(s)://");
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [specKey.trim()]: specValue.trim() },
    }));
    setSpecKey("");
    setSpecValue("");
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {mode === "add"
              ? "Fill in the details to add a new product"
              : `Editing: ${initialData?.name || "Product"}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card hover={false} padding="lg">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              placeholder="e.g. AMD Ryzen 9 7950X"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={errors.name}
            />
            <Input
              label="Brand"
              placeholder="e.g. AMD, Intel, NVIDIA"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value }))
              }
              error={errors.brand}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className={`
                  w-full rounded-lg border bg-surface-2 px-3 py-2.5
                  text-sm text-text-primary outline-none
                  transition-all duration-200
                  ${
                    errors.category
                      ? "border-error focus:border-error focus:ring-1 focus:ring-error/30"
                      : "border-border hover:border-text-secondary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }
                `}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-error">{errors.category}</p>
              )}
            </div>
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              error={errors.price}
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              placeholder="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stock: e.target.value }))
              }
              error={errors.stock}
            />
          </div>
          <div className="mt-6">
            <Textarea
              label="Description"
              placeholder="Describe the product features, specifications, etc."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={errors.description}
              rows={4}
            />
          </div>
        </Card>

        {/* Images */}
        <Card hover={false} padding="lg">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Product Images
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              placeholder="Paste image URL and click Add"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddImage}
            >
              Add
            </Button>
          </div>
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.images.map((url, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-surface-2"
                >
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2394a3b8' font-size='12'%3EBroken%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-8">
              No images added yet. Paste an image URL above and click Add.
            </p>
          )}
        </Card>

        {/* Specifications */}
        <Card hover={false} padding="lg">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Specifications
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Key (e.g. socket)"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSpec();
                }
              }}
              className="w-1/3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="Value (e.g. AM5)"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSpec();
                }
              }}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddSpec}
            >
              Add
            </Button>
          </div>
          {Object.keys(formData.specifications).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-2"
                >
                  <span className="text-sm font-medium text-text-primary w-1/3 truncate">
                    {key}
                  </span>
                  <span className="text-sm text-text-secondary flex-1 truncate">
                    {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(key)}
                    className="p-1 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-4">
              No specifications added yet.
            </p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={
              isSubmitting ? undefined : mode === "add" ? (
                <Plus className="w-4 h-4" />
              ) : undefined
            }
          >
            {mode === "add" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
