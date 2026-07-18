"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function AIHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">AI History</h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
          <Bot className="w-10 h-10 text-text-secondary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          AI History coming soon
        </h2>
        <p className="text-sm text-text-secondary max-w-sm">
          Your AI build conversations and recommendations will appear here once
          the AI module is fully integrated.
        </p>
      </motion.div>
    </div>
  );
}
