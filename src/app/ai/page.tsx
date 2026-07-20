"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowRightLeft,
  MessageCircle,
  BookOpen,
  Bot,
  Gamepad2,
  Code2,
  Film,
  Building2,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Calendar,
  Clock,
  Play,
  Plus,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Box,
} from "lucide-react";
import { Card, Button, Badge, Skeleton } from "@/components/ui";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface Conversation {
  _id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/* ──────────────────────────────────────────────
   Mock data
   ────────────────────────────────────────────── */

// TODO: Replace with GET /api/v1/ai/conversations?limit=5
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: "conv-1",
    title: "Gaming PC under $1500",
    lastMessage: "I recommend the RTX 4070 Ti Super with a Ryzen 7 7800X3D for the best 1440p gaming experience within your budget.",
    createdAt: "2025-07-18T14:30:00Z",
    updatedAt: "2025-07-18T14:35:00Z",
    messageCount: 8,
  },
  {
    _id: "conv-2",
    title: "Intel vs AMD comparison",
    lastMessage: "For your use case, AMD's Ryzen 7 7800X3D offers better value with superior gaming performance and lower power consumption.",
    createdAt: "2025-07-16T09:15:00Z",
    updatedAt: "2025-07-16T09:22:00Z",
    messageCount: 12,
  },
  {
    _id: "conv-3",
    title: "Video editing workstation",
    lastMessage: "For 4K video editing, I suggest the Intel Core i9-14900K with 64GB DDR5 RAM and an RTX 4070 Ti for GPU-accelerated rendering.",
    createdAt: "2025-07-14T11:00:00Z",
    updatedAt: "2025-07-14T11:08:00Z",
    messageCount: 6,
  },
];

// TODO: Replace with GET /api/v1/ai/stats
const MOCK_STATS = {
  buildsGenerated: 24,
  compatibilityChecks: 18,
  aiChats: 42,
  savedConversations: 3,
};

/* ──────────────────────────────────────────────
   Animation helpers
   ────────────────────────────────────────────── */

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

/* ──────────────────────────────────────────────
   Animated counter hook
   ────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────
   Scroll-reveal wrapper
   ────────────────────────────────────────────── */

function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
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

/* ──────────────────────────────────────────────
   Feature data
   ────────────────────────────────────────────── */

const AI_FEATURES = [
  {
    title: "AI Build Generator",
    description: "Tell the AI your budget and purpose — it picks the optimal components for you in seconds.",
    icon: Sparkles,
    href: "/ai/build",
    color: "from-primary to-purple-600",
    highlights: ["Budget-aware", "Brand preferences", "One-click save"],
  },
  {
    title: "Compatibility Checker",
    description: "Select components and let the AI verify socket types, wattage, form factors, and more.",
    icon: ArrowRightLeft,
    href: "/ai/compatibility",
    color: "from-emerald-500 to-teal-600",
    highlights: ["8+ checks", "Auto-swap fixes", "Visual map"],
  },
  {
    title: "AI Chat Assistant",
    description: "Ask anything about PC components, get personalized recommendations, and compare parts.",
    icon: MessageCircle,
    href: "/ai#conversations",
    color: "from-amber-500 to-orange-600",
    highlights: ["Real-time streaming", "Saves history", "Expert knowledge"],
  },
  {
    title: "Saved Conversations",
    description: "Revisit your past AI conversations, pick up where you left off, and refine your builds.",
    icon: BookOpen,
    href: "/ai#conversations",
    color: "from-pink-500 to-rose-600",
    highlights: ["Persistent history", "Continue anytime", "Build context"],
  },
];

const QUICK_PROMPTS = [
  { label: "Build a Gaming PC under $1000", icon: Gamepad2 },
  { label: "Best Programming PC", icon: Code2 },
  { label: "Recommend an Editing PC", icon: Film },
  { label: "Intel vs AMD", icon: Cpu },
  { label: "RTX 5060 Build", icon: Monitor },
];

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: "Choose Your Goal",
    description: "Tell the AI what you need — gaming, programming, editing, or office work — and set your budget.",
    icon: Lightbulb,
  },
  {
    step: 2,
    title: "Generate Build",
    description: "The AI analyzes thousands of components to find the optimal parts for your specific needs.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Save or Continue",
    description: "Save your build for later, check compatibility, or refine it with follow-up questions.",
    icon: Shield,
  },
];

/* ──────────────────────────────────────────────
   Loading skeleton
   ────────────────────────────────────────────── */

function AiHubSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
      {/* Hero skeleton */}
      <div className="text-center py-16 space-y-4">
        <Skeleton width={120} height={28} shape="rounded" className="mx-auto" />
        <Skeleton width="60%" height={40} shape="rounded" className="mx-auto" />
        <Skeleton width="45%" height={20} shape="rounded" className="mx-auto" />
        <div className="flex gap-3 justify-center pt-4">
          <Skeleton width={180} height={48} shape="rounded" />
          <Skeleton width={200} height={48} shape="rounded" />
        </div>
      </div>

      {/* Features skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface shadow-soft p-6 space-y-4">
            <Skeleton width={48} height={48} shape="rounded" />
            <Skeleton width="70%" height={18} shape="rounded" />
            <Skeleton width="100%" height={12} shape="rounded" />
            <Skeleton width="100%" height={12} shape="rounded" />
            <div className="flex gap-2 pt-2">
              <Skeleton width={60} height={22} shape="rounded" />
              <Skeleton width={50} height={22} shape="rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface shadow-soft p-6 text-center space-y-2">
            <Skeleton width={40} height={40} shape="circle" className="mx-auto" />
            <Skeleton width={80} height={28} shape="rounded" className="mx-auto" />
            <Skeleton width={100} height={14} shape="rounded" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Animated counter card
   ────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Zap;
  value: number;
  label: string;
  color: string;
}) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="rounded-xl bg-surface shadow-soft p-6 text-center">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-bold font-mono text-text-primary">{count}</p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */

export default function AiHubPage() {
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [loading] = useState(false);

  // TODO: Replace with real data fetching
  // const { data: conversations, isLoading } = useQuery({
  //   queryKey: ["ai-conversations"],
  //   queryFn: fetchConversations,
  // });

  if (loading) {
    return <AiHubSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
      {/* ─── Hero Section ─── */}
      <SectionReveal>
        <div className="text-center py-12 md:py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6"
          >
            <Bot className="w-10 h-10 text-white" />
          </motion.div>

          <Badge variant="ai" className="mb-4">AI-Powered</Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            Your AI PC Building{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            Let artificial intelligence find the perfect components, optimize your
            budget, and build the ideal setup — all in seconds.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/ai/build">
              <Button size="lg" icon={<Sparkles className="w-5 h-5" />}>
                Generate AI Build
              </Button>
            </Link>
            <Link href="/ai/compatibility">
              <Button variant="secondary" size="lg" icon={<ArrowRightLeft className="w-5 h-5" />}>
                Compatibility Checker
              </Button>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* ─── AI Features Grid ─── */}
      <SectionReveal>
        <div className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              AI-Powered Features
            </h2>
            <p className="text-text-secondary">
              Everything you need to build the perfect PC, powered by AI
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Link href={feature.href} className="block h-full">
                    <Card padding="none" className="h-full flex flex-col overflow-hidden">
                      <div className="p-6 flex flex-col flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-secondary mb-4 flex-1">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {feature.highlights.map((h) => (
                            <span
                              key={h}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface-2/50">
                        <span className="text-sm font-medium text-primary">Explore</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── Quick Prompt Suggestions ─── */}
      <SectionReveal>
        <div className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              Quick Prompts
            </h2>
            <p className="text-text-secondary">
              Jump right in with these popular starting points
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {QUICK_PROMPTS.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <Link key={prompt.label} href="/ai/build">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text-primary">{prompt.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ─── Recent AI Conversations ─── */}
      <SectionReveal id="conversations">
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                Recent Conversations
              </h2>
              <p className="text-text-secondary text-sm">
                Pick up where you left off
              </p>
            </div>
          </div>

          {conversations.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Conversations Yet
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                Start a conversation with the AI assistant to get personalized
                recommendations and build suggestions.
              </p>
              <Link href="/ai/build">
                <Button icon={<Plus className="w-4 h-4" />}>
                  Start Your First Build
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {conversations.map((conv) => (
                <motion.div key={conv._id} variants={staggerItem}>
                  <Card padding="none" className="h-full flex flex-col">
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {conv.title}
                        </h3>
                        <Badge variant="default" className="shrink-0">
                          {conv.messageCount} msgs
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-3 flex-1">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-border">
                      <Link
                        href="/ai/build"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Continue
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </SectionReveal>

      {/* ─── AI Statistics ─── */}
      <SectionReveal>
        <div className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              Your AI Activity
            </h2>
            <p className="text-text-secondary">
              Track how you&apos;ve been using the AI tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Sparkles}
              value={MOCK_STATS.buildsGenerated}
              label="Builds Generated"
              color="from-primary to-purple-600"
            />
            <StatCard
              icon={ArrowRightLeft}
              value={MOCK_STATS.compatibilityChecks}
              label="Compatibility Checks"
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={MessageCircle}
              value={MOCK_STATS.aiChats}
              label="AI Chats"
              color="from-amber-500 to-orange-600"
            />
            <StatCard
              icon={BookOpen}
              value={MOCK_STATS.savedConversations}
              label="Saved Conversations"
              color="from-pink-500 to-rose-600"
            />
          </div>
        </div>
      </SectionReveal>

      {/* ─── Getting Started ─── */}
      <SectionReveal>
        <div className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              Getting Started
            </h2>
            <p className="text-text-secondary">
              Three simple steps to your perfect PC build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {GETTING_STARTED_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/ai/build">
              <Button size="lg" icon={<Sparkles className="w-5 h-5" />}>
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* ─── Bottom CTA ─── */}
      <SectionReveal>
        <div className="py-12">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-purple-500 to-primary overflow-hidden">
            <div className="rounded-2xl bg-surface p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                Ready to Build Your Dream PC?
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto mb-8">
                Let our AI analyze thousands of components to find the perfect
                match for your budget and needs. It only takes a few seconds.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/ai/build">
                  <Button size="lg" icon={<Sparkles className="w-5 h-5" />}>
                    Generate AI Build
                  </Button>
                </Link>
                <Link href="/ai/compatibility">
                  <Button variant="secondary" size="lg" icon={<ArrowRightLeft className="w-5 h-5" />}>
                    Check Compatibility
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
