"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  Bot,
  DollarSign,
  TrendingUp,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, Button, Badge, Modal, Skeleton, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";

/* ─── Types ─── */

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalBuilds: number;
  totalAIRequests: number;
  revenueEstimate: number;
  productsByCategory?: { category: string; count: number }[];
  aiUsageOverTime?: { date: string; count: number }[];
  userGrowthOverTime?: { date: string; count: number }[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "guest" | "user" | "admin";
  createdAt: string;
  avatar?: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  error: null;
}

/* ─── Fetchers ─── */

async function fetchAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get<Envelope<AdminStats>>("/admin/stats");
  return res.data.data;
}

async function fetchAdminUsers(
  page: number,
  limit: number,
  search: string
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  const res = await apiClient.get<Envelope<AdminUsersResponse>>(
    `/admin/users?${params.toString()}`
  );
  return res.data.data;
}

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

/* ─── Chart Colors ─── */

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#16a34a",
  "#dc2626",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  prefix,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
  bg: string;
  prefix?: string;
}) {
  return (
    <Card hover={false} padding="lg">
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">
        {prefix}
        {value.toLocaleString()}
      </p>
    </Card>
  );
}

/* ─── Main Page ─── */

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Users pagination & search
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const usersLimit = 8;

  // Delete user modal
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  // Role change modal
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", usersPage, userSearch],
    queryFn: () => fetchAdminUsers(usersPage, usersLimit, userSearch),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      showToast("success", "User deleted successfully");
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to delete user");
    },
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiClient.put(`/admin/users/${userId}/role`, { role });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast("success", "User role updated");
      setRoleChangeUser(null);
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to update role");
    },
  });

  const handleSearch = () => {
    setUserSearch(searchInput);
    setUsersPage(1);
  };

  const totalPages = usersData
    ? Math.ceil(usersData.total / usersLimit)
    : 1;

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          label: "Total Products",
          value: stats.totalProducts,
          icon: Package,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          label: "Total Builds",
          value: stats.totalBuilds,
          icon: TrendingUp,
          color: "text-accent",
          bg: "bg-accent/10",
        },
        {
          label: "AI Requests",
          value: stats.totalAIRequests,
          icon: Bot,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
        {
          label: "Revenue Estimate",
          value: stats.revenueEstimate,
          icon: DollarSign,
          color: "text-success",
          bg: "bg-success/10",
          prefix: "$",
        },
      ]
    : [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page Title */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Overview of your marketplace
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i} variants={item}>
                <Card hover={false} padding="lg">
                  <div className="space-y-3">
                    <Skeleton width={40} height={40} shape="rounded" />
                    <Skeleton width="60%" height={14} shape="rounded" />
                    <Skeleton width="40%" height={28} shape="rounded" />
                  </div>
                </Card>
              </motion.div>
            ))
          : statCards.map((stat) => (
              <motion.div key={stat.label} variants={item}>
                <StatCard {...stat} />
              </motion.div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category */}
        <motion.div variants={item}>
          <Card hover={false} padding="lg">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              Products by Category
            </h3>
            {statsLoading ? (
              <Skeleton width="100%" height={250} shape="rounded" />
            ) : stats?.productsByCategory &&
              stats.productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.productsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-62.5 text-text-secondary text-sm">
                No category data available
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI Usage Over Time */}
        <motion.div variants={item}>
          <Card hover={false} padding="lg">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              AI Usage Over Time
            </h3>
            {statsLoading ? (
              <Skeleton width="100%" height={250} shape="rounded" />
            ) : stats?.aiUsageOverTime && stats.aiUsageOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.aiUsageOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-62.5 text-text-secondary text-sm">
                No AI usage data available
              </div>
            )}
          </Card>
        </motion.div>

        {/* User Growth */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card hover={false} padding="lg">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              User Growth
            </h3>
            {statsLoading ? (
              <Skeleton width="100%" height={250} shape="rounded" />
            ) : stats?.userGrowthOverTime &&
              stats.userGrowthOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.userGrowthOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-success)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-success)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-62.5 text-text-secondary text-sm">
                No user growth data available
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Manage Users Table */}
      <motion.div variants={item}>
        <Card hover={false} padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-text-primary">
              Manage Users
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all w-64"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3 pr-4">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3 pr-4">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3 pr-4">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3 pr-4">
                    Joined
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        <Skeleton width={120} height={14} shape="rounded" />
                      </td>
                      <td className="py-3 pr-4">
                        <Skeleton width={160} height={14} shape="rounded" />
                      </td>
                      <td className="py-3 pr-4">
                        <Skeleton width={60} height={24} shape="rounded" />
                      </td>
                      <td className="py-3 pr-4">
                        <Skeleton width={80} height={14} shape="rounded" />
                      </td>
                      <td className="py-3">
                        <Skeleton width={60} height={14} shape="rounded" />
                      </td>
                    </tr>
                  ))
                ) : usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-text-primary">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-text-secondary">
                          {user.email}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => {
                            setRoleChangeUser(user);
                            setNewRole(
                              user.role === "admin" ? "user" : "admin"
                            );
                          }}
                          className="cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "accent"
                                : user.role === "user"
                                ? "success"
                                : "default"
                            }
                          >
                            {user.role}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2"
                          aria-label={`Delete user ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-secondary text-sm">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData && usersData.total > usersLimit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary">
                Showing {(usersPage - 1) * usersLimit + 1}–
                {Math.min(usersPage * usersLimit, usersData.total)} of{" "}
                {usersData.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={usersPage <= 1}
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="text-sm text-text-secondary px-2">
                  {usersPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={usersPage >= totalPages}
                  onClick={() => setUsersPage((p) => p + 1)}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete User Modal */}
      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
      >
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-text-primary">
            {deleteUser?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteUser(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={deleteUserMutation.isPending}
            onClick={() => {
              if (deleteUser) {
                deleteUserMutation.mutate(deleteUser.id);
              }
            }}
            className="bg-error hover:bg-error/90 text-white"
          >
            Delete User
          </Button>
        </div>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        open={!!roleChangeUser}
        onClose={() => setRoleChangeUser(null)}
        title="Change User Role"
      >
        <p className="text-sm text-text-secondary mb-2">
          Change role for{" "}
          <span className="font-medium text-text-primary">
            {roleChangeUser?.name}
          </span>
        </p>
        <p className="text-xs text-warning mb-4">
          ⚠️ This is a sensitive action. Changing to admin grants full access.
        </p>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setNewRole("user")}
            aria-pressed={newRole === "user"}
            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium text-center transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              newRole === "user"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-text-secondary/40 text-text-secondary"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setNewRole("admin")}
            aria-pressed={newRole === "admin"}
            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium text-center transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              newRole === "admin"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-text-secondary/40 text-text-secondary"
            }`}
          >
            Admin
          </button>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRoleChangeUser(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={roleChangeMutation.isPending}
            onClick={() => {
              if (roleChangeUser) {
                roleChangeMutation.mutate({
                  userId: roleChangeUser.id,
                  role: newRole,
                });
              }
            }}
          >
            Update Role
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
