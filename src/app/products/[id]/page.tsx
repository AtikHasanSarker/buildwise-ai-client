"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
} from "lucide-react";
import { Button, Badge, Skeleton, TextLineSkeleton } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { useBuild } from "@/lib/build-context";
import { ReplaceConfirmModal } from "@/components/ReplaceConfirmModal";
import {
  getProduct,
  getReviews,
  postReview,
  getProducts,
  type Product,
} from "@/lib/products";

/* ─── Tabs ─── */

type Tab = "description" | "specs" | "reviews";

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] rounded-t ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="text-xs bg-surface-2 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Rating Stars ─── */

function RatingStars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${s} ${
            i < Math.round(rating)
              ? "text-accent fill-accent"
              : "text-border"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Review Form ─── */

function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const mutation = useMutation({
    mutationFn: () => postReview(productId, { rating, comment }),
    onSuccess: () => {
      showToast("success", "Review submitted!");
      setComment("");
      setRating(5);
      onSuccess();
    },
    onError: (err: Error) => {
      showToast("error", err.message || "Failed to submit review");
    },
  });

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <h4 className="text-sm font-semibold text-text-primary mb-3">
        Write a review
      </h4>
      {/* Star picker */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHoveredStar(s)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(s)}
            aria-label={`Rate ${s} out of 5 stars`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                s <= (hoveredStar || rating)
                  ? "text-accent fill-accent"
                  : "text-border"
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-text-secondary ml-2">{rating}/5</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        aria-label="Review comment"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none min-h-[80px] placeholder:text-text-secondary/60"
        rows={3}
      />
      <div className="flex justify-end mt-3">
        <Button
          size="sm"
          loading={mutation.isPending}
          disabled={!comment.trim()}
          onClick={() => mutation.mutate()}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}

/* ─── Reviews Tab ─── */

function ReviewsTab({
  productId,
  averageRating,
  total,
}: {
  productId: string;
  averageRating: number;
  total: number;
}) {
  const { user } = useAuth();
  const [reviewPage, setReviewPage] = useState(1);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", productId, reviewPage],
    queryFn: () => getReviews(productId, reviewPage, 5),
  });

  const queryClient = useQueryClient();

  // Rating breakdown
  const reviews = reviewsData?.reviews || [];
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { stars, count, pct };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-2 min-w-[160px]">
          <span className="text-4xl font-bold text-text-primary">
            {averageRating.toFixed(1)}
          </span>
          <RatingStars rating={averageRating} />
          <span className="text-xs text-text-secondary mt-1">
            {total} review{total !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {breakdown.map((b) => (
            <div key={b.stars} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-8">{b.stars}★</span>
              <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-6 text-right">
                {b.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review */}
      {user ? (
        <ReviewForm
          productId={productId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
          }}
        />
      ) : (
        <div className="rounded-xl border border-border bg-surface-2 p-4 text-center">
          <p className="text-sm text-text-secondary">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>{" "}
            to write a review
          </p>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton shape="circle" width={36} height={36} />
                <div className="flex-1">
                  <Skeleton width="30%" height={14} shape="rounded" />
                  <Skeleton width="15%" height={10} shape="rounded" className="mt-1" />
                </div>
              </div>
              <TextLineSkeleton lines={2} />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-4">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src={review.user.avatar}
                  name={review.user.name}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {review.user.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-xs text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review pagination */}
      {reviewsData && reviewsData.total > 5 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={reviewPage <= 1}
            onClick={() => setReviewPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {reviewPage} of {Math.ceil(reviewsData.total / 5)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={reviewPage >= Math.ceil(reviewsData.total / 5)}
            onClick={() => setReviewPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Image Gallery ─── */

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const src = images[activeIdx] || "";

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl bg-surface border border-border overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((i) => (i > 0 ? i - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/80 backdrop-blur flex items-center justify-center shadow-soft hover:bg-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i < images.length - 1 ? i + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/80 backdrop-blur flex items-center justify-center shadow-soft hover:bg-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIdx ? "true" : undefined}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                i === activeIdx ? "border-primary" : "border-border hover:border-text-secondary"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Related Products ─── */

function RelatedProducts({ product }: { product: Product }) {
  const { data } = useQuery({
    queryKey: ["products", "related", product.category, product._id],
    queryFn: () =>
      getProducts({ category: product.category, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const related = (data?.products || []).filter(
    (p: Product) => p._id !== product._id
  );
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        You might also like
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {related.map((p) => (
          <Link
            key={p._id}
            href={`/products/${p._id}`}
            className="snap-start shrink-0 w-56 rounded-xl bg-surface border border-border shadow-soft overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all duration-200"
          >
            <div className="relative aspect-square">
              {p.images[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-2 flex items-center justify-center text-text-secondary text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-xs font-medium text-text-primary line-clamp-2 mb-1">
                {p.name}
              </h3>
              <p className="text-sm font-bold font-mono text-text-primary">
                ${p.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Skeleton ─── */

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton width={40} height={12} shape="rounded" />
          <Skeleton width={20} height={12} shape="rounded" />
          <Skeleton width={80} height={12} shape="rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image skeleton */}
          <Skeleton width="100%" height={400} shape="rounded" className="rounded-xl" />
          {/* Details skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton width="40%" height={16} shape="rounded" />
            <Skeleton width="80%" height={28} shape="rounded" />
            <Skeleton width="30%" height={14} shape="rounded" />
            <Skeleton width="50%" height={24} shape="rounded" />
            <div className="h-px bg-border my-2" />
            <Skeleton width="100%" height={100} shape="rounded" />
            <div className="flex gap-3 mt-4">
              <Skeleton width={140} height={44} shape="rounded" className="rounded-full" />
              <Skeleton width={140} height={44} shape="rounded" className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    document.title = "Product Details — BuildWise AI";
  }, []);

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [isFavorited, setIsFavorited] = useState(false);
  const { addToBuild, replaceInBuild, isInBuild, items } = useBuild();
  const { showToast } = useToast();
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  const product = productData;

  const existingItem = product && isInBuild(product._id)
    ? null
    : product
    ? items.find((i) => i.category === product.category)
    : null;

  function handleAddToBuild() {
    if (!product) return;
    if (product.stock === 0) return;

    if (isInBuild(product._id)) {
      showToast("info", "This product is already in your build");
      return;
    }

    if (existingItem) {
      setPendingProduct(product);
      return;
    }

    setAdding(true);
    setTimeout(() => {
      addToBuild(product);
      setAdding(false);
      showToast("success", `${product.name} added to build`);
    }, 300);
  }

  function handleConfirmReplace() {
    if (!pendingProduct) return;
    const prod = pendingProduct;
    setPendingProduct(null);
    setAdding(true);
    setTimeout(() => {
      replaceInBuild(prod);
      setAdding(false);
      showToast("success", `${prod.name} replaced in build`);
    }, 300);
  }

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Product not found
          </h2>
          <Link href="/products" className="text-primary hover:underline text-sm">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-text-primary transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <ImageGallery images={product.images} name={product.name} />

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="accent" className="w-fit mb-3">
              {product.category}
            </Badge>

            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
              {product.name}
            </h1>

            <p className="text-sm text-text-secondary mb-3">{product.brand}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-text-secondary">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold font-mono text-text-primary">
                ${product.price.toLocaleString()}
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-4 h-4" />
              {product.stock > 0 ? (
                <Badge variant="success">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>

            {/* Specs preview */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="rounded-xl border border-border bg-surface-2 p-4 mb-6">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  Key Specifications
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-text-secondary capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button
                variant="primary"
                size="lg"
                icon={
                  adding ? undefined : <ShoppingCart className="w-5 h-5" />
                }
                loading={adding}
                disabled={product.stock === 0}
                className="flex-1"
                onClick={handleAddToBuild}
              >
                {isInBuild(product._id) ? "In Build" : "Add to Build"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={
                  <Heart
                    className={`w-5 h-5 ${isFavorited ? "fill-error text-error" : ""}`}
                  />
                }
                onClick={() => setIsFavorited(!isFavorited)}
              >
                {isFavorited ? "Favorited" : "Favorite"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-border">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === "description"}
              onClick={() => setActiveTab("description")}
            >
              Description
            </TabButton>
            <TabButton
              active={activeTab === "specs"}
              onClick={() => setActiveTab("specs")}
            >
              Specifications
            </TabButton>
            <TabButton
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
              count={product.reviewCount}
            >
              <MessageSquare className="w-4 h-4" />
              Reviews
            </TabButton>
          </div>
        </div>

        {/* Tab content */}
        <div className="py-8">
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl">
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(
                      ([key, value], i) => (
                        <tr
                          key={key}
                          className={
                            i % 2 === 0 ? "bg-surface-2/50" : "bg-surface"
                          }
                        >
                          <td className="px-4 py-3 text-sm font-medium text-text-secondary capitalize border-r border-border w-1/3">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {String(value)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewsTab
              productId={product._id}
              averageRating={product.rating}
              total={product.reviewCount}
            />
          )}
        </div>

        {/* Related products */}
        <RelatedProducts product={product} />
      </div>

      <ReplaceConfirmModal
        open={!!pendingProduct}
        onClose={() => setPendingProduct(null)}
        onConfirm={handleConfirmReplace}
        category={pendingProduct?.category ?? ""}
        existingName={existingItem?.name ?? ""}
        newName={pendingProduct?.name ?? ""}
      />
    </div>
  );
}
