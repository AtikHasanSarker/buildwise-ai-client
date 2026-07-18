"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Mobile menu trigger */}
          <div className="lg:hidden sticky top-16 z-30 bg-bg border-b border-border px-4 py-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
              Menu
            </button>
          </div>

          <div className="p-4 md:p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
