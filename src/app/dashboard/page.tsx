"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Heart, Bot, Edit } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Card, Button, Skeleton } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import apiClient from "@/lib/api-client";

interface Stats {
  buildsCount: number;
  favoritesCount: number;
  aiConversationsCount: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: null;
}

async function fetchStats(): Promise<Stats> {
  const [buildsRes, favoritesRes] = await Promise.all([
    apiClient.get("/builds?limit=1"),
    apiClient.get("/favorites"),
  ]);

  const buildsTotal = (buildsRes as unknown as Envelope<{ total: number }>).data?.total ?? 0;
  const favoritesData = (favoritesRes as unknown as Envelope<{ products: unknown[] }>).data;
  const favoritesTotal = Array.isArray(favoritesData?.products)
    ? favoritesData.products.length
    : 0;

  return {
    buildsCount: buildsTotal,
    favoritesCount: favoritesTotal,
    aiConversationsCount: 0,
  };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchStats,
  });

  const statCards = [
    {
      label: "Saved Builds",
      value: stats?.buildsCount ?? 0,
      icon: Bookmark,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Favorites",
      value: stats?.favoritesCount ?? 0,
      icon: Heart,
      color: "text-error",
      bg: "bg-error/10",
    },
    {
      label: "AI Conversations",
      value: stats?.aiConversationsCount ?? 0,
      icon: Bot,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Profile Card */}
      <motion.div variants={item}>
        <Card hover={false} padding="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar src={user?.avatar} name={user?.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-text-primary">
                {user?.name ?? "User"}
              </h1>
              <p className="text-sm text-text-secondary mt-1">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {user?.role}
              </span>
            </div>
            <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>
              Edit Profile
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card hover={false} padding="lg">
                {statsLoading ? (
                  <div className="space-y-3">
                    <Skeleton width={40} height={40} shape="rounded" />
                    <Skeleton width="60%" height={16} shape="rounded" />
                    <Skeleton width="40%" height={28} shape="rounded" />
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
