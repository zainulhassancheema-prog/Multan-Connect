import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIDescriptionGeneratorProps {
  title: string;
  category: string;
  materials: string;
  price: number;
  location: string;
  onApply: (description: string) => void;
}

export function AIDescriptionGenerator({
  title, category, materials, price, location, onApply
}: AIDescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!title || !category) {
      setError("Please fill in the product title and category first.");
      return;
    }

    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "product-description",
          payload: { title, category, materials, price, location }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerated(data.result);
    } catch (err: any) {
      const message = err.message ?? "";
      if (message.includes("429") || message.includes("quota")) {
        setError("AI is busy right now. Please try again in a moment.");
      } else if (message.includes("API key") || message.includes("API_KEY_INVALID")) {
        setError("AI service configuration error. Please contact support.");
      } else {
        setError("Failed to generate description. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generated) return;
    onApply(generated);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Generate Button */}
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-medium
                   bg-gradient-to-r from-navy to-navy
                   hover:opacity-90
                   disabled:opacity-60 disabled:cursor-not-allowed
                   text-white px-4 py-2 rounded-xl
                   transition-all duration-300 shadow-sm"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Sparkles size={13} />
        )}
        {loading ? "Generating..." : "Generate with AI"}
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Generated Result */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-muted border border-border rounded-2xl p-4 space-y-3"
          >
            {/* AI badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-background border
                              border-border rounded-full px-2.5 py-1">
                <Sparkles size={11} className="text-gold" />
                <span className="text-xs text-navy font-medium">
                  AI Generated
                </span>
              </div>
              <button
                type="button"
                onClick={generate}
                className="text-xs text-muted-foreground hover:text-navy
                           flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={11} />
                Regenerate
              </button>
            </div>

            {/* Generated text — typewriter effect */}
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
              {generated}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleApply}
                className={`flex items-center gap-1.5 text-xs font-medium
                            px-4 py-2 rounded-xl transition-all duration-200
                            ${applied
                              ? "bg-green-600 text-white"
                              : "bg-gold hover:bg-gold/90 text-white"
                            }`}
              >
                {applied ? (
                  <><Check size={12} /> Applied!</>
                ) : (
                  "Use This Description"
                )}
              </button>
              <button
                type="button"
                onClick={() => setGenerated(null)}
                className="text-xs text-muted-foreground hover:text-navy px-3 py-2
                           rounded-xl hover:bg-black/5 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
