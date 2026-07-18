"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Dashboard
      </h1>
      <p className="text-text-secondary">
        Welcome back, {user?.name ?? "User"}
      </p>
    </div>
  );
}
