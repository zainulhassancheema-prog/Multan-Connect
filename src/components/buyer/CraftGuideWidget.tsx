"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What is Blue Pottery?",
  "Find a wedding gift under PKR 5000",
  "How are Khussas made?",
  "What's good for home decor?",
];

export function CraftGuideWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Assalam u Alaikum! 👋 I'm your Craft Guide. Ask me anything about Multan's handmade crafts or let me help you find the perfect piece!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Don't show on seller dashboard
  if (location.pathname.startsWith("/seller")) return null;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show unread indicator after 5s if chat not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasUnread(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;

    setInput("");
    setHasUnread(false);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: messageText }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "buyer-assistant",
          payload: { messages: newMessages }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.result || "I didn't quite get that." }
      ]);
    } catch (err: any) {
      const message = err.message ?? "";
      let errorResponse = "Sorry, I'm having trouble connecting. Please try again in a moment.";

      if (message.includes("429") || message.includes("quota")) {
        errorResponse = "AI is busy right now. Please try again in a moment.";
      } else if (message.includes("API key") || message.includes("API_KEY_INVALID")) {
        errorResponse = "AI service configuration error. Please contact support.";
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: errorResponse
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl
                       border border-border overflow-hidden flex flex-col"
            style={{ maxHeight: "520px", height: "80vh" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy to-navy
                            px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20
                              flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} className="text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Craft Guide</p>
                <p className="text-white/50 text-xs">
                  AI-powered shopping assistant
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  aria-label="Minimize chat"
                  className="w-7 h-7 rounded-lg hover:bg-white/10
                             flex items-center justify-center transition-colors"
                >
                  <Minimize2 size={13} className="text-white/70" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="w-7 h-7 rounded-lg hover:bg-white/10
                             flex items-center justify-center transition-colors"
                >
                  <X size={13} className="text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3
                            scrollbar-thin scrollbar-thumb-gray-200">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gold/10
                                    flex items-center justify-center
                                    flex-shrink-0 mr-2 mt-0.5">
                      <Sparkles size={11} className="text-gold" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3 py-2.5 rounded-2xl text-sm
                                leading-relaxed
                                ${msg.role === "user"
                                  ? "bg-navy text-white rounded-tr-sm"
                                  : "bg-muted text-ink rounded-tl-sm"
                                }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Suggested questions — only on first message */}
              {messages.length === 1 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-xs text-muted-foreground pl-8">Try asking:</p>
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-left text-xs
                                 bg-muted/50 hover:bg-gold/10
                                 text-navy hover:text-gold
                                 border border-border hover:border-gold/30
                                 px-3 py-2 rounded-xl ml-8
                                 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold/10
                                  flex items-center justify-center flex-shrink-0">
                    <Sparkles size={11} className="text-gold" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm
                                  px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: i * 0.15
                        }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about crafts or products..."
                aria-label="Chat with Craft Guide"
                className="flex-1 text-sm bg-muted/30 border border-border
                           rounded-xl px-3 py-2.5 outline-none
                           focus:border-gold focus:ring-1 focus:ring-gold/20
                           placeholder:text-muted-foreground text-ink
                           transition-all duration-200"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="w-10 h-10 bg-gold hover:bg-gold/90
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white rounded-xl flex items-center
                           justify-center transition-colors flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(prev => !prev);
          setIsMinimized(false);
          setHasUnread(false);
          setTimeout(() => inputRef.current?.focus(), 300);
        }}
        aria-label={isOpen ? "Close Craft Guide chat" : "Open Craft Guide chat"}
        className="relative w-14 h-14 bg-gradient-to-br from-navy to-navy
                   text-white rounded-2xl shadow-lg shadow-navy/30
                   flex items-center justify-center
                   transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && (!isOpen || isMinimized) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gold
                         rounded-full border-2 border-white"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
