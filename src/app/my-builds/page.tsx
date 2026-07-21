"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  Eye,
  Play,
  Copy,
  Trash2,
  Sparkles,
  Plus,
  Box,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  AlertTriangle,
  Package,
  ArrowRight,
} from "lucide-react";
import { Card, Button, Badge, Modal, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import apiClient from "@/lib/api-client";

/* ─── Types ─── */

interface BuildComponent {
  productId: string;
  category: string;
  name?: string;
  price?: number;
  image?: string;
}

interface Build {
  _id: string;
  name: string;
  components: BuildComponent[];
  totalPrice: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiRecommendation?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
}

interface BuildsResponse {
  builds: Build[];
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

interface SuggestedBuild {
  _id: string;
  name: string;
  description: string;
  price: number;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  performanceBadge: string;
  category: string;
}

/* ─── API functions ─── */

async function fetchBuilds(): Promise<BuildsResponse> {
  const res = await apiClient.get<Envelope<BuildsResponse>>("/builds?limit=50", {
    withCredentials: true,
  });
  const raw = res.data.data;

  // Flatten populated productId into component fields for the UI
  const builds = raw.builds.map((build) => ({
    ...build,
    components: build.components.map((comp) => {
      const populated = comp.productId as unknown as {
        _id: string;
        name: string;
        images?: string[];
        price?: number;
        category?: string;
        brand?: string;
      };
      return {
        ...comp,
        productId: populated?._id ?? comp.productId,
        name: populated?.name ?? comp.name,
        price: populated?.price ?? comp.price,
        image: populated?.images?.[0] ?? comp.image,
      };
    }),
  }));

  return { ...raw, builds };
}

async function deleteBuild(id: string): Promise<void> {
  await apiClient.delete(`/builds/${id}`, { withCredentials: true });
}

async function duplicateBuild(build: Build): Promise<Build> {
  const res = await apiClient.post<Envelope<{ build: Build }>>(
    "/builds",
    {
      name: `${build.name} (Copy)`,
      components: build.components.map((c) => ({
        productId: typeof c.productId === "string" ? c.productId : (c.productId as unknown as { _id: string })._id,
        category: c.category,
      })),
      totalPrice: build.totalPrice,
    },
    { withCredentials: true }
  );
  return res.data.data.build;
}

/* ─── Mock data: Recommended builds ─── */

// TODO: Replace with GET /api/v1/builds/recommended when a recommendation API exists
const MOCK_RECOMMENDED: SuggestedBuild[] = [
  {
    _id: "rec-1",
    name: "1440p Gaming Champion",
    description: "Perfect balance of performance and value for high-refresh 1440p gaming.",
    price: 1649,
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4070 Ti Super",
    ram: "32GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "1440p Ultra",
    category: "Gaming",
  },
  {
    _id: "rec-2",
    name: "Content Creator Pro",
    description: "Optimized for video editing, streaming, and creative workloads.",
    price: 2299,
    cpu: "Intel Core i7-14700K",
    gpu: "NVIDIA RTX 4070 Ti",
    ram: "64GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "Creator",
    category: "Editing",
  },
  {
    _id: "rec-3",
    name: "Budget Starter",
    description: "Great entry-level build for 1080p gaming and everyday tasks.",
    price: 749,
    cpu: "AMD Ryzen 5 7600",
    gpu: "AMD RX 7600",
    ram: "16GB DDR5",
    storage: "500GB NVMe",
    performanceBadge: "1080p Medium",
    category: "Budget",
  },
];

/* ─── Category icons ─── */

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  CPU: <Cpu className="w-3.5 h-3.5" />,
  GPU: <Monitor className="w-3.5 h-3.5" />,
  RAM: <MemoryStick className="w-3.5 h-3.5" />,
  SSD: <HardDrive className="w-3.5 h-3.5" />,
  HDD: <HardDrive className="w-3.5 h-3.5" />,
  Motherboard: <Cpu className="w-3.5 h-3.5" />,
  PSU: <Package className="w-3.5 h-3.5" />,
  Case: <Box className="w-3.5 h-3.5" />,
  Cooler: <Package className="w-3.5 h-3.5" />,
};

const SUMMARY_CATEGORIES = ["CPU", "GPU", "RAM", "SSD"];

/* ─── Sort options ─── */

type SortKey = "newest" | "oldest" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price Low \u2192 High" },
  { value: "price-desc", label: "Price High \u2192 Low" },
];

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

/* ─── Build Card Skeleton ─── */

function BuildCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface shadow-soft overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton width="60%" height={18} shape="rounded" />
            <Skeleton width="40%" height={12} shape="rounded" />
          </div>
          <Skeleton width={80} height={22} shape="rounded" />
        </div>
        <Skeleton width="100%" height={14} shape="rounded" />
        <div className="flex gap-1.5">
          <Skeleton width={50} height={20} shape="rounded" />
          <Skeleton width={40} height={20} shape="rounded" />
          <Skeleton width={45} height={20} shape="rounded" />
        </div>
        <div className="pt-3 border-t border-border">
          <Skeleton width={100} height={24} shape="rounded" />
        </div>
      </div>
      <div className="flex border-t border-border">
        <Skeleton width="33%" height={48} shape="rect" />
        <Skeleton width="33%" height={48} shape="rect" />
        <Skeleton width="33%" height={48} shape="rect" />
      </div>
    </div>
  );
}

/* ─── Recommended Card Skeleton ─── */

function RecommendedSkeleton() {
  return (
    <div className="rounded-xl bg-surface shadow-soft overflow-hidden">
      <Skeleton width="100%" height={160} shape="rect" />
      <div className="p-4 space-y-2">
        <Skeleton width="70%" height={16} shape="rounded" />
        <Skeleton width="100%" height={12} shape="rounded" />
        <Skeleton width="50%" height={20} shape="rounded" />
      </div>
    </div>
  );
}

/* ─── Component Summary ─── */

function ComponentSummary({ components }: { components: BuildComponent[] }) {
  const summary = SUMMARY_CATEGORIES.map((cat) => {
    const comp = components.find((c) => c.category === cat);
    return comp ? { category: cat, name: comp.name } : null;
  }).filter(Boolean) as { category: string; name: string }[];

  if (summary.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {summary.map(({ category, name }) => (
        <div key={category} className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="text-text-secondary/70">{CATEGORY_ICON_MAP[category] ?? <Package className="w-3.5 h-3.5" />}</span>
          <span className="shrink-0 font-medium w-14">{category}</span>
          <span className="truncate">{name}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Empty State ─── */

function EmptyBuildsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6">
        <Box className="w-12 h-12 text-primary/50" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        No Saved Builds Yet
      </h2>
      <p className="text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
        You haven&apos;t created any PC builds yet. Start by exploring our
        suggested builds or generate your own AI-powered build.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/products">
          <Button variant="secondary" icon={<Package className="w-4 h-4" />}>
            Browse Suggested Builds
          </Button>
        </Link>
        <Link href="/ai/build">
          <Button icon={<Sparkles className="w-4 h-4" />}>
            Generate AI Build
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function MyBuildsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ─── Data fetching ─── */

  const { data, isLoading } = useQuery({
    queryKey: ["builds"],
    queryFn: fetchBuilds,
    enabled: !!user,
  });

  /* ─── Delete mutation ─── */

  const deleteMutation = useMutation({
    mutationFn: deleteBuild,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["builds"] });
      const previous = queryClient.getQueryData<BuildsResponse>(["builds"]);
      queryClient.setQueryData<BuildsResponse>(["builds"], (old) => {
        if (!old) return old;
        return {
          ...old,
          builds: old.builds.filter((b) => b._id !== id),
          total: old.total - 1,
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["builds"], context.previous);
      }
      showToast("error", "Failed to delete build. Please try again.");
    },
    onSuccess: () => {
      showToast("success", "Build deleted successfully.");
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["builds"] });
    },
  });

  /* ─── Duplicate mutation ─── */

  const duplicateMutation = useMutation({
    mutationFn: duplicateBuild,
    onSuccess: (newBuild) => {
      queryClient.setQueryData<BuildsResponse>(["builds"], (old) => {
        if (!old) return old;
        return {
          ...old,
          builds: [newBuild, ...old.builds],
          total: old.total + 1,
        };
      });
      showToast("success", `"${newBuild.name}" created successfully.`);
    },
    onError: () => {
      showToast("error", "Failed to duplicate build. Please try again.");
    },
  });

  /* ─── Filtered & sorted builds ─── */

  const builds = useMemo(() => {
    const list = data?.builds ?? [];

    const filtered = search.trim()
      ? list.filter(
          (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.components.some(
              (c) =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.category.toLowerCase().includes(search.toLowerCase())
            )
        )
      : list;

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-asc":
          return a.totalPrice - b.totalPrice;
        case "price-desc":
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

    return sorted;
  }, [data?.builds, search, sort]);

  const hasBuilds = (data?.builds?.length ?? 0) > 0;

  /* ─── Handlers ─── */

  function openDetail(build: Build) {
    setSelectedBuild(build);
    setDetailOpen(true);
  }

  function openConfirm(build: Build) {
    setDeleteTarget(build);
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget._id);
    }
  }

  /* ─── Not logged in state ─── */

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Builds</h1>
          <p className="text-text-secondary mt-1">
            View, manage and continue working on your saved PC builds.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
            <Box className="w-12 h-12 text-text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Log in to see your builds
          </h2>
          <p className="text-sm text-text-secondary max-w-sm mb-8">
            Sign in to access your saved builds, continue working on projects, and track your progress.
          </p>
          <Link href="/login">
            <Button icon={<Plus className="w-4 h-4" />}>
              Log In
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ─── Loading state ─── */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10">
        <div className="mb-8">
          <Skeleton width={200} height={32} shape="rounded" />
          <Skeleton width={320} height={16} shape="rounded" className="mt-3" />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Skeleton width={280} height={44} shape="rounded" />
          <Skeleton width={160} height={44} shape="rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <BuildCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-16">
          <Skeleton width={240} height={28} shape="rounded" className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <RecommendedSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Empty state (no builds at all, no search active) ─── */

  if (!hasBuilds && !search) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Builds</h1>
          <p className="text-text-secondary mt-1">
            View, manage and continue working on your saved PC builds.
          </p>
        </div>

        <EmptyBuildsState />

        {/* Recommended section always visible */}
        <RecommendedSection />
      </div>
    );
  }

  /* ─── Main render ─── */

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Builds</h1>
        <p className="text-text-secondary mt-1">
          View, manage and continue working on your saved PC builds.
        </p>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search builds, components..."
            className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-text-secondary shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Build count */}
      <p className="text-sm text-text-secondary mb-4">
        {builds.length} build{builds.length !== 1 ? "s" : ""}
        {search && ` found for "${search}"`}
      </p>

      {/* No search results */}
      {builds.length === 0 && search && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Search className="w-10 h-10 text-text-secondary mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            No builds match &ldquo;{search}&rdquo;
          </h3>
          <p className="text-sm text-text-secondary">
            Try a different search term or clear the filter.
          </p>
        </motion.div>
      )}

      {/* Build Cards Grid */}
      {builds.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {builds.map((build) => {
            const categories = [...new Set(build.components.map((c) => c.category))];
            const lastUpdated = build.updatedAt ?? build.createdAt;

            return (
              <motion.div key={build._id} variants={item}>
                <Card
                  padding="none"
                  className="overflow-hidden flex flex-col h-full"
                >
                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-text-primary truncate">
                          {build.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            {new Date(build.createdAt).toLocaleDateString()}
                          </span>
                          {build.updatedAt && build.updatedAt !== build.createdAt && (
                            <span className="flex items-center gap-1 text-xs text-text-secondary">
                              <Clock className="w-3 h-3" />
                              Updated {new Date(lastUpdated).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {build.aiRecommendation && (
                        <Badge variant="ai" className="shrink-0">
                          AI Recommended
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <p className="text-xl font-bold font-mono text-text-primary">
                        ${build.totalPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Component count */}
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-3">
                      <Cpu className="w-4 h-4 shrink-0" />
                      <span>
                        {build.components.length} component
                        {build.components.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Component summary */}
                    <div className="mb-3">
                      <ComponentSummary components={build.components} />
                    </div>

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {categories.slice(0, 5).map((cat) => (
                        <span
                          key={cat}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary"
                        >
                          {cat}
                        </span>
                      ))}
                      {categories.length > 5 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
                          +{categories.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Compatibility hint */}
                    {build.aiRecommendation && (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-success shrink-0" />
                        <span className="text-xs text-success font-medium">
                          AI verified compatible
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => openDetail(build)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                      aria-label={`View details for ${build.name}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    <div className="w-px bg-border" />
                    <Link
                      href="/builds/current"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium text-primary hover:bg-primary/5 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                      aria-label={`Continue building ${build.name}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Continue
                    </Link>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => duplicateMutation.mutate(build)}
                      disabled={duplicateMutation.isPending}
                      className="flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 disabled:opacity-50"
                      aria-label={`Duplicate ${build.name}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => openConfirm(build)}
                      className="flex items-center justify-center px-3 py-3 text-xs font-medium text-error hover:bg-error/5 transition-colors focus-visible:outline-2 focus-visible:outline-error focus-visible:-outline-offset-2"
                      aria-label={`Delete ${build.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recommended For You */}
      <RecommendedSection />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedBuild?.name ?? "Build Details"}
        className="max-w-xl"
      >
        {selectedBuild && (
          <div className="space-y-4">
            {/* AI badge */}
            {selectedBuild.aiRecommendation && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-primary">
                  This build was AI-recommended
                </span>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(selectedBuild.createdAt).toLocaleDateString()}
              </span>
              {selectedBuild.updatedAt && selectedBuild.updatedAt !== selectedBuild.createdAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Updated {new Date(selectedBuild.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Components */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedBuild.components.map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-2"
                >
                  {comp.image ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={comp.image}
                        alt={comp.name ?? comp.category}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center shrink-0 text-text-secondary">
                      {CATEGORY_ICON_MAP[comp.category] ?? <Package className="w-5 h-5" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {comp.name ?? comp.category}
                    </p>
                    <p className="text-xs text-text-secondary">{comp.category}</p>
                  </div>
                  {comp.price != null && (
                    <span className="text-sm font-semibold font-mono text-text-primary shrink-0">
                      ${comp.price.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-text-secondary">Total</span>
              <span className="text-xl font-bold font-mono text-text-primary">
                ${selectedBuild.totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href="/builds/current" className="flex-1">
                <Button variant="secondary" className="w-full" icon={<Play className="w-4 h-4" />}>
                  Continue Build
                </Button>
              </Link>
              <Button
                variant="primary"
                className="flex-1"
                icon={<Copy className="w-4 h-4" />}
                loading={duplicateMutation.isPending}
                onClick={() => {
                  duplicateMutation.mutate(selectedBuild);
                  setDetailOpen(false);
                }}
              >
                Duplicate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Build"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary">
                  {deleteTarget?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={confirmDelete}
              className="bg-error! hover:bg-error/90! shadow-none!"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Recommended Section ─── */

// TODO: Replace MOCK_RECOMMENDED with GET /api/v1/builds/recommended when available
function RecommendedSection() {
  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Recommended For You</h2>
          <p className="text-sm text-text-secondary mt-1">
            AI-suggested builds based on popular configurations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MOCK_RECOMMENDED.map((build) => (
          <Card key={build._id} padding="none" className="overflow-hidden flex flex-col">
            {/* Cover area */}
            <div className="h-40 bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative">
              <div className="text-center">
                <Cpu className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                <Badge variant="ai" className="text-[10px]">{build.performanceBadge}</Badge>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-base font-semibold text-text-primary mb-1">
                {build.name}
              </h3>
              <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                {build.description}
              </p>

              {/* Specs preview */}
              <div className="flex flex-col gap-1 mb-4 text-xs text-text-secondary">
                <span><span className="font-medium">CPU:</span> {build.cpu}</span>
                <span><span className="font-medium">GPU:</span> {build.gpu}</span>
                <span><span className="font-medium">RAM:</span> {build.ram}</span>
                <span><span className="font-medium">Storage:</span> {build.storage}</span>
              </div>

              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-text-primary">
                  ${build.price.toLocaleString()}
                </span>
                <Link href="/ai/build">
                  <Button size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Generate Build
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
