import {
  useRef, useState, useEffect
} from "react";
import {
  motion, useScroll, useTransform,
  useSpring, AnimatePresence
} from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";

// The three real Blue Pottery images
const POTTERY_PIECES = [
  {
    src: "/images/Blue_pottery_2.jpeg",
    alt: "Tall elegant Blue Pottery vase with floral patterns — handcrafted in Multan",
    name: "Floral Tall Vase",
    description: "Hand-painted florals with teal and cobalt glazing. A statement piece for any home.",
    price: "PKR 4,500",
    craft: "Kashigari · Multan",
    accent: "#29B6C5",  // teal accent for this piece
    rotate: "-6deg",
    zIndex: 1,
  },
  {
    src: "/images/Blue_pottery_3.jpg",
    alt: "Round Blue Pottery vase with white floral motifs on navy — traditional Multan craft",
    name: "Classic Navy Vase",
    description: "Traditional navy blue with hand-carved white motifs. Centuries of craft in your hands.",
    price: "PKR 3,200",
    craft: "Kashigari · Multan",
    accent: "#1A237E",  // navy accent for this piece
    rotate: "0deg",
    zIndex: 3,          // center piece — on top
  },
  {
    src: "/images/hero-vase.png",
    alt: "Large Blue Pottery vase with detailed leaf and flower pattern — artisan made in Multan",
    name: "Heritage Bloom Vase",
    description: "Dense botanical patterns flowing across a generous form. Pure Mughal inspiration.",
    price: "PKR 5,800",
    craft: "Kashigari · Multan",
    accent: "#C9973A",  // gold accent for this piece
    rotate: "6deg",
    zIndex: 1,
  },
];

export function BluePotteryShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1); // center piece active by default
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll progress for the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const spring = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  // Section-level parallax
  const sectionY = useTransform(spring, [0, 1], [60, -60]);
  const sectionOpacity = useTransform(spring, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  // Mouse tracking for 3D tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-rotate active piece every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % POTTERY_PIECES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activePiece = POTTERY_PIECES[activeIndex];

  return (
    <motion.section
      ref={sectionRef}
      style={{ y: sectionY, opacity: sectionOpacity }}
      className="relative pb-12 overflow-hidden"
    >

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-white">
        {/* Subtle dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(26,35,126,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Animated color blob — shifts with active piece */}
        <motion.div
          animate={{
            background: `radial-gradient(ellipse 600px 400px at 60% 50%, ${activePiece.accent}18 0%, transparent 70%)`,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
          aria-hidden="true"
        />
        {/* Top left gold blob */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(201,151,58,0.10), transparent 70%)",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />
        {/* Bottom right teal blob */}
        <div className="absolute -bottom-20 -right-20 w-96 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(41,182,197,0.10), transparent 70%)",
            filter: "blur(50px)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end
                        justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="w-8 h-px bg-gradient-to-r from-gold to-transparent" />
              <span className="text-gold text-xs uppercase tracking-[0.25em] font-medium">
                The Collection
              </span>
              <span className="w-8 h-px bg-gradient-to-l from-gold to-transparent" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-playfair text-5xl md:text-6xl text-ink font-black
                         leading-[1.05]"
            >
              Blue Pottery
              <span className="block">
                <span className="relative inline-block">
                  <span
                    style={{
                      background: "linear-gradient(135deg, #1A237E, #29B6C5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Kashigari
                  </span>
                  {/* Oval underline */}
                  <svg className="absolute -bottom-1 left-0 w-full h-3"
                    viewBox="0 0 200 12" fill="none" aria-hidden="true">
                    <ellipse cx="100" cy="6" rx="98" ry="5"
                      stroke="#C9973A" strokeWidth="1.5" fill="none" />
                  </svg>
                </span>
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/explore?category=blue_pottery"
              className="inline-flex items-center gap-2 border border-ink/15
                         hover:border-gold text-ink/60 hover:text-gold
                         text-sm font-medium px-5 py-2.5 rounded-full
                         transition-all duration-300 hover:shadow-gold group"
            >
              View All
              <ArrowUpRight size={14}
                className="group-hover:rotate-12 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* ── Main Showcase Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20
                        items-center">

          {/* LEFT: Three floating vases */}
          <div className="relative flex items-end justify-center
                          min-h-[480px] md:min-h-[540px]">

            {/* Ground shadow ellipse */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2
                            w-64 h-10 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(26,35,126,0.12), transparent 70%)",
                filter: "blur(12px)",
              }}
              aria-hidden="true"
            />

            {POTTERY_PIECES.map((piece, i) => {
              const isActive = i === activeIndex;
              const isLeft   = i === 0;
              const isRight  = i === 2;

              // Position offsets for the three pieces
              const xOffset = isLeft ? "-38%" : isRight ? "38%" : "0%";
              const yOffset = isActive ? "0%" : "8%";
              const scaleVal = isActive ? 1 : 0.72;
              const zVal = isActive ? 30 : 0;
              const blurVal = isActive ? 0 : 1.5;

              // Mouse tilt — only on active piece
              const rotateY = isActive ? mousePos.x * 10 : 0;
              const rotateX = isActive ? -mousePos.y * 6 : 0;

              return (
                <motion.div
                  key={piece.src}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale: scaleVal,
                    zIndex: zVal,
                    filter: `blur(${blurVal}px)`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                  }}
                  onClick={() => setActiveIndex(i)}
                  className="absolute bottom-8 cursor-pointer"
                  style={{ transformOrigin: "bottom center" }}
                >
                  {/* Continuous float animation on active piece */}
                  <motion.div
                    animate={isActive ? {
                      y: [0, -14, 0],
                    } : { y: 0 }}
                    transition={{
                      y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      rotateY,
                      rotateX,
                      transformStyle: "preserve-3d",
                      transition: "rotateY 0.2s ease-out, rotateX 0.2s ease-out",
                    }}
                  >
                    <img
                      src={piece.src}
                      alt={piece.alt}
                      className="object-contain select-none"
                      draggable={false}
                      style={{
                        width: isActive ? "220px" : "160px",
                        height: "auto",
                        maxHeight: isActive ? "420px" : "320px",
                        filter: isActive
                          ? `drop-shadow(0 30px 50px rgba(26,35,126,0.22))
                             drop-shadow(0 8px 20px ${piece.accent}33)`
                          : `drop-shadow(0 10px 20px rgba(26,35,126,0.12))
                             brightness(0.85)`,
                        transition: "width 0.5s ease, filter 0.5s ease",
                      }}
                    />
                  </motion.div>

                  {/* Active indicator dot below each piece */}
                  <motion.div
                    animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.6 }}
                    className="mx-auto mt-3 w-1.5 h-1.5 rounded-full"
                    style={{ background: piece.accent }}
                    aria-hidden="true"
                  />
                </motion.div>
              );
            })}

            {/* Navigation arrows */}
            <button
              onClick={() => setActiveIndex(prev =>
                prev === 0 ? POTTERY_PIECES.length - 1 : prev - 1
              )}
              aria-label="Previous pottery piece"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-40
                         w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm
                         border border-ink/10 hover:border-gold
                         flex items-center justify-center
                         text-ink/50 hover:text-gold
                         shadow-depth-1 hover:shadow-gold
                         transition-all duration-200"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={() => setActiveIndex(prev =>
                (prev + 1) % POTTERY_PIECES.length
              )}
              aria-label="Next pottery piece"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-40
                         w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm
                         border border-ink/10 hover:border-gold
                         flex items-center justify-center
                         text-ink/50 hover:text-gold
                         shadow-depth-1 hover:shadow-gold
                         transition-all duration-200"
            >
              <ArrowRight size={15} />
            </button>

          </div>

          {/* RIGHT: Active piece info panel */}
          <div className="relative">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, rotateX: 10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
                className="space-y-8"
              >

                {/* Piece number */}
                <div className="flex items-center gap-3">
                  <span className="font-playfair text-7xl font-black
                                   leading-none select-none"
                    style={{ color: `${activePiece.accent}18` }}
                    aria-hidden="true"
                  >
                    0{activeIndex + 1}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      {activePiece.craft}
                    </p>
                    <motion.div
                      className="h-0.5 mt-1 rounded-full"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ background: activePiece.accent, maxWidth: "60px" }}
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-playfair text-4xl md:text-5xl
                                 font-black text-ink leading-tight">
                    {activePiece.name}
                  </h3>
                  <p className="text-ink/40 text-base leading-relaxed mt-4 max-w-sm">
                    {activePiece.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="font-playfair text-3xl font-bold text-ink">
                    {activePiece.price}
                  </span>
                  <span className="text-xs text-muted bg-ink/5 px-3 py-1.5
                                   rounded-full border border-ink/8">
                    Handmade
                  </span>
                </div>

                {/* Process steps */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Quartz Body",
                    "Hand Thrown",
                    "Natural Pigments",
                    "Kiln Fired",
                  ].map((step, i) => (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 + 0.2 }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full
                                 border transition-all duration-200"
                      style={{
                        borderColor: `${activePiece.accent}40`,
                        color: activePiece.accent,
                        background: `${activePiece.accent}08`,
                      }}
                    >
                      {step}
                    </motion.span>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/explore?category=blue_pottery"
                    className="inline-flex items-center gap-2 font-medium
                               px-7 py-3.5 rounded-full text-white
                               shadow-depth-2 transition-all duration-300
                               hover:-translate-y-0.5 hover:shadow-lg
                               active:translate-y-0"
                    style={{
                      background: `linear-gradient(135deg, ${activePiece.accent}, ${activePiece.accent}cc)`,
                      boxShadow: `0 8px 24px ${activePiece.accent}35`,
                    }}
                  >
                    Shop Now
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    to="/stories"
                    className="text-sm text-ink/50 hover:text-ink
                               underline underline-offset-4
                               transition-colors duration-200"
                  >
                    The Artisan's Story
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="flex gap-2 mt-10">
              {POTTERY_PIECES.map((piece, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View ${piece.name}`}
                  className="relative h-1 rounded-full overflow-hidden
                             transition-all duration-500 cursor-pointer"
                  style={{ width: activeIndex === i ? "40px" : "16px" }}
                >
                  <div className="absolute inset-0 bg-ink/10 rounded-full" />
                  {activeIndex === i && (
                    <motion.div
                      layoutId="progress-fill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: piece.accent }}
                    />
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Bottom floating cards row ── */}
        <div className="mt-20 grid grid-cols-3 gap-4 md:gap-6">
          {POTTERY_PIECES.map((piece, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveIndex(i)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group rounded-2xl overflow-hidden
                         cursor-pointer text-left"
              style={{
                boxShadow: activeIndex === i
                  ? `0 8px 32px ${piece.accent}30, 0 2px 8px rgba(0,0,0,0.06)`
                  : "0 2px 8px rgba(26,35,126,0.06)",
                border: activeIndex === i
                  ? `1.5px solid ${piece.accent}50`
                  : "1.5px solid rgba(26,35,126,0.06)",
                transition: "box-shadow 0.4s ease, border 0.4s ease",
              }}
            >
              {/* Card image */}
              <div className="aspect-[3/4] overflow-hidden bg-cream">
                <img
                  src={piece.src}
                  alt={piece.alt}
                  className="w-full h-full object-cover
                             group-hover:scale-110 transition-transform
                             duration-700 ease-out"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t
                                from-ink/70 via-ink/10 to-transparent
                                opacity-0 group-hover:opacity-100
                                transition-opacity duration-500" />
              </div>

              {/* Card label */}
              <div className="absolute bottom-0 left-0 right-0 p-3
                              translate-y-full group-hover:translate-y-0
                              transition-transform duration-400 ease-out">
                <p className="text-white text-xs font-semibold truncate">
                  {piece.name}
                </p>
                <p className="text-white/70 text-xs">{piece.price}</p>
              </div>

              {/* Active indicator */}
              {activeIndex === i && (
                <motion.div
                  layoutId="card-active"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: piece.accent }}
                />
              )}
            </motion.button>
          ))}
        </div>

      </div>
    </motion.section>
  );
}
