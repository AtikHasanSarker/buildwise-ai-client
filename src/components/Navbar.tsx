"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-text-primary">
          BuildWise
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Products
          </Link>
          <Link
            href="/builds"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Builds
          </Link>
          <Link
            href="/ai"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            AI Assistant
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-surface-2 transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-surface-2 transition-colors w-full"
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
                className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-text-primary transition-all hover:bg-surface-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover hover:shadow-glow-primary"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-primary p-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3">
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Products
          </Link>
          <Link
            href="/builds"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Builds
          </Link>
          <Link
            href="/ai"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            AI Assistant
          </Link>
        </div>
      )}
    </nav>
  );
}
