"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function ManageProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Manage Products
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-text-secondary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Product management coming soon
        </h2>
        <p className="text-sm text-text-secondary max-w-sm">
          Admin tools for adding, editing, and managing products will be available
          here.
        </p>
      </motion.div>
    </div>
  );
}
