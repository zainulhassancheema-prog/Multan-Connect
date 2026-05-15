import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };

    const checkPointer = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        setIsPointer(window.getComputedStyle(el).cursor === "pointer");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousemove", checkPointer, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousemove", checkPointer);
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className={`fixed top-0 left-0 z-[99999] pointer-events-none rounded-full transition-transform duration-75 hidden sm:block ${
        isPointer
          ? "w-8 h-8 bg-gold/20 border-2 border-gold -translate-x-4 -translate-y-4"
          : "w-3 h-3 bg-gold"
      }`}
      style={{ willChange: "transform" }}
    />
  );
}
