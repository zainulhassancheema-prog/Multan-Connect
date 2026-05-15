import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export function ScrollReveal3D({
  children,
  direction = "up",
  depth = false,
  className = ""
}: {
  children: React.ReactNode;
  direction?: "up" | "down";
  depth?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.7 1"]
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  const y = useTransform(springProgress, [0, 1], [direction === "up" ? 60 : -60, 0]);
  const opacity = useTransform(springProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(springProgress, [0, 1], [15, 0]);
  const scale = useTransform(springProgress, [0, 1], [0.92, 1]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y, opacity, scale,
        rotateX: depth ? rotateX : 0,
        transformStyle: depth ? "preserve-3d" : "flat",
      }}
    >
      {children}
    </motion.div>
  );
}
