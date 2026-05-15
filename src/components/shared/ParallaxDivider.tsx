import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxDivider({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div ref={ref} className="relative overflow-hidden py-2 hidden md:block">
      <motion.div style={{ y }} className="relative">
        {children || (
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        )}
      </motion.div>
    </div>
  );
}
