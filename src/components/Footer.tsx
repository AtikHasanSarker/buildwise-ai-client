"use client";

import Link from "next/link";
import { Code2, MessageCircle, Globe, ExternalLink, Send } from "lucide-react";
import { Card } from "@/components/ui";

const linkColumns = [
  {
    title: "Product",
    links: [
      { label: "Explore", href: "/products" },
      { label: "PC Builds", href: "/builds" },
      { label: "AI Assistant", href: "/ai" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Code2, href: "#", label: "GitHub" },
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Globe, href: "#", label: "Website" },
  { icon: ExternalLink, href: "#", label: "Blog" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link
              href="/"
              className="text-xl font-bold text-text-primary mb-3 inline-block"
            >
              BuildWise
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              AI-powered PC build marketplace. Find compatible components,
              optimize your budget, and build the perfect setup with intelligent
              recommendations.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-medium text-text-primary mb-2">
                Stay updated
              </p>
              <Card hover={false} padding="sm" className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
                  aria-label="Email for newsletter"
                />
                <button
                  className="rounded-full bg-primary p-2 text-white hover:bg-primary-hover transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </Card>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} BuildWise AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label={s.label}
              >
                <s.icon className="w-5 h-5" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
