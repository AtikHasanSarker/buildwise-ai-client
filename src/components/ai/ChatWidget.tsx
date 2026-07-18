"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  History,
  Trash2,
  LogIn,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import apiClient from "@/lib/api-client";

/* ─── Types ─── */

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface ConversationDetail {
  id: string;
  messages: { role: string; content: string; createdAt: string }[];
  createdAt: string;
}

/* ─── Default suggested prompts ─── */

const DEFAULT_PROMPTS = [
  "Compare RTX 4070 vs 4080",
  "Suggest an upgrade for my build",
  "Best CPU under $300",
  "Is 32GB RAM enough for gaming?",
];

/* ─── Typing Indicator ─── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-text-secondary"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Conversation History Panel ─── */

function HistoryPanel({
  conversations,
  loading,
  onLoad,
  onDelete,
  onClose,
}: {
  conversations: Conversation[];
  loading: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 z-10 bg-surface flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">
          Conversation History
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton width="70%" height={14} shape="rounded" />
                <Skeleton width="40%" height={10} shape="rounded" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <History className="w-8 h-8 text-text-secondary mb-2" />
            <p className="text-sm text-text-secondary">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors"
                onClick={() => onLoad(conv.id)}
              >
                <Bot className="w-4 h-4 text-text-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {conv.title || "Untitled conversation"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {conv.messageCount} messages ·{" "}
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="p-1 rounded hover:bg-error/10 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main ChatWidget ─── */

export function ChatWidget() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] =
    useState<string[]>(DEFAULT_PROMPTS);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !showHistory) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, showHistory]);

  // Load conversation history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiClient.get<{ conversations: Conversation[] }>(
        "/ai/conversations"
      );
      setConversations(res.data.conversations);
    } catch {
      // silent fail — history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load a specific conversation
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await apiClient.get<ConversationDetail>(
        `/ai/conversations/${id}`
      );
      const loadedMessages = res.data.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(loadedMessages);
      setConversationId(id);
      setShowHistory(false);
    } catch {
      showToast("error", "Failed to load conversation");
    }
  }, [showToast]);

  // Delete a conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/ai/conversations/${id}`);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (conversationId === id) {
          setConversationId(null);
          setMessages([]);
        }
        showToast("success", "Conversation deleted");
      } catch {
        showToast("error", "Failed to delete conversation");
      }
    },
    [conversationId, showToast]
  );

  // Open history panel
  const handleOpenHistory = useCallback(() => {
    loadHistory();
    setShowHistory(true);
  }, [loadHistory]);

  // Send a message with SSE streaming
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Check login
      if (!user) {
        setLoginPrompt(true);
        showToast(
          "warning",
          "Please log in to use the AI assistant. You can still browse as a guest."
        );
        return;
      }

      const userMessage: Message = { role: "user", content: content.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsStreaming(true);
      setLoginPrompt(false);

      // Add placeholder for streaming response
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:5000/api/v1";

        const response = await fetch(`${baseUrl}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: content.trim(),
            conversationId: conversationId || undefined,
          }),
          signal: abortRef.current?.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (response.status === 429) {
            throw new Error("RATE_LIMITED");
          }
          throw new Error(
            errorData?.message || `HTTP ${response.status}`
          );
        }

        // Check content type — could be SSE or JSON
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream")) {
          // SSE streaming
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulated = "";
          let newConversationId: string | null = null;
          let newPrompts: string[] | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.text) {
                    accumulated += parsed.text;
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        role: "assistant",
                        content: accumulated,
                      };
                      return updated;
                    });
                  }

                  if (parsed.conversationId) {
                    newConversationId = parsed.conversationId;
                  }

                  if (parsed.suggestedPrompts) {
                    newPrompts = parsed.suggestedPrompts;
                  }
                } catch {
                  // skip malformed JSON lines
                }
              }
            }
          }

          if (newConversationId) setConversationId(newConversationId);
          if (newPrompts && newPrompts.length > 0) {
            setSuggestedPrompts(newPrompts);
          }
        } else {
          // JSON response (non-streaming fallback)
          const data = await response.json();
          const reply = data.data?.reply || data.reply || "";
          const convId = data.data?.conversationId || data.conversationId;
          const prompts = data.data?.suggestedPrompts || data.suggestedPrompts;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: reply,
            };
            return updated;
          });

          if (convId) setConversationId(convId);
          if (prompts && prompts.length > 0) {
            setSuggestedPrompts(prompts);
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "",
          };
          return updated;
        });

        if (error.message === "RATE_LIMITED") {
          showToast(
            "warning",
            "You've hit your daily AI limit. Please try again tomorrow."
          );
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content:
                "You've reached your daily usage limit. Please try again tomorrow or upgrade your plan.",
            };
            return updated;
          });
        } else if (error.name === "AbortError") {
          // User cancelled — remove empty assistant message
          setMessages((prev) => prev.slice(0, -1));
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "",
            };
            return updated;
          });
          showToast(
            "error",
            "Something went wrong. Please try again."
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [user, isStreaming, conversationId, showToast]
  );

  // Retry last message
  const retryLastMessage = useCallback(() => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      // Remove the failed assistant message
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle key down (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // New conversation
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setSuggestedPrompts(DEFAULT_PROMPTS);
    setLoginPrompt(false);
  };

  // Check if last message is an error (empty assistant with rate limit or error)
  const lastMsg = messages[messages.length - 1];
  const hasError =
    lastMsg?.role === "assistant" &&
    lastMsg.content === "" &&
    !isStreaming;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-elevated flex items-center justify-center cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Idle pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--gradient-primary)" }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9990] bg-black/40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`
                fixed z-[9991] bg-surface rounded-2xl shadow-elevated
                border border-border overflow-hidden
                flex flex-col
                md:bottom-6 md:right-6 md:w-[380px] md:h-[600px]
                inset-0 md:inset-auto
              `}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    BuildWise AI Assistant
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {user ? "Online" : "Guest mode — log in to chat"}
                  </p>
                </div>
                <button
                  onClick={handleOpenHistory}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                  title="Conversation history"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Panel Overlay */}
              <AnimatePresence>
                {showHistory && (
                  <HistoryPanel
                    conversations={conversations}
                    loading={historyLoading}
                    onLoad={loadConversation}
                    onDelete={deleteConversation}
                    onClose={() => setShowHistory(false)}
                  />
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && !loginPrompt && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-text-primary mb-1">
                      How can I help?
                    </h4>
                    <p className="text-sm text-text-secondary max-w-[240px]">
                      Ask me about PC components, compatibility, or build
                      recommendations.
                    </p>
                  </div>
                )}

                {loginPrompt && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <LogIn className="w-10 h-10 text-primary mb-3" />
                    <h4 className="text-base font-semibold text-text-primary mb-1">
                      Log in to chat
                    </h4>
                    <p className="text-sm text-text-secondary mb-4 max-w-[240px]">
                      Sign in to get personalized AI recommendations and save
                      your conversations.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Go to Login
                    </Button>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <Avatar
                          name="AI"
                          size="sm"
                          className="shrink-0 mt-0.5"
                        />
                        <div>
                          <div
                            className="rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-surface-2 border-l-2"
                            style={{
                              borderImage:
                                "linear-gradient(to bottom, #2563eb, #7c3aed) 1",
                            }}
                          >
                            {msg.content ? (
                              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            ) : isStreaming && i === messages.length - 1 ? (
                              <TypingIndicator />
                            ) : null}
                          </div>
                          {/* Retry button for error messages */}
                          {hasError && i === messages.length - 1 && (
                            <button
                              onClick={retryLastMessage}
                              className="flex items-center gap-1.5 mt-1.5 text-xs text-primary hover:text-primary-hover transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%]">
                        <div className="rounded-2xl rounded-tr-md px-3.5 py-2.5 bg-primary text-white">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming typing indicator */}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "assistant" &&
                  messages[messages.length - 1].content === "" && (
                    <div className="flex items-start gap-2">
                      <Avatar name="AI" size="sm" className="shrink-0" />
                      <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-surface-2 border-l-2 border-primary">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              {messages.length === 0 && !loginPrompt && (
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(prompt)}
                        className="shrink-0 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-text-secondary hover:text-primary hover:border-primary bg-surface-2 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested prompts after messages */}
              {messages.length > 0 &&
                !isStreaming &&
                suggestedPrompts.length > 0 &&
                messages[messages.length - 1].role === "assistant" &&
                messages[messages.length - 1].content !== "" && (
                  <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handlePromptClick(prompt)}
                          className="shrink-0 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-text-secondary hover:text-primary hover:border-primary bg-surface-2 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-border shrink-0">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      user
                        ? "Ask about PC components..."
                        : "Log in to start chatting..."
                    }
                    disabled={isStreaming || !user}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] max-h-[120px]"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height =
                        Math.min(target.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isStreaming || !user}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: inputValue.trim() && !isStreaming && user
                        ? "var(--gradient-primary)"
                        : undefined,
                    }}
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
                    ) : (
                      <Send
                        className={`w-4 h-4 ${
                          inputValue.trim() && !isStreaming && user
                            ? "text-white"
                            : "text-text-secondary"
                        }`}
                      />
                    )}
                  </button>
                </form>

                {/* New conversation button */}
                {messages.length > 0 && (
                  <button
                    onClick={handleNewConversation}
                    className="flex items-center gap-1.5 mt-2 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    New conversation
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
