"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowDown,
  PackageOpen,
  TrendingUp,
  Users,
  Bot,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, type Product } from "@/lib/products";
import Image from "next/image";

/* ─── Scroll-reveal wrapper (A.6) ─── */

function SectionReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter hook (A.6) ─── */

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return { count, ref };
}

/* ─── Data ─── */

const features = [
  {
    id: 1,
    icon: Bot,
    title: "AI Build Generator",
    description:
      "Tell us your budget and purpose — our AI picks the best compatible components instantly.",
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Compatibility Checker",
    description:
      "Every build is verified for component compatibility before you buy — no surprises.",
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "AI Chat Assistant",
    description:
      "Ask anything about PC builds. Get expert advice on parts, performance, and optimization.",
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Personalized suggestions based on your usage, budget, and the latest market trends.",
  },
];

const stats = [
  { value: 10000, suffix: "+", label: "Builds Generated", icon: Cpu },
  { value: 500, suffix: "+", label: "Products Listed", icon: PackageOpen },
  { value: 98, suffix: "%", label: "Compatibility Rate", icon: ShieldCheck },
  { value: 5000, suffix: "+", label: "Happy Users", icon: Users },
];

/* ─── Fetch products ─── */

function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const data = await getProducts({ limit: 10, sort: "rating" });
      return data ?? { products: [], total: 0, page: 1, totalPages: 0 };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/* ─── Premium Hero section ─── */

function HeroSection() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative flex items-center overflow-hidden">
      {/* Spotlight glow behind heading */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/8 dark:bg-primary/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text + CTAs */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                AI-Powered
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-text-primary mb-6 leading-[1.1]"
            >
              Build Your Dream PC
              <br />
              with{" "}
              <span className="bg-linear-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                AI Precision
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-text-secondary mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Our AI finds compatible components, optimizes your budget, and
              builds the perfect setup — so you can focus on what matters.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all hover:shadow-glow-primary"
              >
                <span className="absolute inset-0 rounded-full bg-linear-to-r from-primary to-purple-600 transition-all group-hover:scale-105" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-surface-2 hover:border-border/80"
              >
                Browse Products
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-xs text-text-secondary"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" strokeWidth={1.75} />
                100% Compatible
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent" strokeWidth={1.75} />
                Instant Results
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-primary" strokeWidth={1.75} />
                AI-Optimized
              </span>
            </motion.div>
          </motion.div>

          {/* Right: Floating PC component collage */}
          <div className="hidden lg:flex justify-center items-center">
            <Image src="/images/pc.jpg" alt="Hero collage" width={1200} height={630} className="rounded-xl shadow-elevated" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 0.7 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary z-10"
      >
        <span className="text-xs font-medium tracking-widest uppercase">
          Scroll
        </span>
        <ArrowDown className="w-4 h-4 scroll-indicator" strokeWidth={1.75} />
      </motion.div>
    </section>
  );
}

/* ─── Feature cards ─── */

function WhySection() {
  return (
    <SectionReveal>
      <section className="px-4 md:px-8 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Why BuildWise AI
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
            Everything you need to build the perfect PC, powered by artificial
            intelligence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.id} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon
                    className="w-6 h-6 text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ─── Featured products ─── */

function FeaturedSection() {
  const { data, isLoading, isError } = useFeaturedProducts();
  const products: Product[] = data?.products ?? [];
  const isEmpty = !isLoading && !isError && products.length === 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, products]);

  function scrollByCard(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > div");
    if (!card) return;
    const cardWidth = card.offsetWidth + 24; // card width + gap
    el.scrollBy({ left: direction === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  }

  return (
    <SectionReveal>
      <section className="px-4 md:px-8 lg:px-16 py-20 bg-surface-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading && (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-none w-70 sm:w-75">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-text-secondary text-sm">
                Unable to load products right now. Please try again later.
              </p>
            </div>
          )}

          {isEmpty && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-sm mb-4">
                No products available yet. Check back soon!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <div className="relative group/carousel">
              {/* Left arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollByCard("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-elevated flex items-center justify-center text-text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Right arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollByCard("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-elevated flex items-center justify-center text-text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Scrollable container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8 lg:mx-0 lg:px-0"
              >
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex-none w-70 sm:w-75 snap-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Right fade linear — hidden when scrolled near end */}
              {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 md:w-24 bg-linear-to-l from-surface-2 to-transparent" />
              )}
            </div>
          )}
        </div>
      </section>
    </SectionReveal>
  );
}

/* ─── Stats ─── */

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  const { count, ref } = useCountUp(value);

  return (
    <Card ref={ref} className="text-center">
      <Icon
        className="w-8 h-8 text-primary mx-auto mb-3"
        strokeWidth={1.75}
      />
      <div className="text-3xl md:text-4xl font-bold text-text-primary font-mono mb-1">
        {count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
    </Card>
  );
}

function StatsSection() {
  return (
    <SectionReveal>
      <section className="px-4 md:px-8 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-12">
            Trusted by Builders Everywhere
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ─── Home page (client wrapper) ─── */

export function HomeContent() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <FeaturedSection />
      <StatsSection />
    </>
  );
}
