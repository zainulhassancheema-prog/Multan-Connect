import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AccordionRowProps {
  label: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionRow({ label, content, defaultOpen = false }: AccordionRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className={`text-sm font-medium transition-colors duration-200 ${open ? "text-navy" : "text-ink/70 group-hover:text-navy"}`}>
          {open ? <strong>{label}</strong> : label}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${open ? "border-navy bg-navy text-white" : "border-ink/20 text-ink/40 group-hover:border-gold"}`}
        >
          <Plus size={11} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="text-sm text-ink/60 leading-relaxed pb-4">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
