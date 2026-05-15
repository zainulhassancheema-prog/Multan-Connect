import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, User, Review } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Heart, Share2, Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';
import { useAuthStore } from '@/lib/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialProofCard } from '@/components/shared/SocialProofCard';
import { AccordionRow } from '@/components/shared/AccordionRow';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Product not found');
      
      // Increment views
      await updateDoc(docRef, { views: increment(1) }).catch(err => console.error("Could not update views:", err));
      
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  });

  const { data: artisan } = useQuery({
    queryKey: ['artisan', product?.sellerId],
    enabled: !!product?.sellerId,
    queryFn: async () => {
      const docRef = doc(db, 'users', product!.sellerId);
      const docSnap = await getDoc(docRef);
      return { uid: docSnap.id, ...docSnap.data() } as User;
    }
  });

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', id],
    enabled: !!id,
    queryFn: async () => {
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", id),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
    }
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  useEffect(() => {
    // Determine mock activity specific to product detail page if no realtime data exists
    setRecentActivity([
      { id: 1, name: "Ali R.", action: "has liked this item", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
      { id: 2, name: "Fatima S.", action: "has just purchased", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", isPurchase: true },
    ]);
  }, [id]);

  const images = product?.images?.length ? product.images : [];
  const activeImage = images[activeImageIdx] || '';

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (user) {
       try {
         const cartItemRef = doc(db, "cart", user.uid, "items", product.id);
         await setDoc(cartItemRef, {
            productId: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.images?.[0] || "",
            sellerName: product.shopName || product.sellerName || artisan?.shopName || artisan?.displayName || 'Artisan',
            sellerId: product.sellerId,
            quantity: increment(quantity),
            addedAt: serverTimestamp()
         }, { merge: true });
         toast.success('Added to cart', { description: `${quantity}x ${product.title}` });
       } catch (err: any) {
         toast.error('Failed to add to cart', { description: err.message });
       }
    } else {
       addItem({ 
         productId: product.id, 
         title: product.title,
         price: product.price,
         imageUrl: product.images?.[0] || "",
         sellerName: product.shopName || product.sellerName || artisan?.shopName || artisan?.displayName || 'Artisan',
         sellerId: product.sellerId,
         quantity,
         addedAt: Date.now()
       } as any);
       toast.success('Added to cart!', { description: "Sign in to save your cart." });
    }
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex gap-12">
        <Skeleton className="w-1/2 h-[600px] rounded-3xl" />
        <div className="w-1/2 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-24 font-playfair text-2xl">Product not found</div>;

  return (
    <div className="relative min-h-screen bg-white overflow-hidden pb-24">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(41,182,197,0.15), transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(201,151,58,0.12), transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start mt-4">

          {/* LEFT: Product title, price, CTA */}
          <div className="space-y-8 z-10 order-2 xl:order-1 flex flex-col justify-center">
            {/* Category */}
            <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-px bg-gold" />
              {product.category?.replace("_", " ") || "Handmade"}
            </span>

            {/* Giant title — reference image style */}
            <h1 className="font-playfair text-5xl sm:text-6xl font-black text-ink leading-tight tracking-tight">
              {product.title.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {i === 0 ? (
                    <span className="relative inline-block">
                      {word}
                      <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                        <ellipse cx="50" cy="6" rx="49" ry="4" stroke="#C9973A" strokeWidth="1.5" fill="none" />
                      </svg>
                    </span>
                  ) : word}
                </span>
              ))}
            </h1>

            {/* Price */}
            <p className="text-3xl sm:text-4xl font-playfair font-bold text-ink">
              {formatPrice(product.price)}
            </p>

            {/* Description intro */}
            <p className="text-ink/60 text-sm leading-relaxed">
              {product.description?.slice(0, 160)}...
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-ink hover:bg-navy text-white font-medium px-8 py-4 rounded-full shadow-warm-md hover:shadow-navy-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <Check size={16} />
                Add to Cart
              </button>
              <button className="w-12 h-12 rounded-full border-2 border-ink/10 hover:border-gold flex items-center justify-center text-ink/40 hover:text-gold transition-all duration-300 hover:shadow-gold bg-white/50 backdrop-blur-sm">
                <Heart size={18} />
              </button>
            </div>

            {/* Artisan min-card */}
            {artisan && (
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-ink/5">
                <img src={artisan.shopLogoUrl || artisan.photoURL || `https://ui-avatars.com/api/?name=${artisan.shopName || artisan.displayName}&background=C9973A&color=fff`} alt={artisan.shopName || artisan.displayName || ''} className="w-12 h-12 rounded-full ring-2 ring-gold/20" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Crafted By</p>
                  <Link to={`/artisan/${artisan.shopHandle || artisan.uid}`} className="font-playfair font-bold text-lg text-ink hover:text-gold transition-colors">{artisan.shopName || artisan.displayName}</Link>
                </div>
              </div>
            )}
          </div>

          {/* CENTER: 3D Floating Product Image */}
          <div className="relative flex items-center justify-center min-h-[450px] sm:min-h-[600px] order-1 xl:order-2 perspective-container">

            {/* Arch background */}
            <div className="absolute inset-x-4 sm:inset-x-8 bottom-0 top-12"
              style={{
                background: "linear-gradient(180deg, rgba(26,35,126,0.03) 0%, rgba(41,182,197,0.03) 100%)",
                borderRadius: "50% 50% 48% 48% / 20% 20% 80% 80%",
              }}
            />

            {/* Orbit rings */}
            <div className="absolute w-[280px] sm:w-[320px] lg:w-[400px] h-[280px] sm:h-[320px] lg:h-[400px] rounded-full border border-gold/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animation: "orbit 25s linear infinite" }} />
            <div className="absolute w-[220px] sm:w-[240px] lg:w-[280px] h-[220px] sm:h-[240px] lg:h-[280px] rounded-full border border-teal/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animation: "orbit 15s linear infinite reverse" }} />

            {/* Floating orbs */}
            {[
              { size: 24, top: "20%", right: "8%", color: "gold", delay: "0s" },
              { size: 16, bottom: "30%", left: "5%", color: "teal", delay: "1.5s" },
              { size: 18, top: "50%", left: "10%", color: "navy", delay: "3s" },
            ].map((orb, i) => (
              <div key={i} className="absolute rounded-full float-orb"
                style={{
                  width: orb.size, height: orb.size,
                  top: orb.top, right: orb.right, bottom: orb.bottom, left: orb.left,
                  animationDelay: orb.delay,
                  background: orb.color === "gold" ? "radial-gradient(circle at 35% 35%, white, rgba(201,151,58,0.7))" : orb.color === "teal" ? "radial-gradient(circle at 35% 35%, white, rgba(41,182,197,0.7))" : "radial-gradient(circle at 35% 35%, white, rgba(26,35,126,0.5))",
                  boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.1), 2px 4px 8px rgba(0,0,0,0.1)"
                }}
              />
            ))}

            {/* 3D Rotating product image */}
            <motion.div
              animate={{ y: [0, -12, 0], rotateY: [0, 4, 0, -4, 0] }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative z-10 w-64 sm:w-80 h-80 flex items-center justify-center drop-shadow-2xl"
            >
              {activeImage ? (
                <img src={activeImage} alt={product.title} className="max-w-full max-h-full object-contain"
                  style={{ filter: "drop-shadow(0 30px 40px rgba(26,35,126,0.2)) drop-shadow(0 8px 16px rgba(201,151,58,0.1))" }}
                />
              ) : (
                <div className="text-navy/20 font-playfair font-bold text-6xl italic">MC</div>
              )}
            </motion.div>

            {/* Nav arrows — reference image styled */}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 bg-white/60 backdrop-blur-md z-20 shadow-sm">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 bg-white/60 backdrop-blur-md z-20 shadow-sm">
                  <ChevronRight size={18} />
                </button>
                
                {/* Thumbnail dots */}
                <div className="absolute bottom-6 flex gap-2 z-20 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImageIdx(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${activeImageIdx === i ? "bg-gold scale-125" : "bg-ink/20 hover:bg-ink/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Accordion details + social proof */}
          <div className="space-y-6 z-10 order-3 flex flex-col justify-center">

            {/* Social proof card 1 */}
            <AnimatePresence>
              {recentActivity.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mb-2 w-max ml-auto">
                  <SocialProofCard
                    avatar={recentActivity[0].avatar}
                    name={recentActivity[0].name}
                    action="has liked this item"
                    icon={<Heart size={10} className="fill-red-500 text-red-500" strokeWidth={3} />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Accordion — reference image style */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-warm-sm border border-white">
              {[
                { label: "Description", content: product.description },
                { label: "Story", content: "Handcrafted using generational techniques. Each piece carries the distinct touch of the artisan." },
                { label: "Care & Maintenance", content: "Avoid direct harsh chemicals. Wipe gently with damp cloth." },
                { label: "Shipping Info", content: "Standard orders dispatched within 2-3 business days fully insured." },
              ].map((item, i) => (
                <AccordionRow key={i} {...item} defaultOpen={i === 0} />
              ))}
            </div>

            {/* Second social proof — purchase notification */}
            <AnimatePresence>
              {recentActivity.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-2 w-max">
                  <SocialProofCard
                    avatar={recentActivity[1].avatar}
                    name={recentActivity[1].name}
                    action="just purchased"
                    icon={<ShoppingBag size={10} className="text-teal-600" strokeWidth={3} />}
                    variant="purchase"
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Reviews Section at bottom */}
        {reviews && reviews.length > 0 && (
          <div className="max-w-3xl mt-24 pt-12 border-t border-ink/5">
            <h2 className="font-playfair text-3xl text-navy font-bold mb-8">What Buyers Say</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(26,35,126,0.02)]">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center font-playfair font-bold text-white shadow-warm-sm">{review.reviewerName?.charAt(0) || 'U'}</div>
                    <div>
                      <p className="font-sans font-medium text-ink">{review.reviewerName || 'Anonymous User'}</p>
                      <div className="flex items-center gap-0.5 mt-0.5 text-gold">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />)}
                      </div>
                    </div>
                  </div>
                  <p className="font-sans text-ink/70 leading-relaxed text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}