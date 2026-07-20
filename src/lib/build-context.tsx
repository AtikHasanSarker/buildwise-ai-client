"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./products";

/* ─── Types ─── */

export interface BuildItem {
  productId: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  specifications?: Record<string, string | number>;
}

interface BuildContextValue {
  items: BuildItem[];
  totalPrice: number;
  totalWattage: number;
  itemCount: number;
  addToBuild: (product: Product) => void;
  removeFromBuild: (productId: string) => void;
  replaceInBuild: (product: Product) => void;
  clearBuild: () => void;
  isInBuild: (productId: string) => boolean;
}

/* ─── Wattage estimation (matches server-side logic) ─── */

const WATTAGE_ESTIMATES: Record<string, number> = {
  CPU: 125,
  GPU: 200,
  Motherboard: 50,
  RAM: 10,
  SSD: 10,
  HDD: 10,
  PSU: 0,
  Case: 5,
  Cooler: 10,
};

function estimateWattage(item: BuildItem): number {
  const specs = item.specifications;
  if (specs) {
    if (typeof specs.tdp === "number") return specs.tdp;
    if (typeof specs.wattageDraw === "number") return specs.wattageDraw;
  }
  return WATTAGE_ESTIMATES[item.category] ?? 30;
}

/* ─── localStorage helpers ─── */

const STORAGE_KEY = "buildwise-current-build";

function loadBuildFromStorage(): BuildItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBuildToStorage(items: BuildItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ─── Context ─── */

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BuildItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadBuildFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (hydrated) {
      saveBuildToStorage(items);
    }
  }, [items, hydrated]);

  const addToBuild = useCallback((product: Product) => {
    setItems((prev) => {
      // Prevent duplicate
      if (prev.some((i) => i.productId === product._id)) return prev;

      const newItem: BuildItem = {
        productId: product._id,
        category: product.category,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images?.[0],
        specifications: product.specifications,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromBuild = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const replaceInBuild = useCallback((product: Product) => {
    setItems((prev) => {
      const newItem: BuildItem = {
        productId: product._id,
        category: product.category,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images?.[0],
        specifications: product.specifications,
      };
      return [
        ...prev.filter((i) => i.category !== product.category),
        newItem,
      ];
    });
  }, []);

  const clearBuild = useCallback(() => {
    setItems([]);
  }, []);

  const isInBuild = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
  const totalWattage = items.reduce((sum, i) => sum + estimateWattage(i), 0);

  return (
    <BuildContext.Provider
      value={{
        items,
        totalPrice,
        totalWattage,
        itemCount: items.length,
        addToBuild,
        removeFromBuild,
        replaceInBuild,
        clearBuild,
        isInBuild,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild(): BuildContextValue {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used within BuildProvider");
  return ctx;
}
