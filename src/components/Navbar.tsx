"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Cpu,
  Home,
  Package,
  Wrench,
  FolderOpen,
  Sparkles,
  Cog,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBuild } from "@/lib/build-context";
import { useToast } from "@/components/ui/toast";
import { useCurrentTheme } from "@/lib/useCurrentTheme";
import ThemeToggle from "@/components/ThemeToggle";
import logoDark from "@/assets/images/logo-dark.png";
import logoLight from "@/assets/images/logo-light.png";
import Image from "next/image";

/* ─── Navigation config ─── */

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  requiresAuth: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home, requiresAuth: false },
  { label: "Products", href: "/products", icon: Package, requiresAuth: false },
  { label: "Builds", href: "/builds", icon: Cog, requiresAuth: false },
  { label: "My Builds", href: "/my-builds", icon: FolderOpen, requiresAuth: true },
  { label: "AI Assistant", href: "/ai", icon: Sparkles, requiresAuth: true },
];

/* ─── Helpers ─── */

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

/* ─── Component ─── */

export default function Navbar() {
  const theme = useCurrentTheme();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { itemCount } = useBuild();
  const { showToast } = useToast();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Filter nav items based on auth */
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.requiresAuth || user
  );

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
      showToast("success", "Logged out");
      setDropdownOpen(false);
      router.push("/");
    } catch {
      showToast("error", "Logout failed");
    }
  }

  /* ─── Shared nav link renderer ─── */

  function renderNavLink(item: NavItem, isMobile = false) {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;

    if (isMobile) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
            ${
              active
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            }
          `}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {item.label}
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          transition-all duration-200
          focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
          ${
            active
              ? "bg-primary/10 text-primary"
              : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          }
        `}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-200 ${
        scrolled
          ? "bg-surface/95 shadow-soft border-border/80"
          : "bg-surface/80 border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-text-primary">
          <Image
            src={theme === "dark" ? logoLight : logoDark}
            alt="BuildWise AI"
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {visibleNavItems.map((item) => renderNavLink(item))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Current Build badge */}
          <Link
            href="/my-builds"
            className="relative flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Build</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-text-primary">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-elevated border border-border py-1 z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-surface-2 transition-colors w-full focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-text-primary transition-all hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover hover:shadow-glow-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-primary p-1 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-1">
          {visibleNavItems.map((item) => renderNavLink(item, true))}
        </div>
      )}
    </nav>
  );
}
