"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Gamepad2,
  Code2,
  Film,
  Palette,
  Briefcase,
  Zap,
  Star,
} from "lucide-react";
import { Card, Button, Badge, Skeleton } from "@/components/ui";

/* ─── Types ─── */

interface CuratedBuild {
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
  tags: string[];
}

/* ─── Mock data ─── */

// TODO: Replace with GET /api/v1/builds/curated
const MOCK_CURATED_BUILDS: CuratedBuild[] = [
  /* Gaming */
  {
    _id: "cur-1",
    name: "Budget Gaming PC",
    description: "Entry-level gaming build for 1080p at medium settings. Perfect for esports titles and casual gaming.",
    price: 649,
    cpu: "AMD Ryzen 5 7600",
    gpu: "AMD RX 7600",
    ram: "16GB DDR5",
    storage: "500GB NVMe",
    performanceBadge: "1080p Medium",
    category: "Gaming",
    tags: ["budget", "1080p", "esports"],
  },
  {
    _id: "cur-2",
    name: "1080p Gaming Rig",
    description: "Solid 1080p performance with high frame rates for competitive gaming.",
    price: 999,
    cpu: "AMD Ryzen 5 7600X",
    gpu: "NVIDIA RTX 4060 Ti",
    ram: "16GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "1080p Ultra",
    category: "Gaming",
    tags: ["1080p", "competitive", "high fps"],
  },
  {
    _id: "cur-3",
    name: "1440p Gaming Beast",
    description: "The sweet spot for gaming — high frame rates at 1440p with ray tracing support.",
    price: 1649,
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4070 Ti Super",
    ram: "32GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "1440p Ultra",
    category: "Gaming",
    tags: ["1440p", "ray tracing", "high end"],
  },
  {
    _id: "cur-4",
    name: "4K Gaming Monster",
    description: "Top-tier performance for 4K gaming with max settings and ray tracing.",
    price: 2899,
    cpu: "AMD Ryzen 7 7800X3D",
    gpu: "NVIDIA RTX 4080 Super",
    ram: "32GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "4K Ultra",
    category: "Gaming",
    tags: ["4k", "flagship", "ray tracing"],
  },

  /* Programming */
  {
    _id: "cur-5",
    name: "Web Development",
    description: "Optimized for frontend and backend development with fast compile times and multitasking.",
    price: 899,
    cpu: "AMD Ryzen 5 7600",
    gpu: "Integrated",
    ram: "32GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "Dev Ready",
    category: "Programming",
    tags: ["web dev", "fullstack", "fast"],
  },
  {
    _id: "cur-6",
    name: "Full Stack Development",
    description: "Powerful workstation for running multiple containers, VMs, and development environments.",
    price: 1399,
    cpu: "Intel Core i7-14700K",
    gpu: "NVIDIA RTX 4060",
    ram: "64GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "Pro Dev",
    category: "Programming",
    tags: ["fullstack", "docker", "vm"],
  },
  {
    _id: "cur-7",
    name: "AI / Machine Learning",
    description: "Built for training models with a powerful GPU and massive RAM for large datasets.",
    price: 2499,
    cpu: "AMD Ryzen 9 7900X",
    gpu: "NVIDIA RTX 4070 Ti Super",
    ram: "64GB DDR5",
    storage: "4TB NVMe",
    performanceBadge: "ML Ready",
    category: "Programming",
    tags: ["ai", "ml", "training", "gpu"],
  },

  /* Editing */
  {
    _id: "cur-8",
    name: "Premiere Pro Workstation",
    description: "Optimized for 4K video editing with GPU-accelerated rendering in Premiere Pro.",
    price: 1799,
    cpu: "Intel Core i7-14700K",
    gpu: "NVIDIA RTX 4070 Ti",
    ram: "64GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "4K Edit",
    category: "Editing",
    tags: ["premiere", "video", "4k"],
  },
  {
    _id: "cur-9",
    name: "DaVinci Resolve Build",
    description: "GPU-focused build for color grading and editing in DaVinci Resolve.",
    price: 2199,
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4080 Super",
    ram: "64GB DDR5",
    storage: "4TB NVMe",
    performanceBadge: "Color Pro",
    category: "Editing",
    tags: ["davinci", "color grading", "gpu"],
  },
  {
    _id: "cur-10",
    name: "After Effects Powerhouse",
    description: "High RAM and CPU for complex motion graphics and VFX compositing.",
    price: 2599,
    cpu: "Intel Core i9-14900K",
    gpu: "NVIDIA RTX 4070 Ti Super",
    ram: "128GB DDR5",
    storage: "4TB NVMe",
    performanceBadge: "VFX Pro",
    category: "Editing",
    tags: ["after effects", "motion graphics", "vfx"],
  },

  /* Design */
  {
    _id: "cur-11",
    name: "Photoshop & Illustrator",
    description: "Color-accurate display support with fast export times for graphic design.",
    price: 1199,
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4060 Ti",
    ram: "32GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "Design Pro",
    category: "Design",
    tags: ["photoshop", "illustrator", "graphic design"],
  },
  {
    _id: "cur-12",
    name: "Blender 3D Workstation",
    description: "Powerful GPU for 3D rendering and viewport performance in Blender.",
    price: 1999,
    cpu: "AMD Ryzen 9 7900X",
    gpu: "NVIDIA RTX 4070 Ti Super",
    ram: "64GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "3D Render",
    category: "Design",
    tags: ["blender", "3d", "rendering"],
  },
  {
    _id: "cur-13",
    name: "3D Modeling Pro",
    description: "Professional workstation for CAD, ZBrush, and complex 3D modeling workflows.",
    price: 3299,
    cpu: "AMD Ryzen 9 7950X",
    gpu: "NVIDIA RTX 4080 Super",
    ram: "128GB DDR5",
    storage: "4TB NVMe",
    performanceBadge: "CAD Pro",
    category: "Design",
    tags: ["cad", "zbrush", "modeling"],
  },

  /* Office */
  {
    _id: "cur-14",
    name: "Budget Office PC",
    description: "Affordable and efficient for everyday office tasks, browsing, and documents.",
    price: 449,
    cpu: "AMD Ryzen 5 7600",
    gpu: "Integrated",
    ram: "16GB DDR5",
    storage: "500GB NVMe",
    performanceBadge: "Essential",
    category: "Office",
    tags: ["budget", "office", "basic"],
  },
  {
    _id: "cur-15",
    name: "Productivity Workstation",
    description: "Smooth multitasking with multiple monitors for power users.",
    price: 899,
    cpu: "AMD Ryzen 7 7700X",
    gpu: "Integrated",
    ram: "32GB DDR5",
    storage: "1TB NVMe",
    performanceBadge: "Multi-Monitor",
    category: "Office",
    tags: ["productivity", "multitasking", "dual monitor"],
  },
  {
    _id: "cur-16",
    name: "Business Workstation",
    description: "Reliable and secure workstation for enterprise environments.",
    price: 1299,
    cpu: "Intel Core i7-14700K",
    gpu: "NVIDIA RTX 4060",
    ram: "64GB DDR5",
    storage: "2TB NVMe",
    performanceBadge: "Enterprise",
    category: "Office",
    tags: ["business", "enterprise", "security"],
  },
];

/* ─── Categories ─── */

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "Gaming", label: "Gaming", icon: Gamepad2 },
  { id: "Programming", label: "Programming", icon: Code2 },
  { id: "Editing", label: "Editing", icon: Film },
  { id: "Design", label: "Design", icon: Palette },
  { id: "Office", label: "Office", icon: Briefcase },
];

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
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

function CuratedCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface shadow-soft overflow-hidden">
      <Skeleton width="100%" height={180} shape="rect" />
      <div className="p-5 space-y-3">
        <Skeleton width="70%" height={18} shape="rounded" />
        <Skeleton width="100%" height={12} shape="rounded" />
        <Skeleton width="100%" height={12} shape="rounded" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton width="100%" height={12} shape="rounded" />
          <Skeleton width="100%" height={12} shape="rounded" />
          <Skeleton width="100%" height={12} shape="rounded" />
          <Skeleton width="100%" height={12} shape="rounded" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton width={80} height={24} shape="rounded" />
          <Skeleton width={120} height={36} shape="rounded" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function BuildsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading] = useState(false);

  const filteredBuilds =
    activeCategory === "all"
      ? MOCK_CURATED_BUILDS
      : MOCK_CURATED_BUILDS.filter((b) => b.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
      {/* ─── Header ─── */}
      <div className="text-center mb-10">
        <Badge variant="ai" className="mb-4">Curated Builds</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
          Suggested Builds
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Explore professionally curated PC configurations for gaming, programming,
          content creation and more.
        </p>
      </div>

      {/* ─── Category Filter Chips ─── */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={isActive}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                border transition-all duration-200 cursor-pointer
                focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
                ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-text-secondary hover:border-text-secondary/40 hover:text-text-primary"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* ─── Build count ─── */}
      <p className="text-sm text-text-secondary mb-6 text-center">
        {filteredBuilds.length} build{filteredBuilds.length !== 1 ? "s" : ""} available
      </p>

      {/* ─── Loading State ─── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CuratedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ─── Builds Grid ─── */}
      {!loading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          key={activeCategory}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredBuilds.map((build) => (
            <motion.div key={build._id} variants={item}>
              <Card padding="none" className="overflow-hidden flex flex-col h-full">
                {/* Cover area */}
                <div className="h-44 bg-gradient-to-br from-primary/8 to-purple-500/8 flex items-center justify-center relative">
                  <div className="text-center">
                    <Cpu className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                    <Badge variant="ai" className="text-[10px]">
                      {build.performanceBadge}
                    </Badge>
                  </div>
                  {/* Category pill */}
                  <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface/80 backdrop-blur text-text-secondary">
                    {build.category}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Title & description */}
                  <h3 className="text-base font-semibold text-text-primary mb-1 line-clamp-1">
                    {build.name}
                  </h3>
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                    {build.description}
                  </p>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Cpu className="w-3 h-3 shrink-0 text-primary/60" />
                      <span className="truncate">{build.cpu}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Monitor className="w-3 h-3 shrink-0 text-primary/60" />
                      <span className="truncate">{build.gpu}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <MemoryStick className="w-3 h-3 shrink-0 text-primary/60" />
                      <span className="truncate">{build.ram}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <HardDrive className="w-3 h-3 shrink-0 text-primary/60" />
                      <span className="truncate">{build.storage}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {build.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price & Actions */}
                  <div className="mt-auto pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold font-mono text-text-primary">
                        ${build.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/ai/build" className="flex-1">
                        <Button size="sm" className="w-full" icon={<Sparkles className="w-3.5 h-3.5" />}>
                          Generate This Build
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ─── Bottom CTA ─── */}
      <div className="mt-16 text-center">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-purple-500 to-primary overflow-hidden">
          <div className="rounded-2xl bg-surface p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Can&apos;t find what you need?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto mb-8">
              Let our AI generate a custom build tailored exactly to your budget
              and requirements.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/ai/build">
                <Button size="lg" icon={<Sparkles className="w-5 h-5" />}>
                  Generate Custom Build
                </Button>
              </Link>
              <Link href="/ai/compatibility">
                <Button variant="secondary" size="lg" icon={<Zap className="w-5 h-5" />}>
                  Check Compatibility
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
