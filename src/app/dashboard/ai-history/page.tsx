"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

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
          No AI conversations yet
        </h2>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          Start a conversation with the AI assistant to get build
          recommendations, compatibility checks, and component suggestions.
        </p>
        <Link href="/ai/build">
          <Button
            icon={<Sparkles className="w-4 h-4" />}
            className="focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Try AI Build Generator
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
