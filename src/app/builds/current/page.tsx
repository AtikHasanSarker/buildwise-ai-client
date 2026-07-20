"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Plug,
  Box,
  Fan,
  Trash2,
  ArrowLeft,
  Zap,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/toast";
import { useBuild, type BuildItem } from "@/lib/build-context";

/* ─── Constants ─── */

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  CPU: Cpu,
  GPU: Monitor,
  Motherboard: Plug,
  RAM: MemoryStick,
  SSD: HardDrive,
  HDD: HardDrive,
  PSU: Plug,
  Case: Box,
  Cooler: Fan,
};

const CATEGORY_ORDER = [
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

/* ─── Build Item Row ─── */

function BuildItemRow({
  item,
  onRemove,
}: {
  item: BuildItem;
  onRemove: (id: string) => void;
}) {
  const Icon = CATEGORY_ICONS[item.category] || Cpu;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:shadow-soft transition-shadow"
    >
      {/* Image or Icon */}
      {item.image ? (
        <div className="relative w-16 h-16 rounded-lg bg-surface-2 overflow-hidden shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">
          {item.category}
        </p>
        <p className="text-sm font-semibold text-text-primary truncate">
          {item.name}
        </p>
        <p className="text-xs text-text-secondary">{item.brand}</p>
      </div>

      {/* Price */}
      <span className="text-sm font-bold font-mono text-text-primary shrink-0">
        ${item.price.toLocaleString()}
      </span>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.productId)}
        className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors shrink-0"
        title={`Remove ${item.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function CurrentBuildPage() {
  const {
    items,
    totalPrice,
    totalWattage,
    removeFromBuild,
    clearBuild,
  } = useBuild();
  const { showToast } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const sortedItems = [...items].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  );

  function handleRemove(productId: string) {
    const item = items.find((i) => i.productId === productId);
    removeFromBuild(productId);
    if (item) {
      showToast("info", `${item.name} removed from build`);
    }
  }

  function handleClear() {
    clearBuild();
    setShowClearConfirm(false);
    showToast("info", "Build cleared");
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue shopping
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Current Build</h1>
          <p className="text-text-secondary mt-1">
            {items.length === 0
              ? "Start adding components to build your PC"
              : `${items.length} component${items.length !== 1 ? "s" : ""} selected`}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Your build is empty
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Browse our products and click &quot;Add to Build&quot; to start
              selecting components for your PC build.
            </p>
            <Link href="/products">
              <Button variant="primary" icon={<ShoppingCart className="w-5 h-5" />}>
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Component list */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item) => (
                  <BuildItemRow
                    key={item.productId}
                    item={item}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Build Summary
                  </h2>

                  {/* Total Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Total Price</span>
                    </div>
                    <span className="text-xl font-bold font-mono text-text-primary">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Estimated Wattage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Est. Power</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {totalWattage}W
                    </span>
                  </div>

                  {/* PSU recommendation */}
                  {totalWattage > 0 && (
                    <div className="rounded-lg bg-surface-2 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-text-secondary">
                          Recommended PSU:{" "}
                          <span className="font-semibold text-text-primary">
                            {Math.ceil(totalWattage * 1.2 / 50) * 50}W
                          </span>{" "}
                          (20% headroom)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Component count */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_ORDER.map((cat) => {
                        const has = items.some((i) => i.category === cat);
                        return (
                          <Badge
                            key={cat}
                            variant={has ? "success" : "accent"}
                            className="text-[10px]"
                          >
                            {has ? "✓ " : ""}
                            {cat}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link href="/products">
                    <Button variant="secondary" className="w-full" icon={<ShoppingCart className="w-4 h-4" />}>
                      Add More Components
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full text-error hover:bg-error/10"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear Build
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear confirmation modal */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Build?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will remove all {items.length} components from your build. This
            action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
