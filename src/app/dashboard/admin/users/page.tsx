"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, Button, Badge, Modal, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/lib/api-client";

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

async function fetchUsers(
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () => fetchUsers(page, limit, search),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast("success", "User deleted successfully");
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      showToast("error", error.message || "Failed to delete user");
    },
  });

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
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-text-primary">Manage Users</h1>
        <p className="text-sm text-text-secondary mt-1">
          {data ? `${data.total} users total` : "Loading..."}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button variant="secondary" size="md" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item}>
        <Card hover={false} padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton width={32} height={32} shape="circle" />
                          <Skeleton width={100} height={14} shape="rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={140} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={60} height={20} shape="rounded" />
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Skeleton width={80} height={14} shape="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={40} height={14} shape="rounded" />
                      </td>
                    </tr>
                  ))
                ) : data?.users && data.users.length > 0 ? (
                  data.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setRoleChangeUser(user);
                            setNewRole(
                              user.role === "admin" ? "user" : "admin"
                            );
                          }}
                          className="cursor-pointer"
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
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <Users className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-text-secondary">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="text-sm text-text-secondary px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
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
            loading={deleteMutation.isPending}
            onClick={() => {
              if (deleteUser) {
                deleteMutation.mutate(deleteUser.id);
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
            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
              newRole === "user"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-text-secondary/40 text-text-secondary"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setNewRole("admin")}
            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
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
