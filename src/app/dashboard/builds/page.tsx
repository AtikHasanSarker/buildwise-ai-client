"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  Cpu,
  Eye,
  Trash2,
  Sparkles,
  Plus,
  Box,
} from "lucide-react";
import { Card, Button, Badge, Modal, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";

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
}

interface BuildsResponse {
  builds: Build[];
  total: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: null;
}

async function fetchBuilds(): Promise<BuildsResponse> {
  const res = await apiClient.get("/builds?limit=50");
  return (res as unknown as Envelope<BuildsResponse>).data;
}

async function deleteBuild(id: string): Promise<void> {
  await apiClient.delete(`/builds/${id}`);
}

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

export default function SavedBuildsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["builds"],
    queryFn: fetchBuilds,
  });

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

  const builds = data?.builds ?? [];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Saved Builds
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface shadow-soft overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <Skeleton width="60%" height={18} shape="rounded" />
                <Skeleton width="40%" height={14} shape="rounded" />
                <Skeleton width="100%" height={14} shape="rounded" />
                <Skeleton width="30%" height={20} shape="rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (builds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Saved Builds
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
            <Box className="w-10 h-10 text-text-secondary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            You haven&apos;t saved any builds yet
          </h2>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            Use the AI Build Generator to create your perfect PC build, then save
            it here for quick access.
          </p>
          <Link href="/ai/build">
            <Button icon={<Plus className="w-4 h-4" />}>
              Create Your First Build
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Saved Builds</h1>
        <p className="text-sm text-text-secondary">
          {builds.length} build{builds.length !== 1 ? "s" : ""}
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {builds.map((build) => (
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
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(build.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {build.aiRecommendation && (
                    <Badge variant="ai" className="shrink-0">
                      AI Recommended
                    </Badge>
                  )}
                </div>

                {/* Component preview */}
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>
                    {build.components.length} component
                    {build.components.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[
                    ...new Set(build.components.map((c) => c.category)),
                  ].slice(0, 4).map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="text-lg font-bold font-mono text-text-primary">
                    ${build.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-border">
                <button
                  onClick={() => openDetail(build)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => openConfirm(build)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedBuild?.name ?? "Build Details"}
        className="max-w-xl"
      >
        {selectedBuild && (
          <div className="space-y-4">
            {selectedBuild.aiRecommendation && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-primary">
                  This build was AI-recommended
                </span>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedBuild.components.map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-2"
                >
                  {comp.image ? (
                    <img
                      src={comp.image}
                      alt={comp.name ?? comp.category}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center shrink-0">
                      <Cpu className="w-5 h-5 text-text-secondary" />
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

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-text-secondary">Total</span>
              <span className="text-xl font-bold font-mono text-text-primary">
                ${selectedBuild.totalPrice.toLocaleString()}
              </span>
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
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text-primary">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>
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
              className="!bg-error hover:!bg-error/90 !shadow-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
