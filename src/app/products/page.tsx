"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Button, ProductCardSkeleton } from "@/components/ui";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFiltersPanel } from "@/components/products/ProductFilters";
import { getProducts, getCategories, type ProductFilters } from "@/lib/products";

function buildFilters(searchParams: URLSearchParams): ProductFilters {
  return {
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    search: searchParams.get("search") || undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) || undefined,
  };
}

function ProductsContent() {
  useEffect(() => {
    document.title = "Explore Products — BuildWise AI";
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => buildFilters(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const updateFilters = useCallback(
    (newFilters: ProductFilters) => {
      const params = new URLSearchParams();
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.brand) params.set("brand", newFilters.brand);
      if (newFilters.minPrice) params.set("minPrice", String(newFilters.minPrice));
      if (newFilters.maxPrice) params.set("maxPrice", String(newFilters.maxPrice));
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.sort) params.set("sort", newFilters.sort);
      if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData || [];
  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero bar */}
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Explore Products
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Find the perfect components for your build
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10">
        {/* Search + controls bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search components"
              className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-secondary/60"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className="md:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              Filters
            </Button>

            {/* Sort dropdown (desktop) */}
            <select
              value={filters.sort || ""}
              onChange={(e) =>
                updateFilters({
                  ...filters,
                  sort: (e.target.value as ProductFilters["sort"]) || undefined,
                  page: 1,
                })
              }
              aria-label="Sort products"
              className="hidden md:block rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            >
              <option value="">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:text-text-primary"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:text-text-primary"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 rounded-xl bg-surface border border-border p-5 shadow-soft">
              <ProductFiltersPanel
                categories={categories}
                filters={filters}
                onFilterChange={updateFilters}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            {productsData && (
              <p className="text-sm text-text-secondary mb-4">
                {productsData.total} product{productsData.total !== 1 ? "s" : ""} found
              </p>
            )}

            {isLoading ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  No products found
                </h3>
                <p className="text-sm text-text-secondary max-w-sm mb-4">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ page: 1, limit: 12 });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        updateFilters({ ...filters, page: currentPage - 1 })
                      }
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "primary" : "ghost"}
                            size="sm"
                            onClick={() =>
                              updateFilters({ ...filters, page })
                            }
                          >
                            {page}
                          </Button>
                        );
                      }
                      if (Math.abs(page - currentPage) === 2) {
                        return (
                          <span key={`dots-${page}`} className="text-text-secondary px-1">
                            …
                          </span>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        updateFilters({ ...filters, page: currentPage + 1 })
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <ProductFiltersPanel
              categories={categories}
              filters={filters}
              onFilterChange={(f) => {
                updateFilters(f);
                setMobileFiltersOpen(false);
              }}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg">
          <div className="bg-secondary">
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
              <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
