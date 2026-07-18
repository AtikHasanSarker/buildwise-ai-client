"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Gamepad2,
  Code2,
  Film,
  Building2,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Plug,
  Box,
  Fan,
  Sparkles,
  Save,
  RefreshCw,
  ArrowRightLeft,
  ArrowLeft,
  Check,
  AlertCircle,
  LogIn,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import apiClient from "@/lib/api-client";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

type Purpose = "gaming" | "programming" | "editing" | "office";

interface BuildComponent {
  productId: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  specifications?: Record<string, string | number>;
}

interface BuildResult {
  components: BuildComponent[];
  totalPrice: number;
  reasoning: Record<string, string>;
}

interface GenerateResponse {
  build: BuildResult;
  conversationId: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: { code?: string };
      message?: string;
    };
  };
  message?: string;
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const PURPOSE_OPTIONS: { value: Purpose; label: string; icon: typeof Gamepad2; description: string }[] = [
  { value: "gaming", label: "Gaming", icon: Gamepad2, description: "High FPS, top-tier GPU" },
  { value: "programming", label: "Programming", icon: Code2, description: "Fast compile, lots of RAM" },
  { value: "editing", label: "Video Editing", icon: Film, description: "GPU + CPU balance" },
  { value: "office", label: "Office", icon: Building2, description: "Efficient & quiet" },
];

const BRANDS = [
  "Intel",
  "AMD",
  "NVIDIA",
  "ASUS",
  "MSI",
  "Gigabyte",
  "Corsair",
  "Kingston",
  "Samsung",
  "Western Digital",
  "Seagate",
  "NZXT",
  "Cooler Master",
  "be quiet!",
  "EVGA",
];

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

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

/* ──────────────────────────────────────────────
   Step 1 — Input Form
   ────────────────────────────────────────────── */

interface Step1Props {
  onGenerate: (budget: number, purpose: Purpose, brands: string[]) => void;
  loading: boolean;
}

function Step1Form({ onGenerate, loading }: Step1Props) {
  const [budget, setBudget] = useState<string>("2000");
  const [purpose, setPurpose] = useState<Purpose>("gaming");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [budgetError, setBudgetError] = useState<string>("");

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSubmit = () => {
    const num = parseFloat(budget);
    if (!budget || isNaN(num) || num <= 0) {
      setBudgetError("Please enter a valid budget greater than $0");
      return;
    }
    if (num > 50000) {
      setBudgetError("Budget cannot exceed $50,000");
      return;
    }
    setBudgetError("");
    onGenerate(num, purpose, selectedBrands);
  };

  return (
    <motion.div {...fadeSlideUp} className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="ai">AI Build Generator</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
          Build Your Dream PC
        </h1>
        <p className="text-text-secondary max-w-xl">
          Tell the AI your budget and what you need — it will pick the optimal
          components for you.
        </p>
      </div>

      {/* Budget Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Your Budget
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <DollarSign className="w-5 h-5" />
          </span>
          <input
            type="number"
            min="1"
            max="50000"
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value);
              if (budgetError) setBudgetError("");
            }}
            placeholder="2000"
            aria-label="Budget amount in dollars"
            className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-3 text-lg font-mono text-text-primary outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/50"
          />
        </div>
        {budgetError && (
          <p className="text-sm text-error flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {budgetError}
          </p>
        )}
      </div>

      {/* Purpose Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">
          What will you use it for?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PURPOSE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = purpose === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPurpose(opt.value)}
                aria-pressed={isActive}
                className={`
                  relative flex flex-col items-center gap-2 p-4 rounded-xl border-2
                  transition-all duration-200 cursor-pointer text-center
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
                  ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-glow-primary"
                      : "border-border bg-surface hover:border-text-secondary/40 hover:bg-surface-2"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="purpose-check"
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isActive ? "bg-primary/20" : "bg-surface-2"}
                  `}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-primary" : "text-text-secondary"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-text-secondary leading-tight">
                  {opt.description}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Brand Multi-Select */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">
            Preferred Brands
          </label>
          <span className="text-xs text-text-secondary">Optional</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => {
            const isActive = selectedBrands.includes(brand);
            return (
              <motion.button
                key={brand}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleBrand(brand)}
                aria-pressed={isActive}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium border
                  transition-all duration-200 cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
                  ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-text-secondary/40 hover:text-text-primary"
                  }
                `}
              >
                {isActive && <Check className="w-3.5 h-3.5 inline mr-1" />}
                {brand}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        variant="primary"
        size="lg"
        loading={loading}
        icon={<Sparkles className="w-5 h-5" />}
        className="w-full md:w-auto"
        onClick={handleSubmit}
      >
        Generate My Build
      </Button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Step 2 — Result Card
   ────────────────────────────────────────────── */

interface Step2Props {
  result: GenerateResponse;
  budget: number;
  purpose: Purpose;
  brands: string[];
  onRegenerate: () => void;
  loading: boolean;
}

function BuildResultCard({ result, budget, purpose, brands, onRegenerate, loading }: Step2Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { build } = result;
  const budgetPercent = Math.min((build.totalPrice / budget) * 100, 100);
  const isOverBudget = build.totalPrice > budget;

  const toggleReason = (category: string) => {
    setExpandedReasons((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = async () => {
    if (!user) {
      showToast("warning", "Please log in to save your build");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/builds", {
        name: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Build — $${build.totalPrice.toLocaleString()}`,
        components: build.components.map((c) => ({
          productId: c.productId,
          category: c.category,
        })),
        totalPrice: build.totalPrice,
        aiRecommendation: result.conversationId,
      });
      setSaved(true);
      showToast("success", "Build saved! View it in your dashboard.");
    } catch (err) {
      showToast("error", "Failed to save build. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div {...fadeSlideUp} className="space-y-6">
      {/* Back button */}
      <button
        onClick={onRegenerate}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Start over
      </button>

      {/* AI Build Result Card — gradient border wrapper */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-purple-500 to-primary">
        <div className="rounded-2xl bg-surface p-6 md:p-8 space-y-6">
          {/* Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="ai">AI Recommended</Badge>
            <span className="text-xs text-text-secondary">
              {build.components.length} components
            </span>
          </div>

          {/* Component list */}
          <div className="space-y-3">
            {build.components.map((comp) => {
              const Icon = CATEGORY_ICONS[comp.category] || Cpu;
              const isExpanded = !!expandedReasons[comp.category];
              const reason = build.reasoning[comp.category];

              return (
                <div
                  key={comp.productId}
                  className="rounded-xl border border-border bg-surface-2 overflow-hidden"
                >
                  {/* Component row */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                        {comp.category}
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {comp.name}
                      </p>
                      <p className="text-xs text-text-secondary">{comp.brand}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-text-primary shrink-0">
                      ${comp.price.toLocaleString()}
                    </span>
                    {reason && (
                      <button
                        onClick={() => toggleReason(comp.category)}
                        className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-primary transition-colors shrink-0"
                        title="Why this component?"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Collapsible reasoning */}
                  <AnimatePresence>
                    {isExpanded && reason && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0">
                          <div className="p-3 rounded-lg bg-surface border border-border">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <p className="text-xs text-text-secondary leading-relaxed">
                                {reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Total price + budget bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text-secondary">Total</span>
              <span className="text-2xl font-bold font-mono text-text-primary">
                ${build.totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  ${build.totalPrice.toLocaleString()} of ${budget.toLocaleString()} budget
                </span>
                <span
                  className={`font-medium ${
                    isOverBudget ? "text-error" : "text-success"
                  }`}
                >
                  {isOverBudget
                    ? `$${(build.totalPrice - budget).toLocaleString()} over`
                    : `$${(budget - build.totalPrice).toLocaleString()} remaining`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isOverBudget
                      ? "bg-error"
                      : budgetPercent > 80
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              loading={saving}
              disabled={saved}
              className="flex-1"
              onClick={handleSave}
            >
              {saved ? (
                <Link href="/dashboard/builds" className="flex items-center gap-2">
                  View in Saved Builds
                </Link>
              ) : !user ? (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Log in to Save
                </span>
              ) : (
                "Save Build"
              )}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<RefreshCw className="w-5 h-5" />}
              loading={loading}
              className="flex-1"
              onClick={onRegenerate}
            >
              Regenerate
            </Button>
            <Link href="/ai/compatibility" className="flex-1">
              <Button
                variant="ghost"
                size="lg"
                icon={<ArrowRightLeft className="w-5 h-5" />}
                className="w-full"
              >
                Check Compatibility
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Loading skeleton for Step 2
   ────────────────────────────────────────────── */

function GeneratingSkeleton() {
  return (
    <motion.div {...fadeSlideUp} className="space-y-6">
      <div className="space-y-2">
        <Skeleton width={140} height={24} shape="rounded" />
        <Skeleton width="60%" height={32} shape="rounded" />
      </div>
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-purple-500 to-primary">
        <div className="rounded-2xl bg-surface p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton width={100} height={24} shape="rounded" />
            <Skeleton width={80} height={16} shape="rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2"
              >
                <Skeleton width={40} height={40} shape="rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="25%" height={12} shape="rounded" />
                  <Skeleton width="60%" height={16} shape="rounded" />
                </div>
                <Skeleton width={60} height={16} shape="rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton width="100%" height={8} shape="rounded" />
            <Skeleton width="40%" height={16} shape="rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */

export default function AiBuildPage() {
  useEffect(() => {
    document.title = "AI Build Generator — BuildWise AI";
  }, []);

  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [lastParams, setLastParams] = useState<{
    budget: number;
    purpose: Purpose;
    brands: string[];
  } | null>(null);

  const handleGenerate = useCallback(
    async (budget: number, purpose: Purpose, brands: string[]) => {
      setLoading(true);
      setLastParams({ budget, purpose, brands });

      try {
        const res = await apiClient.post<GenerateResponse>("/ai/generate-build", {
          budget,
          purpose,
          preferredBrand: brands.length > 0 ? brands : undefined,
        });
        setResult(res.data);
        setStep(2);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const code = apiErr?.response?.data?.error?.code;
        const msg = apiErr?.response?.data?.message || apiErr?.message;

        if (code === "RATE_LIMITED") {
          showToast(
            "warning",
            "You've hit your daily AI limit. Please try again tomorrow or log in for more requests."
          );
        } else if (code === "AI_ERROR") {
          showToast(
            "error",
            "The AI couldn't generate a build right now. Please try again."
          );
        } else {
          showToast("error", msg || "Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const handleRegenerate = useCallback(() => {
    if (lastParams) {
      handleGenerate(lastParams.budget, lastParams.purpose, lastParams.brands);
    }
  }, [lastParams, handleGenerate]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
      <AnimatePresence mode="wait">
        {loading && !result ? (
          <GeneratingSkeleton key="skeleton" />
        ) : step === 1 ? (
          <Step1Form
            key="form"
            onGenerate={handleGenerate}
            loading={loading}
          />
        ) : result ? (
          <BuildResultCard
            key="result"
            result={result}
            budget={lastParams?.budget ?? 2000}
            purpose={lastParams?.purpose ?? "gaming"}
            brands={lastParams?.brands ?? []}
            onRegenerate={handleRegenerate}
            loading={loading}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
