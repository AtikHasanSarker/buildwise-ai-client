"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Skeleton,
  ProductCardSkeleton,
  TextLineSkeleton,
  Modal,
  Avatar,
} from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ShoppingCart, Heart, Zap } from "lucide-react";

export default function UiKitPage() {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-secondary text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-h1 font-extrabold mb-2">UI Kit</h1>
          <p className="text-text-secondary text-lg">
            BuildWise Design System — all components & variants
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-16">
        {/* ─── COLORS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: "Primary", light: "#2563EB", dark: "#3B82F6", cls: "bg-primary" },
              { name: "Secondary", light: "#0F172A", dark: "#0B0F19", cls: "bg-secondary" },
              { name: "Accent", light: "#F59E0B", dark: "#FBBF24", cls: "bg-accent" },
              { name: "Surface", light: "#FFFFFF", dark: "#111827", cls: "bg-surface" },
              { name: "Success", light: "#16A34A", dark: "#22C55E", cls: "bg-success" },
              { name: "Warning", light: "#F59E0B", dark: "#FBBF24", cls: "bg-warning" },
              { name: "Error", light: "#DC2626", dark: "#EF4444", cls: "bg-error" },
            ].map((c) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div className={`${c.cls} h-16 rounded-xl shadow-soft`} />
                <span className="text-xs font-medium text-text-primary">{c.name}</span>
                <span className="text-[10px] text-text-secondary">{c.light}</span>
              </div>
            ))}
          </div>
          {/* Gradient demos */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="h-20 rounded-xl shadow-soft flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              gradient-primary
            </div>
            <div
              className="h-20 rounded-xl shadow-soft flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: "var(--gradient-accent)" }}
            >
              gradient-accent
            </div>
          </div>
          <div
            className="mt-3 h-32 rounded-xl border border-border flex items-center justify-center text-text-secondary text-sm"
            style={{ background: "var(--gradient-mesh)" }}
          >
            gradient-mesh (hero background)
          </div>
        </section>

        {/* ─── TYPOGRAPHY ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Typography</h2>
          <div className="flex flex-col gap-3 bg-surface rounded-xl shadow-soft p-6">
            <h1 className="text-h1 font-extrabold text-text-primary">H1 — Hero (56px)</h1>
            <h2 className="text-h2 font-bold text-text-primary">H2 — Section (36px)</h2>
            <h3 className="text-h3 font-semibold text-text-primary">H3 — Card title (20px)</h3>
            <p className="text-body text-text-primary">Body — Regular text (16px)</p>
            <p className="text-small text-text-secondary">Small/Caption — Secondary text (13px)</p>
            <p className="text-price font-bold font-mono text-primary">$1,299.00</p>
          </div>
        </section>

        {/* ─── SHADOWS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Shadows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-xl p-6 shadow-soft text-center text-sm text-text-secondary">
              shadow-soft
            </div>
            <div className="bg-surface rounded-xl p-6 shadow-elevated text-center text-sm text-text-secondary">
              shadow-elevated
            </div>
            <div className="bg-surface rounded-xl p-6 shadow-glow-primary text-center text-sm text-text-secondary">
              shadow-glow-primary
            </div>
          </div>
        </section>

        {/* ─── BUTTONS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Buttons</h2>
          <div className="flex flex-col gap-8">
            {/* Variants */}
            <div>
              <p className="text-small text-text-secondary mb-3 font-medium">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            {/* Sizes */}
            <div>
              <p className="text-small text-text-secondary mb-3 font-medium">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            {/* States */}
            <div>
              <p className="text-small text-text-secondary mb-3 font-medium">States</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon={<ShoppingCart className="w-4 h-4" />}>With Icon</Button>
                <Button
                  variant="secondary"
                  icon={<Heart className="w-4 h-4" />}
                >
                  Favorite
                </Button>
              </div>
            </div>
            {/* Gradient primary */}
            <div>
              <p className="text-small text-text-secondary mb-3 font-medium">Gradient CTA</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="!bg-gradient-to-r !from-primary !to-purple-600"
                  icon={<Zap className="w-4 h-4" />}
                >
                  Generate Build
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CARDS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-h3 font-semibold text-text-primary mb-2">Basic Card</h3>
              <p className="text-sm text-text-secondary">
                Hover me — I lift up with elevated shadow.
              </p>
            </Card>
            <Card hover={false} padding="lg">
              <h3 className="text-h3 font-semibold text-text-primary mb-2">No Hover</h3>
              <p className="text-sm text-text-secondary">
                Large padding, no hover animation.
              </p>
            </Card>
            <Card className="border border-primary/20">
              <Badge variant="ai">AI Recommended</Badge>
              <h3 className="text-h3 font-semibold text-text-primary mt-3 mb-2">
                Gaming Build
              </h3>
              <p className="text-sm font-mono text-primary font-bold">$1,849.00</p>
            </Card>
          </div>
        </section>

        {/* ─── INPUTS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Inputs</h2>
          <div className="max-w-md flex flex-col gap-4">
            <Input label="Email" placeholder="you@example.com" />
            <Input label="Password" type="password" placeholder="Enter password" />
            <Input label="With Error" placeholder="Type something" error="This field is required" />
            <Textarea label="Description" placeholder="Write something..." />
            <Textarea label="Error Textarea" placeholder="..." error="Too many characters" />
          </div>
        </section>

        {/* ─── BADGES ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Badges</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="ai">AI Recommended</Badge>
            <Badge variant="success">In Stock</Badge>
            <Badge variant="warning">Partial</Badge>
            <Badge variant="error">Out of Stock</Badge>
          </div>
        </section>

        {/* ─── AVATARS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Avatars</h2>
          <div className="flex items-center gap-4">
            <Avatar size="sm" name="John Doe" />
            <Avatar size="md" name="Jane Smith" />
            <Avatar size="lg" name="Alex K" />
            <Avatar size="lg" />
            <Avatar
              size="lg"
              src="https://i.pravatar.cc/150?img=12"
              name="Photo User"
            />
          </div>
        </section>

        {/* ─── SKELETONS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Skeletons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Basic shapes */}
            <div className="flex flex-col gap-3">
              <p className="text-small text-text-secondary font-medium">Basic Shapes</p>
              <Skeleton width="100%" height={120} shape="rounded" />
              <Skeleton width={60} height={60} shape="circle" />
              <Skeleton width="80%" height={16} shape="rounded" />
            </div>
            {/* Product card skeleton */}
            <div>
              <p className="text-small text-text-secondary font-medium mb-3">Product Card</p>
              <ProductCardSkeleton />
            </div>
            {/* Text lines */}
            <div>
              <p className="text-small text-text-secondary font-medium mb-3">Text Lines</p>
              <TextLineSkeleton lines={5} />
            </div>
          </div>
        </section>

        {/* ─── MODAL ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm Action"
          >
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to proceed? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        </section>

        {/* ─── TOASTS ─── */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-6">Toasts</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => showToast("success", "Build saved successfully!")}
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast("error", "Failed to load products.")}
            >
              Error Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showToast("warning", "Some components may not be compatible.")
              }
            >
              Warning Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showToast("info", "New AI features are now available.")
              }
            >
              Info Toast
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
