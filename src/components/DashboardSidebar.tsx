"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bookmark,
  Heart,
  Bot,
  Package,
  Users,
  BarChart3,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui";

interface SidebarLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  isAdminSection?: boolean;
}

const links: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/builds", label: "Saved Builds", icon: Bookmark },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/ai-history", label: "AI History", icon: Bot },
  {
    href: "/dashboard/admin",
    label: "Admin Dashboard",
    icon: BarChart3,
    adminOnly: true,
    isAdminSection: true,
  },
  {
    href: "/dashboard/admin/products",
    label: "Manage Products",
    icon: Package,
    adminOnly: true,
    isAdminSection: true,
  },
  {
    href: "/dashboard/admin/users",
    label: "Manage Users",
    icon: Users,
    adminOnly: true,
    isAdminSection: true,
  },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const regularLinks = links.filter(
    (l) => !l.adminOnly && !l.isAdminSection
  );
  const adminLinks = links.filter((l) => l.adminOnly && isAdmin);

  const renderLinks = (items: SidebarLink[]) =>
    items.map((link) => {
      const Icon = link.icon;
      const isActive =
        link.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          aria-current={isActive ? "page" : undefined}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
            ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            }
          `}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {link.label}
        </Link>
      );
    });

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-4">
      {renderLinks(regularLinks)}
      {adminLinks.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-3 pt-4 pb-2 mt-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Admin
            </span>
          </div>
          {renderLinks(adminLinks)}
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar src={user?.image as string | undefined} name={user?.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.name}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile/tablet drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 lg:hidden shadow-elevated overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar src={user?.image as string | undefined} name={user?.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
