import { ArrowRight, Star, ChevronDown, CheckCircle, MapPin, Heart, ShoppingBag, Check } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, User } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/shared/ProductCard';

import ArtisanCardSkeleton from '@/components/shared/ArtisanCardSkeleton';
import ProductCardSkeleton from '@/components/shared/ProductCardSkeleton';
import { HeroVase } from '@/components/3d/HeroVase';
import { SocialProofCard } from '@/components/shared/SocialProofCard';
import { AccordionRow } from '@/components/shared/AccordionRow';
import { useState, useEffect, useRef } from 'react';
import { ParallaxDivider } from '@/components/shared/ParallaxDivider';
import { ScrollReveal3D } from '@/components/shared/ScrollReveal3D';
import { BluePotteryShowcase } from '@/components/home/BluePotteryShowcase';

export default function Home() {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Generate some mock social proof activity to cycle through
    const mockActivity = [
      { id: 1, name: "Ayesha K.", action: "has liked this item", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
      { id: 2, name: "Zainab Ali", action: "just bought 2 items", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", isPurchase: true },
    ];
    setRecentActivity(mockActivity);
  }, []);

  const { data: trendingProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const q = query(
        collection(db, "products"),
        where("isAvailable", "==", true),
        orderBy("totalSold", "desc"),
        limit(8)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    }
  });

  const { data: newArrivals, isLoading: loadingNewArrivals } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: async () => {
      const q = query(
        collection(db, "products"),
        where("isAvailable", "==", true),
        orderBy("createdAt", "desc"),
        limit(8)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    }
  });

  const { data: featuredArtisans, isLoading: loadingArtisans } = useQuery({
    queryKey: ['featured-artisans'],
    queryFn: async () => {
      const q = query(
        collection(db, "users"),
        where("role", "in", ["seller", "both"]),
        limit(6)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
    }
  });

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      {/* Corner gradient blobs — reference image style */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(41,182,197,0.15) 0%, rgba(41,182,197,0.05) 40%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(201,151,58,0.12) 0%, rgba(201,151,58,0.04) 40%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div className="absolute top-1/2 -right-64 w-[400px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(26,35,126,0.04) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="relative z-10">
        {/* Full viewport hero matching reference image structure */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 md:px-16 lg:px-24 pt-20 pb-12">
          <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">

            {/* LEFT COLUMN — Editorial title */}
            <div className="lg:col-span-1 space-y-8 z-10">
              <motion.p
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3"
              >
                <span className="w-6 h-px bg-gold inline-block" />
                Multan's Finest
              </motion.p>

              <div className="space-y-1">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative inline-block">
                  <span className="font-playfair text-6xl md:text-7xl lg:text-8xl font-black text-ink leading-none tracking-tight">Blue</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 20" fill="none">
                    <ellipse cx="100" cy="10" rx="95" ry="7" stroke="#C9973A" strokeWidth="2.5" fill="none" />
                  </svg>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
                  <span className="font-playfair text-6xl md:text-7xl lg:text-8xl font-black text-ink leading-none tracking-tight">Pottery</span>
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center flex-shrink-0 shadow-navy">
                    <ArrowRight size={20} className="text-gold" />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                  <span className="font-playfair text-6xl md:text-7xl lg:text-8xl font-black text-ink leading-none tracking-tight">Multan</span>
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0 shadow-gold animate-pulse-ring">
                    <span className="text-xl">🏺</span>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <p className="text-3xl sm:text-4xl font-playfair font-bold text-ink">From PKR 1,500</p>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-ink/60 text-sm sm:text-base leading-relaxed max-w-sm">
                Handpainted with natural mineral pigments by master artisans in Multan since the Mughal era. Fresh, timeless, authentic.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap items-center gap-4">
                <Link to="/explore" className="flex items-center gap-2 bg-ink hover:bg-navy text-white font-medium px-8 py-4 rounded-full shadow-warm-md hover:shadow-navy-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                  <Check size={16} />
                  Explore Market
                </Link>
                <button className="w-12 h-12 rounded-full border-2 border-ink/10 hover:border-gold align-middle flex items-center justify-center text-ink/40 hover:text-gold transition-all duration-300 hover:shadow-gold bg-white/50 backdrop-blur-sm">
                  <Heart size={18} />
                </button>
              </motion.div>
            </div>

            {/* CENTER COLUMN */}
            <div className="lg:col-span-1 relative">
              <HeroVase />
            </div>

            {/* RIGHT COLUMN — Product detail accordion */}
            <div className="lg:col-span-1 space-y-0 z-10 mt-12 lg:mt-0 flex flex-col justify-center">
              {/* Card 1: Someone liked this */}
              <AnimatePresence>
                {recentActivity.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="absolute md:top-32 md:right-16 lg:relative lg:top-auto lg:right-auto md:mb-8 z-20 hidden md:block">
                    <SocialProofCard
                      avatar={recentActivity[0].avatar}
                      name={recentActivity[0].name}
                      action="has liked this item"
                      icon={<Heart size={10} className="fill-red-500 text-red-500" strokeWidth={3} />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Accordion details */}
              <div className="space-y-0 mt-8 lg:mt-0 relative z-10 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(26,35,126,0.03)] hidden lg:block">
                <h3 className="font-playfair text-xl font-bold text-navy mb-4 border-b border-ink/5 pb-4">Masterpiece Details</h3>
                {[
                  { label: "About this Craft", content: "Blue Pottery (Kashigari) uses natural quartz stone and mineral pigments. Notably, it contains no clay at all, making each piece entirely unique and delicate." },
                  { label: "Materials", content: "Powdered quartz, recycled glass, Multani clay (for molds), natural lapis lazuli pigments, and natural gum." },
                  { label: "Care Guide", content: "Wipe gently with a soft cloth. Not recommended for dishwasher use. Avoid harsh chemical cleaners." },
                ].map((item, i) => (
                  <AccordionRow key={i} {...item} defaultOpen={i === 0} />
                ))}
              </div>

              {/* Card 2: Someone purchased */}
              <AnimatePresence>
                {recentActivity.length > 1 && (
                  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="mt-8 lg:absolute lg:bottom-24 lg:left-8 xl:left-auto xl:right-12 z-20 hidden lg:block">
                    <SocialProofCard
                      avatar={recentActivity[1].avatar}
                      name={recentActivity[1].name}
                      action="just bought 2 items"
                      icon={<ShoppingBag size={10} className="text-green-600" strokeWidth={2.5} />}
                      variant="purchase"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
        
        <ParallaxDivider />
      </div>

      {/* Stats Bottom Bar */}
      <AnimatedSection className="bg-white border-t border-black/5 h-auto lg:h-[120px] flex items-center">
        <div className="container mx-auto px-4 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 py-8 lg:py-0">
          <div className="flex flex-col gap-1 md:border-r border-black/10 last:border-0 md:pr-10 justify-center">
            <span className="text-[11px] uppercase text-muted-foreground tracking-[0.1em] font-sans">Verified Artisans</span>
            <span className="font-serif text-[20px] font-bold text-ink leading-tight">142 Master Craftsmen</span>
          </div>
          <div className="flex flex-col gap-1 md:border-r border-black/10 last:border-0 md:px-10 justify-center">
            <span className="text-[11px] uppercase text-muted-foreground tracking-[0.1em] font-sans">Global Reach</span>
            <span className="font-serif text-[20px] font-bold text-ink leading-tight">22 Countries Served</span>
          </div>
          <div className="flex flex-col gap-1 border-black/10 last:border-0 md:pl-10 justify-center">
            <span className="text-[11px] uppercase text-muted-foreground tracking-[0.1em] font-sans">Artisan Spotlight</span>
            <span className="font-serif text-[20px] font-bold text-ink leading-tight">Ustad Muhammad Alam</span>
            <span className="font-accent italic text-[13px] text-gold">Third Generation Potter</span>
          </div>
        </div>
      </AnimatedSection>

      {/* Category Strip */}
      <AnimatedSection className="py-12 bg-cream border-t border-black/5">
        <div className="container mx-auto px-4 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex sm:grid sm:grid-cols-5 gap-6 min-w-max sm:min-w-0">
             {['Blue Pottery', 'Khussa', 'Embroidery', 'Gift Sets', 'New Arrivals'].map((cat, i) => (
                <Link to={`/explore?category=${cat}`} key={i} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-[88px] h-[88px] rounded-full bg-white flex items-center justify-center mb-4 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group-hover:border-gold transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(201,151,58,0.15)]">
                    <span className="text-3xl font-accent text-primary">{cat.charAt(0)}</span>
                  </div>
                  <span className="font-sans font-bold text-ink text-[13px] uppercase tracking-[0.1em] group-hover:text-gold transition-colors">{cat}</span>
                </Link>
             ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Artisans */}
      {(loadingArtisans || (featuredArtisans && featuredArtisans.length > 0)) && (
      <AnimatedSection className="py-24 container mx-auto px-4 relative" style={{ backgroundImage: "linear-gradient(135deg, #FFFFFF 0%, #F5F0E8 40%, #FFFFFF 100%)" }}>
        <div className="mb-12 text-center">
          <div className="flex items-center gap-3 justify-center mb-4">
            <span className="w-8 h-px bg-gradient-to-r from-gold to-transparent" />
            <span className="text-gold text-xs uppercase tracking-[0.2em] font-medium">Meet the Makers</span>
            <span className="w-8 h-px bg-gradient-to-l from-gold to-transparent" />
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl text-navy leading-tight">Masters of their craft</h2>
          <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-gold to-gold-light rounded-full mx-auto" />
        </div>
        
        {loadingArtisans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_,i) => <ArtisanCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredArtisans?.map((artisan, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={artisan.uid} 
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-warm-md hover:shadow-warm-xl transition-all duration-500 hover:-translate-y-2 bg-white"
              >
                <div className="relative h-32 overflow-hidden">
                  {artisan.shopBannerUrl ? (
                    <img src={artisan.shopBannerUrl} alt={`Shop banner for ${artisan.shopName}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy to-navy-light" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="relative px-5 pb-5">
                  <div className="-mt-8 mb-3 z-10 relative">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-warm-md overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold transition-all duration-300 bg-white">
                      {artisan.shopLogoUrl || artisan.photoURL ? (
                        <img src={artisan.shopLogoUrl || artisan.photoURL} alt={`Shop logo for ${artisan.shopName || artisan.displayName}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-navy flex flex-col justify-center text-center"><span className="text-xl font-heading font-bold text-white">{artisan.shopName?.charAt(0) || artisan.displayName?.charAt(0) || 'M'}</span></div>
                      )}
                    </div>
                  </div>
                  {artisan.isVerifiedArtisan && (
                    <div className="absolute top-[-26px] right-4 z-20">
                      <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-teal text-[10px] font-medium px-2 py-0.5 rounded-full shadow-warm-sm">
                        <CheckCircle size={10} /> Verified
                      </span>
                    </div>
                  )}
                  <h3 className="font-playfair text-lg text-navy font-semibold group-hover:text-gold transition-colors duration-300">{artisan.shopName || artisan.displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{artisan.craftSpecialty || artisan.craftType?.replace('_', ' ') || 'Master Artisan'}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-gold text-gold" />
                      <span className="text-xs font-medium text-navy">{artisan.rating?.toFixed(1) ?? "5.0"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={10} />
                      {artisan.shopLocation || artisan.workshopLocation || 'Multan'}
                    </span>
                  </div>
                  
                  <div className="h-0 overflow-hidden group-hover:h-10 mt-0 group-hover:mt-3 transition-all duration-400 ease-out">
                    <Link to={`/artisan/${artisan.shopHandle || artisan.uid}`} className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-gold text-white text-xs font-medium py-2.5 rounded-xl transition-colors duration-200">
                      View Shop <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatedSection>
      )}

      {/* Blue Pottery Showcase */}
      <ScrollReveal3D depth={true}>
        <BluePotteryShowcase />
      </ScrollReveal3D>

      {/* Trending Products */}
      {(loadingProducts || (trendingProducts && trendingProducts.length > 0)) && (
      <AnimatedSection className="py-24 relative bg-cream" style={{ backgroundImage: "radial-gradient(circle, rgba(26,35,126,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-gold to-transparent" />
              <span className="text-gold text-xs uppercase tracking-[0.2em] font-medium">Crafted With Intention</span>
            </div>
            <div className="flex justify-between items-end">
                <h2 className="font-playfair text-4xl md:text-5xl text-navy leading-tight">Trending globally.</h2>
                <Link to="/explore" className="btn-outline hidden sm:flex">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-gold to-gold-light rounded-full" />
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_,i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {trendingProducts?.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </AnimatedSection>
      )}

      {/* New Arrivals */}
      {(loadingNewArrivals || (newArrivals && newArrivals.length > 0)) && (
      <AnimatedSection className="py-24 relative bg-white" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(201,151,58,0.03) 0px, rgba(201,151,58,0.03) 1px, transparent 1px, transparent 12px)" }}>
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-gold to-transparent" />
              <span className="text-gold text-xs uppercase tracking-[0.2em] font-medium">Freshly Crafted</span>
            </div>
            <div className="flex justify-between items-end">
                <h2 className="font-playfair text-4xl md:text-5xl text-navy leading-tight">New arrivals from the workshops.</h2>
                <Link to="/explore" className="btn-outline hidden sm:flex">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-gold to-gold-light rounded-full" />
          </div>

          {loadingNewArrivals ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_,i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {newArrivals?.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </AnimatedSection>
      )}

      {/* Story Banner */}
      <AnimatedSection className="bg-navy py-24 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,151,58,0.08) 0%, transparent 70%)" }}>
        <div className="absolute inset-0 border-t border-b border-gold/20" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-3xl">
          {featuredArtisans && featuredArtisans.length > 0 ? (
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 flex items-center justify-center bg-white border border-gold/30 shadow-glow-gold">
                  <img src="/Logo.jpeg" className="w-full h-full object-cover scale-[1.75]" alt="Multan Connect artisan" />
                </div>
                <p className="font-playfair italic text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-6 text-white text-shadow-sm">
                  "{featuredArtisans[0].shopBio || 'Each piece carries 400 years of Multani heritage.'}"
                </p>
             </div>
          ) : (
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 flex items-center justify-center bg-white border border-gold/30 shadow-glow-gold">
                  <img src="/Logo.jpeg" className="w-full h-full object-cover scale-[1.75]" alt="Multan Connect artisan" />
                </div>
                <p className="font-playfair italic text-2xl md:text-4xl leading-relaxed mb-6 text-white text-shadow-sm">
                  "Each piece carries 400 years of Multani heritage."
                </p>
             </div>
          )}
          <Link to="/stories" className="btn-primary mt-4">
            Read Their Stories <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
