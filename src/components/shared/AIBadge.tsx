import { Sparkles } from "lucide-react";

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r
                     from-navy/10 to-teal/10 border border-navy/10
                     text-navy text-xs font-medium px-2 py-0.5 rounded-full">
      <Sparkles size={9} className="text-gold" />
      AI
    </span>
  );
}
