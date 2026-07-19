"use client";

import { X, RotateCcw } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import type { ProductFilters, Category } from "@/lib/products";

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onClose?: () => void;
}

const SORT_OPTIONS: { value: ProductFilters["sort"]; label: string }[] = [
  { value: undefined, label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $500", min: undefined, max: 500 },
  { label: "$500 – $1000", min: 500, max: 1000 },
  { label: "$1000 – $2000", min: 1000, max: 2000 },
  { label: "$2000+", min: 2000, max: undefined },
];

export function ProductFiltersPanel({
  categories,
  filters,
  onFilterChange,
  onClose,
}: ProductFiltersProps) {
  function update(key: keyof ProductFilters, value: unknown) {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  }

  function clearFilters() {
    onFilterChange({ page: 1, limit: filters.limit });
  }

  const hasActiveFilters =
    filters.category || filters.brand || filters.minPrice || filters.maxPrice;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort (shown on mobile in filter panel too) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Sort by</label>
        <select
          value={filters.sort || ""}
          onChange={(e) =>
            update(
              "sort",
              (e.target.value as ProductFilters["sort"]) || undefined
            )
          }
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value || ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">
          Category
        </label>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() =>
                update(
                  "category",
                  filters.category === cat.name ? undefined : cat.name
                )
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                filters.category === cat.name
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${
                  filters.category === cat.name
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {filters.category === cat.name && (
                  <svg
                    className="w-2 h-2 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">
          Price Range
        </label>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map((range) => {
            const isActive =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    minPrice: range.min,
                    maxPrice: range.max,
                    page: 1,
                  })
                }
                className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="accent">
              {filters.category}
              <button
                onClick={() => update("category", undefined)}
                className="ml-1 hover:text-white"
              >
                ×
              </button>
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="accent">
              ${filters.minPrice || 0} – ${filters.maxPrice || "∞"}
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    minPrice: undefined,
                    maxPrice: undefined,
                    page: 1,
                  })
                }
                className="ml-1 hover:text-white"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Mobile close */}
      {onClose && (
        <Button
          variant="primary"
          className="w-full md:hidden"
          onClick={onClose}
        >
          Show Results
        </Button>
      )}
    </div>
  );
}
