import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, User } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
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
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row h-auto min-h-0 lg:h-[max(calc(100vh-72px),600px)] overflow-hidden">
        {/* Left pane */}
        <div className="flex-[0_0_55%] bg-primary text-white p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-gold) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-10 max-w-[480px]">
            <span className="text-gold uppercase tracking-[0.2em] text-[12px] font-bold mb-6 block">Legacy of the Indus Valley</span>
            <h1 className="font-serif font-normal text-5xl lg:text-[72px] leading-[1] mb-8">
              Where Ancient<br/>Craft Meets<br/>the World.
            </h1>
            <p className="font-sans text-white/70 text-[18px] mb-12 max-w-[480px] leading-[1.6]">
              Direct access to Multan’s master artisans. Explore authentic Blue Pottery and hand-stitched Khussa shoes, crafted with 400 years of heritage.
            </p>
            <Button onClick={() => window.location.href = '/explore'} className="bg-gold hover:bg-gold-light text-white font-bold uppercase tracking-[0.1em] text-[13px] px-10 py-7 w-fit h-auto rounded-full">
                Explore the Market
            </Button>
            <div className="absolute w-[100px] h-[1px] bg-gold bottom-10 left-20 hidden lg:block"></div>
          </motion.div>
        </div>
        
        {/* Right pane - Image Mosaic */}
        <div className="flex-[0_0_45%] bg-cream p-10 relative">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 grid-rows-3 md:grid-rows-2 gap-[24px] h-[800px] md:h-[600px] lg:h-full">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="col-start-1 col-end-2 md:col-end-2 row-start-1 row-end-2 md:row-end-3 relative shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-black/5 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600')"}}>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                 <div className="mb-2 sm:mb-0">
                   <p className="text-[12px] font-bold text-ink mb-1">KASHIGARI VASE</p>
                   <p className="font-accent italic text-[14px] text-muted-foreground">by Master Abdul Malik</p>
                 </div>
                 <span className="font-bold text-gold self-start sm:self-center">PKR 14,500</span>
               </div>
             </motion.div>

             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="col-start-1 md:col-start-2 lg:col-start-2 col-end-2 md:col-end-3 row-start-2 md:row-start-1 row-end-3 md:row-end-2 border border-black/5 relative shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590736962236-419b66236316?auto=format&fit=crop&q=80&w=600')"}}>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 flex justify-between items-center">
                 <div>
                   <p className="text-[12px] font-bold text-ink">VELVET KHUSSA</p>
                 </div>
                 <span className="font-bold text-gold">PKR 4,200</span>
               </div>
             </motion.div>

             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="col-start-1 md:col-start-2 lg:col-start-2 col-end-2 md:col-end-3 row-start-3 md:row-start-2 row-end-4 md:row-end-3 border border-black/5 relative shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591848478625-744399e9c16d?auto=format&fit=crop&q=80&w=600')"}}>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 flex justify-between items-center">
                 <div>
                   <p className="text-[12px] font-bold text-ink">INDIGO PLATTER</p>
                 </div>
                 <span className="font-bold text-gold">PKR 8,900</span>
               </div>
             </motion.div>
           </div>
        </div>
      </section>

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
      <AnimatedSection className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl lg:text-5xl text-ink mb-4 font-bold">Meet the Makers</h2>
          <p className="font-serif italic text-muted-foreground text-lg">Masters of their craft, preserving heritage.</p>
        </div>
        
        {loadingArtisans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
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
                className="bg-white rounded-[2rem] p-6 text-center shadow-sm border border-border/50 hover:shadow-xl hover:border-gold/30 transition-all duration-300 group"
              >
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-cream group-hover:border-gold/20 transition-colors flex items-center justify-center bg-navy" style={!artisan.shopLogoUrl && !artisan.photoURL ? { backgroundColor: '#1A237E' } : {}}>
                  {artisan.shopLogoUrl ? (
                    <img src={artisan.shopLogoUrl} alt={artisan.shopName} className="w-full h-full object-cover bg-white" />
                  ) : artisan.photoURL ? (
                     <img src={artisan.photoURL} alt={artisan.shopName || artisan.displayName} className="w-full h-full object-cover bg-white" />
                  ) : (
                    <span className="text-3xl font-heading font-bold text-white">{artisan.shopName?.charAt(0) || artisan.displayName?.charAt(0) || 'M'}</span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-xl text-ink mb-1">{artisan.shopName || artisan.displayName}</h3>
                <p className="font-serif italic text-gold text-sm mb-4">{artisan.craftSpecialty || artisan.craftType?.replace('_', ' ') || 'Master Artisan'}</p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-6">
                  <span className="truncate max-w-full">{artisan.shopLocation || artisan.workshopLocation || 'Multan'}</span>
                </div>
                <Button onClick={() => window.location.href = `/artisan/${artisan.shopHandle || artisan.uid}`} variant="outline" className="rounded-full w-full border-ink text-ink hover:bg-ink hover:text-white transition-colors">
                  View Shop
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatedSection>
      )}

      {/* Trending Products */}
      {(loadingProducts || (trendingProducts && trendingProducts.length > 0)) && (
      <AnimatedSection className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-4xl lg:text-5xl text-ink font-bold mb-3">Crafted With Intention</h2>
              <p className="font-serif italic text-muted-foreground text-lg">Trending globally.</p>
            </div>
            <Link to="/explore" className="hidden sm:flex text-gold font-semibold items-center gap-2 hover:gap-3 transition-all">
              <span className="hover-underline">View All</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-[400px] rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {trendingProducts?.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group relative block rounded-2xl overflow-hidden bg-cream">
                  <div className="aspect-[4/5] overflow-hidden bg-navy/5 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-sans font-medium text-ink truncate pr-2">{product.title}</h3>
                      <div className="flex items-center text-gold shrink-0">
                        <span className="text-xs font-bold mr-1">{product.rating || 5.0}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="font-serif italic text-muted-foreground text-sm mb-3 truncate">By {product.shopName || product.sellerName || 'Artisan'} &bull; {product.category}</p>
                    <p className="font-heading font-semibold text-lg text-gold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
      )}

      {/* New Arrivals */}
      {(loadingNewArrivals || (newArrivals && newArrivals.length > 0)) && (
      <AnimatedSection className="py-24 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-4xl lg:text-5xl text-ink font-bold mb-3">Freshly Crafted</h2>
              <p className="font-serif italic text-muted-foreground text-lg">New arrivals from the workshops.</p>
            </div>
            <Link to="/explore" className="hidden sm:flex text-gold font-semibold items-center gap-2 hover:gap-3 transition-all">
              <span className="hover-underline">View All</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingNewArrivals ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-[400px] rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {newArrivals?.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group relative block rounded-2xl overflow-hidden bg-white">
                  <div className="aspect-[4/5] overflow-hidden bg-navy/5 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
                    )}
                  </div>
                  <div className="p-4 bg-white border border-border/50">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-sans font-medium text-ink truncate pr-2">{product.title}</h3>
                      <div className="flex items-center text-gold shrink-0">
                        <span className="text-xs font-bold mr-1">{product.rating || 5.0}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="font-serif italic text-muted-foreground text-sm mb-3 truncate">By {product.shopName || product.sellerName || 'Artisan'} &bull; {product.category}</p>
                    <p className="font-heading font-semibold text-lg text-gold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
      )}

      {/* Story Banner */}
      <AnimatedSection className="bg-ink text-gold py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-3xl">
          {featuredArtisans && featuredArtisans.length > 0 ? (
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 flex items-center justify-center bg-white border border-gold/30">
                  <img src="/Logo.jpeg" className="w-full h-full object-cover scale-[1.75]" alt="Featured Artisan" />
                </div>
                <p className="font-serif italic text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-6">
                  "{featuredArtisans[0].shopBio || 'Each piece carries 400 years of Multani heritage.'}"
                </p>
             </div>
          ) : (
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 flex items-center justify-center bg-white border border-gold/30">
                  <img src="/Logo.jpeg" className="w-full h-full object-cover scale-[1.75]" alt="Featured Artisan" />
                </div>
                <p className="font-serif italic text-2xl md:text-4xl leading-relaxed mb-6">
                  "Each piece carries 400 years of Multani heritage."
                </p>
             </div>
          )}
          <Link to="/stories" className="inline-flex items-center gap-2 text-white border border-gold/50 hover:bg-gold hover:border-gold hover:text-navy px-8 py-3 rounded-xl transition-all duration-300 font-medium font-sans">
            Read Their Stories <ArrowRight size={16} />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
