"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export function HeroVase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scroll-driven transforms
  const scrollY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const imageY        = useTransform(scrollY, [0, 1], [0, -120]);
  const imageScale    = useTransform(scrollY, [0, 0.5, 1], [1, 1.05, 0.85]);
  const imageRotateZ  = useTransform(scrollY, [0, 1], [0, -8]);
  const imageOpacity  = useTransform(scrollY, [0, 0.7, 1], [1, 0.8, 0]);

  // Mouse parallax effect
  useEffect(() => {
    // Disable parallax on mobile
    if (window.matchMedia("(hover: none)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const mouseRotateY  = mousePos.x * 12;  // tilt left/right with mouse
  const mouseRotateX  = -mousePos.y * 8;  // tilt up/down with mouse
  const mouseShadowX  = mousePos.x * 20;
  const mouseShadowY  = mousePos.y * 15;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center
                 w-full h-full min-h-[500px]"
    >

      {/* ── Arch / Pedestal background shape ── */}
      <motion.div
        style={{ y: useTransform(scrollY, [0, 1], [0, -40]) }}
        className="absolute inset-x-8 bottom-0 top-16 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(180deg, rgba(41,182,197,0.07) 0%, rgba(26,35,126,0.05) 50%, rgba(201,151,58,0.04) 100%)",
            borderRadius: "50% 50% 48% 48% / 20% 20% 80% 80%",
          }}
        />
      </motion.div>

      {/* ── Large dashed circle behind ── */}
      <motion.div
        style={{
          y: useTransform(scrollY, [0, 1], [0, -20]),
          rotate: useTransform(scrollY, [0, 1], [0, 45])
        }}
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 288 288" className="w-full h-full opacity-10">
          <circle cx="144" cy="144" r="140"
            fill="none"
            stroke="#1A237E"
            strokeWidth="1"
            strokeDasharray="8 6"
          />
        </svg>
      </motion.div>

      {/* ── Orbit ring 1 (gold) ── */}
      <motion.div
        style={{
          y: useTransform(scrollY, [0, 1], [0, -15]),
        }}
        className="absolute w-80 h-80 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="w-full h-full relative"
        >
          <svg viewBox="0 0 320 320" className="w-full h-full">
            <ellipse cx="160" cy="160" rx="155" ry="60"
              fill="none"
              stroke="#C9973A"
              strokeWidth="1"
              strokeOpacity="0.25"
              style={{ transform: "rotateX(75deg)", transformOrigin: "160px 160px" }}
            />
          </svg>
          {/* Dot travelling on orbit */}
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2
                          w-2.5 h-2.5 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fff, #C9973A)",
              boxShadow: "0 0 8px rgba(201,151,58,0.5), inset -1px -1px 3px rgba(0,0,0,0.2)"
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── Orbit ring 2 (teal) ── */}
      <motion.div
        className="absolute w-52 h-52 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="w-full h-full relative"
        >
          <svg viewBox="0 0 208 208" className="w-full h-full">
            <ellipse cx="104" cy="104" rx="100" ry="40"
              fill="none"
              stroke="#29B6C5"
              strokeWidth="1"
              strokeOpacity="0.20"
              style={{ transform: "rotateX(75deg)", transformOrigin: "104px 104px" }}
            />
          </svg>
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2
                          w-2 h-2 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fff, #29B6C5)",
              boxShadow: "0 0 6px rgba(41,182,197,0.5)"
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── Floating 3D orbs ── */}
      {[
        { size: 22, top: "18%", right: "10%",  color: "#C9973A", delay: 0,   duration: 7  },
        { size: 14, bottom: "28%", left: "8%", color: "#29B6C5", delay: 1.5, duration: 9  },
        { size: 18, top: "55%", left: "12%",   color: "#1A237E", delay: 3,   duration: 6  },
        { size: 10, top: "30%", left: "20%",   color: "#C9973A", delay: 2,   duration: 8  },
        { size: 12, bottom: "15%", right: "15%", color: "#29B6C5", delay: 4, duration: 10 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -(orb.size * 0.8), 0],
            x: [0, orb.size * 0.3, 0],
          }}
          transition={{
            y: { duration: orb.duration, repeat: Infinity, ease: "easeInOut", delay: orb.delay },
            x: { duration: orb.duration * 1.3, repeat: Infinity, ease: "easeInOut", delay: orb.delay },
          }}
          className="absolute rounded-full pointer-events-none"
          aria-hidden="true"
          style={{
            width: orb.size, height: orb.size,
            top: orb.top, right: orb.right,
            bottom: orb.bottom, left: orb.left,
            background: `radial-gradient(circle at 32% 32%, white, ${orb.color}cc)`,
            boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.12),
                        2px 4px ${orb.size}px ${orb.color}44`,
          }}
        />
      ))}

      {/* ── THE ACTUAL VASE IMAGE — 3D animated ── */}
      <motion.div
        style={{
          y: imageY,
          scale: imageScale,
          rotateZ: imageRotateZ,
          opacity: imageOpacity,
        }}
        className="relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{
            // Continuous gentle float
            y: [0, -14, 0],
          }}
          transition={{
            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            // Mouse-driven 3D tilt
            rotateY: mouseRotateY,
            rotateX: mouseRotateX,
            transformStyle: "preserve-3d",
            // Smooth mouse follow
            transition: "rotateY 0.15s ease-out, rotateX 0.15s ease-out",
          }}
        >
          <img
            src="/images/hero-vase.png"
            alt="Handpainted Blue Pottery vase — traditional Kashigari craft from Multan"
            className="w-56 md:w-64 lg:w-72 h-auto object-contain
                       select-none pointer-events-none"
            draggable={false}
            style={{
              // Dynamic drop shadow follows mouse position
              filter: `
                drop-shadow(${mouseShadowX * -0.3}px ${20 + mouseShadowY}px 40px rgba(26,35,126,0.25))
                drop-shadow(${mouseShadowX * -0.1}px ${8 + mouseShadowY * 0.5}px 16px rgba(201,151,58,0.15))
              `,
              // Subtle blue glow on the vase itself
              WebkitFilter: `
                drop-shadow(${mouseShadowX * -0.3}px ${20 + mouseShadowY}px 40px rgba(26,35,126,0.25))
                drop-shadow(0px 0px 30px rgba(41,182,197,0.1))
              `,
            }}
          />
        </motion.div>

        {/* Hover glow ring below vase */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2
                     w-32 h-6 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(26,35,126,0.15) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ── Scroll down indicator ── */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: useTransform(scrollY, [0, 0.2], [1, 0]) }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-1.5 cursor-pointer"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
      >
        <div className="w-9 h-9 rounded-full border border-ink/15
                        hover:border-gold flex items-center justify-center
                        bg-white/60 backdrop-blur-sm
                        transition-colors duration-300 hover:shadow-gold">
          <ChevronDown size={15} className="text-ink/40" />
        </div>
      </motion.div>

    </div>
  );
}
