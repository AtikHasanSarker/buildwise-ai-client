"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Loader2,
  Cpu,
  Monitor,
  Plug,
  MemoryStick,
  HardDrive,
  Box,
  Fan,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Badge, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { getProducts, type Product } from "@/lib/products";
import apiClient from "@/lib/api-client";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface SelectedComponent {
  productId: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
}

interface CompatibilityIssue {
  componentA: string;
  componentB: string;
  issue: string;
  suggestion: string;
  alternativeProductIds?: string[];
}

interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const CATEGORIES = [
  { id: "CPU", icon: Cpu, label: "CPU" },
  { id: "GPU", icon: Monitor, label: "GPU" },
  { id: "Motherboard", icon: Plug, label: "Motherboard" },
  { id: "RAM", icon: MemoryStick, label: "RAM" },
  { id: "SSD", icon: HardDrive, label: "SSD" },
  { id: "PSU", icon: Plug, label: "PSU" },
  { id: "Case", icon: Box, label: "Case" },
  { id: "Cooler", icon: Fan, label: "Cooler" },
];

// Pairs that the AI checks for compatibility
const COMPATIBLE_PAIRS: [string, string][] = [
  ["CPU", "Motherboard"],
  ["Motherboard", "RAM"],
  ["Motherboard", "GPU"],
  ["PSU", "CPU"],
  ["PSU", "GPU"],
  ["Case", "Motherboard"],
  ["Case", "GPU"],
  ["CPU", "Cooler"],
];

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

const connectorPop = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring" as const, stiffness: 500, damping: 25 },
};

/* ──────────────────────────────────────────────
   Product Search Dropdown
   ────────────────────────────────────────────── */

interface ProductSearchProps {
  category: string;
  categoryLabel: string;
  Icon: typeof Cpu;
  selected: SelectedComponent | null;
  onSelect: (product: Product) => void;
  onRemove: () => void;
}

function ProductSearch({
  category,
  categoryLabel,
  Icon,
  selected,
  onSelect,
  onRemove,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch products for this category
  const { data, isLoading } = useQuery({
    queryKey: ["products", category, debouncedQuery],
    queryFn: () =>
      getProducts({
        category,
        search: debouncedQuery || undefined,
        limit: 12,
      }),
    enabled: isOpen,
  });

  const products: Product[] = data?.products || [];

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selected) {
    return (
      <div className="relative rounded-xl border border-border bg-surface-2 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
            {categoryLabel}
          </p>
          <p className="text-sm font-semibold text-text-primary truncate">
            {selected.name}
          </p>
          <p className="text-xs text-text-secondary">{selected.brand} — ${selected.price.toLocaleString()}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-error transition-colors shrink-0"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className="rounded-xl border border-border bg-surface-2 p-3 flex items-center gap-3 cursor-pointer hover:border-text-secondary/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
            {categoryLabel}
          </p>
          <p className="text-sm text-text-secondary">Select {categoryLabel}...</p>
        </div>
        <Search className="w-4 h-4 text-text-secondary shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-surface shadow-elevated overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${categoryLabel}...`}
                  className="w-full rounded-lg bg-surface-2 pl-9 pr-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary/50 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton width={36} height={36} shape="rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton width="70%" height={12} shape="rounded" />
                        <Skeleton width="40%" height={10} shape="rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-secondary">
                  No products found
                </div>
              ) : (
                products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onSelect(product);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {product.brand} — ${product.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary shrink-0">
                      {product.stock > 0 ? (
                        <span className="text-success">In stock</span>
                      ) : (
                        <span className="text-error">Out of stock</span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Component Node Card
   ────────────────────────────────────────────── */

function ComponentNode({
  comp,
  onRemove,
}: {
  comp: SelectedComponent;
  onRemove: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === comp.category);
  const Icon = cat?.icon || Cpu;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col items-center gap-1.5 group"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-surface border border-border shadow-soft flex items-center justify-center overflow-hidden relative">
        {comp.image ? (
          <Image
            src={comp.image}
            alt={comp.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-8 h-8 text-primary/40" />
        )}
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider text-center w-20 md:w-24 truncate">
        {comp.category}
      </p>
      <p className="text-xs font-semibold text-text-primary text-center w-20 md:w-24 truncate">
        {comp.name}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Connector Status Icon
   ────────────────────────────────────────────── */

function ConnectorStatus({
  pair,
  status,
}: {
  pair: [string, string];
  status: "checked-ok" | "checked-issue" | "unchecked";
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="hidden md:flex items-center">
        <div
          className={`w-8 h-[2px] ${
            status === "checked-ok"
              ? "bg-success"
              : status === "checked-issue"
              ? "bg-error"
              : "bg-border"
          }`}
        />
        <motion.div
          {...(status !== "unchecked" ? connectorPop : {})}
          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
            status === "checked-ok"
              ? "bg-success/15 border-success text-success"
              : status === "checked-issue"
              ? "bg-error/15 border-error text-error"
              : "bg-surface-2 border-border text-text-secondary"
          }`}
        >
          {status === "checked-ok" ? (
            <Check className="w-3.5 h-3.5" />
          ) : status === "checked-issue" ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <span className="text-[10px]">?</span>
          )}
        </motion.div>
        <div
          className={`w-8 h-[2px] ${
            status === "checked-ok"
              ? "bg-success"
              : status === "checked-issue"
              ? "bg-error"
              : "bg-border"
          }`}
        />
      </div>
      {/* Mobile vertical connector */}
      <div className="md:hidden flex flex-col items-center">
        <div
          className={`w-[2px] h-6 ${
            status === "checked-ok"
              ? "bg-success"
              : status === "checked-issue"
              ? "bg-error"
              : "bg-border"
          }`}
        />
        <motion.div
          {...(status !== "unchecked" ? connectorPop : {})}
          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
            status === "checked-ok"
              ? "bg-success/15 border-success text-success"
              : status === "checked-issue"
              ? "bg-error/15 border-error text-error"
              : "bg-surface-2 border-border text-text-secondary"
          }`}
        >
          {status === "checked-ok" ? (
            <Check className="w-3 h-3" />
          ) : status === "checked-issue" ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <span className="text-[9px]">?</span>
          )}
        </motion.div>
        <div
          className={`w-[2px] h-6 ${
            status === "checked-ok"
              ? "bg-success"
              : status === "checked-issue"
              ? "bg-error"
              : "bg-border"
          }`}
        />
      </div>
      <p className="text-[9px] text-text-secondary text-center hidden md:block">
        {pair[0]}–{pair[1]}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Issue Card (expandable)
   ────────────────────────────────────────────── */

function IssueCard({
  issue,
  allComponents,
  onSwapAlternative,
}: {
  issue: CompatibilityIssue;
  allComponents: SelectedComponent[];
  onSwapAlternative: (component: Product) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [alts, setAlts] = useState<Product[]>([]);
  const [loadingAlts, setLoadingAlts] = useState(false);

  const fetchAlternatives = useCallback(async () => {
    if (alts.length > 0 || loadingAlts) return;
    if (!issue.alternativeProductIds?.length) return;

    setLoadingAlts(true);
    try {
      const results = await Promise.all(
        issue.alternativeProductIds.map(async (id) => {
          try {
            const res = await apiClient.get(`/products/${id}`);
            return res.data.data.product as Product;
          } catch {
            return null;
          }
        })
      );
      setAlts(results.filter(Boolean) as Product[]);
    } catch {
      // silent
    } finally {
      setLoadingAlts(false);
    }
  }, [issue.alternativeProductIds, alts.length, loadingAlts]);

  useEffect(() => {
    if (expanded) fetchAlternatives();
  }, [expanded, fetchAlternatives]);

  const compA = allComponents.find((c) => c.category === issue.componentA);
  const compB = allComponents.find((c) => c.category === issue.componentB);

  return (
    <Card hover={false} padding="none" className="overflow-hidden border border-error/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-error" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {issue.componentA} ↔ {issue.componentB}
          </p>
          <p className="text-xs text-text-secondary truncate">{issue.issue}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-secondary shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Affected components */}
              <div className="flex gap-2">
                {compA && (
                  <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs">
                    <span className="font-medium text-text-primary">{compA.name}</span>
                    <span className="text-text-secondary">({compA.category})</span>
                  </div>
                )}
                {compB && (
                  <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs">
                    <span className="font-medium text-text-primary">{compB.name}</span>
                    <span className="text-text-secondary">({compB.category})</span>
                  </div>
                )}
              </div>

              {/* Issue explanation */}
              <div className="rounded-lg bg-error/5 border border-error/20 p-3">
                <p className="text-sm text-text-primary leading-relaxed">{issue.issue}</p>
              </div>

              {/* AI suggestion */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-text-primary leading-relaxed">{issue.suggestion}</p>
                </div>
              </div>

              {/* Alternative products */}
              {issue.alternativeProductIds && issue.alternativeProductIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Suggested Alternatives
                  </p>
                  {loadingAlts ? (
                    <div className="flex gap-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-lg border border-border p-3 space-y-2">
                          <Skeleton width="100%" height={60} shape="rounded" />
                          <Skeleton width="70%" height={12} shape="rounded" />
                          <Skeleton width="40%" height={10} shape="rounded" />
                        </div>
                      ))}
                    </div>
                  ) : alts.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {alts.map((alt) => (
                        <button
                          key={alt.id}
                          onClick={() => onSwapAlternative(alt)}
                          className="flex-shrink-0 w-48 rounded-lg border border-border bg-surface p-3 text-left hover:border-primary hover:shadow-soft transition-all group"
                        >
                          <div className="w-full aspect-square rounded-lg bg-surface-2 mb-2 overflow-hidden">
                            {alt.images[0] ? (
                              <Image
                                src={alt.images[0]}
                                alt={alt.name}
                                width={192}
                                height={192}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug">
                            {alt.name}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">{alt.brand}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-sm font-bold font-mono text-primary">
                              ${alt.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Use this →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      No alternatives available for this issue.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ──────────────────────────────────────────────
   Loading skeleton for check
   ────────────────────────────────────────────── */

function CheckingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-sm text-text-secondary">Analyzing compatibility...</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton width={32} height={32} shape="rounded" />
              <Skeleton width="50%" height={14} shape="rounded" />
            </div>
            <Skeleton width="100%" height={10} shape="rounded" />
            <Skeleton width="80%" height={10} shape="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */

function CompatibilityContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [selected, setSelected] = useState<SelectedComponent[]>([]);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Pre-fill from URL params (from AI Build Generator link)
  useEffect(() => {
    const components = searchParams.get("components");
    if (components) {
      try {
        const parsed = JSON.parse(decodeURIComponent(components)) as SelectedComponent[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelected(parsed);
        }
      } catch {
        // ignore malformed params
      }
    }
  }, [searchParams]);

  const handleSelect = useCallback(
    (category: string, product: Product) => {
      setSelected((prev) => {
        const filtered = prev.filter((c) => c.category !== category);
        return [
          ...filtered,
          {
            productId: product.id,
            category: product.category,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0],
          },
        ];
      });
      // Clear previous results when selection changes
      setResult(null);
      setHasChecked(false);
    },
    []
  );

  const handleRemove = useCallback((category: string) => {
    setSelected((prev) => prev.filter((c) => c.category !== category));
    setResult(null);
    setHasChecked(false);
  }, []);

  const handleCheck = useCallback(async () => {
    if (selected.length < 2) {
      showToast("warning", "Select at least 2 components to check compatibility.");
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      const res = await apiClient.post("/ai/check-compatibility", {
        components: selected.map((c) => ({
          productId: c.productId,
          category: c.category,
        })),
      });
      setResult(res.data.data);
      setHasChecked(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { code?: string }; message?: string } }; message?: string };
      const code = apiErr?.response?.data?.error?.code;
      const msg = apiErr?.response?.data?.message || apiErr?.message;

      if (code === "AI_ERROR") {
        showToast("error", "The AI couldn't analyze compatibility right now. Please try again.");
      } else if (code === "RATE_LIMITED") {
        showToast("warning", "You've hit your daily AI limit. Please try again later.");
      } else {
        showToast("error", msg || "Failed to check compatibility. Please try again.");
      }
    } finally {
      setChecking(false);
    }
  }, [selected, showToast]);

  const handleSwapAlternative = useCallback(
    (product: Product) => {
      // Directly update selected without clearing hasChecked
      setSelected((prev) =>
        prev.map((c) =>
          c.category === product.category
            ? {
                productId: product.id,
                category: product.category,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.images[0],
              }
            : c
        )
      );
    },
    []
  );

  // After swap (hasChecked remains true), auto-recheck
  useEffect(() => {
    if (hasChecked && selected.length >= 2) {
      const t = setTimeout(() => {
        handleCheck();
      }, 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Get pair status for connector visualization
  const getPairStatus = (catA: string, catB: string): "checked-ok" | "checked-issue" | "unchecked" => {
    if (!result || !hasChecked) return "unchecked";
    const issue = result.issues.find(
      (i) =>
        (i.componentA === catA && i.componentB === catB) ||
        (i.componentA === catB && i.componentB === catA)
    );
    return issue ? "checked-issue" : "checked-ok";
  };

  // Build connector nodes: for each selected component, show it, and between relevant pairs show connectors
  // We'll show all selected components in a row with connectors between adjacent relevant pairs
  const orderedCategories = CATEGORIES.filter((c) =>
    selected.some((s) => s.category === c.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
      <motion.div {...fadeSlideUp} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="ai">AI Compatibility Checker</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Check Component Compatibility
          </h1>
          <p className="text-text-secondary max-w-xl">
            Select your components and let the AI verify they work together — socket
            types, wattage, form factors, and more.
          </p>
        </div>

        {/* Component Selector Grid */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-primary">
            Select Components
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const selectedComp = selected.find((s) => s.category === cat.id);
              return (
                <ProductSearch
                  key={cat.id}
                  category={cat.id}
                  categoryLabel={cat.label}
                  Icon={cat.icon}
                  selected={selectedComp || null}
                  onSelect={(product) => handleSelect(cat.id, product)}
                  onRemove={() => handleRemove(cat.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Selected Components Visualization */}
        {selected.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary">
              Selected ({selected.length})
            </label>

            {/* Desktop: horizontal row with connectors */}
            <div className="hidden md:block">
              <div className="flex items-center justify-center gap-0 flex-wrap">
                <AnimatePresence mode="popLayout">
                  {orderedCategories.map((cat, idx) => {
                    const comp = selected.find((s) => s.category === cat.id);
                    if (!comp) return null;

                    const nextCat = orderedCategories[idx + 1];
                    const hasConnector = nextCat && COMPATIBLE_PAIRS.some(
                      ([a, b]) =>
                        (a === cat.id && b === nextCat.id) ||
                        (a === nextCat.id && b === cat.id)
                    );

                    return (
                      <div key={cat.id} className="flex items-center">
                        <ComponentNode
                          comp={comp}
                          onRemove={() => handleRemove(cat.id)}
                        />
                        {hasConnector && nextCat && (
                          <ConnectorStatus
                            pair={[cat.id, nextCat.id]}
                            status={getPairStatus(cat.id, nextCat.id)}
                          />
                        )}
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: vertical list with connectors */}
            <div className="md:hidden space-y-0">
              <AnimatePresence>
                {orderedCategories.map((cat, idx) => {
                  const comp = selected.find((s) => s.category === cat.id);
                  if (!comp) return null;

                  const nextCat = orderedCategories[idx + 1];
                  const hasConnector = nextCat && COMPATIBLE_PAIRS.some(
                    ([a, b]) =>
                      (a === cat.id && b === nextCat.id) ||
                      (a === nextCat.id && b === cat.id)
                  );

                  return (
                    <div key={cat.id} className="flex flex-col items-center">
                      <ComponentNode
                        comp={comp}
                        onRemove={() => handleRemove(cat.id)}
                      />
                      {hasConnector && nextCat && (
                        <ConnectorStatus
                          pair={[cat.id, nextCat.id]}
                          status={getPairStatus(cat.id, nextCat.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Check Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRightLeft className="w-5 h-5" />}
            loading={checking}
            disabled={selected.length < 2}
            className="flex-1 sm:flex-none"
            onClick={handleCheck}
          >
            Check Compatibility
          </Button>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              size="lg"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                setSelected([]);
                setResult(null);
                setHasChecked(false);
              }}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Loading State */}
        {checking && (
          <motion.div {...fadeSlideUp}>
            <CheckingSkeleton />
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && !checking && (
            <motion.div
              key={result.compatible ? "compatible" : "issues"}
              {...fadeSlideUp}
              className="space-y-4"
            >
              {/* Success banner */}
              {result.compatible && (
                <Card hover={false} className="border border-success/30 bg-success/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-success">
                        All selected components are compatible!
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        No issues detected between your {selected.length} selected components.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Issues */}
              {!result.compatible && result.issues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-error" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      {result.issues.length} Compatibility{" "}
                      {result.issues.length === 1 ? "Issue" : "Issues"} Found
                    </h3>
                  </div>
                  {result.issues.map((issue, idx) => (
                    <IssueCard
                      key={`${issue.componentA}-${issue.componentB}-${idx}`}
                      issue={issue}
                      allComponents={selected}
                      onSwapAlternative={handleSwapAlternative}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto">
              <ArrowRightLeft className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">
              Select components above to check their compatibility
            </p>
            <Link href="/ai/build">
              <Button variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                Or generate a build with AI
              </Button>
            </Link>
          </div>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-border">
          <Link
            href="/ai/build"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Build Generator
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton width={160} height={24} shape="rounded" />
              <Skeleton width="60%" height={32} shape="rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} width="100%" height={80} shape="rounded" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CompatibilityContent />
    </Suspense>
  );
}
