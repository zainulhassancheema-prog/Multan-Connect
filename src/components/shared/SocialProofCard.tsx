import React from 'react';
import { motion } from 'framer-motion';

interface SocialProofCardProps {
  avatar?: string | null;
  name: string;
  action: string;
  icon: React.ReactNode;
  variant?: "like" | "purchase";
}

export function SocialProofCard({ avatar, name, action, icon, variant = "like" }: SocialProofCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-warm-md border border-white/80 cursor-default"
    >
      <div className="relative flex-shrink-0">
        <img
          src={avatar || "/Logo.jpeg"}
          alt={`Profile photo of ${name}`}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-xs text-ink leading-snug">
        <span className="font-semibold">{name}</span>
        {" "}
        <span className="text-ink/50">{action}</span>
      </p>
    </motion.div>
  );
}
