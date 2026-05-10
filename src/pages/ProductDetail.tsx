import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, User, Review } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Heart, Share2, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [activeImage, setActiveImage] = useState(0);
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

  const { data: artisan, isLoading: artisanLoading } = useQuery({
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

  const images = product?.images?.length ? product.images : [];

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

  if (!product) return <div className="text-center py-24 font-serif text-2xl">Product not found</div>;

  return (
    <div className="bg-cream min-h-screen pb-24">
      {/* Breadcrumb & Back */}
      <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
        <BackButton />
        <div className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to={`/explore?category=${product.category}`} className="hover:text-gold">{product.category}</Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12 lg:gap-24 mb-24">
        
        {/* Images */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-[4/5] md:aspect-square bg-navy/5 flex items-center justify-center rounded-3xl overflow-hidden border border-border">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-navy font-heading font-bold text-4xl italic opacity-50">MC</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-gold opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-ink leading-[1.1] mb-6">{product.title}</h1>
          <div className="flex items-center gap-4 mb-8 text-sm">
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (product.rating || 5) ? 'fill-current' : 'text-muted'}`} />)}
            </div>
            <span className="text-muted-foreground underline decoration-muted-foreground/30">{product.reviewCount || 0} reviews</span>
          </div>

          <p className="font-sans text-3xl font-medium text-ink mb-8">{formatPrice(product.price)}</p>

          <p className="font-serif text-lg leading-relaxed text-ink/80 mb-10 whitespace-pre-wrap">{product.description}</p>

          <div className="bg-white rounded-2xl p-6 border border-border mb-10 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted font-mono"
              >-</button>
              <span className="font-mono w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted font-mono"
              >+</button>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto flex-1 bg-gold hover:bg-gold-light text-ink font-bold rounded-full px-8 py-6 text-lg uppercase tracking-wide">
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-[52px] h-[52px] shrink-0 border-border text-ink hover:text-gold hover:border-gold">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Artisan Card */}
          {artisan && (
            <div className="mt-auto border-t border-border pt-8">
              <span className="font-sans tracking-widest uppercase text-xs text-muted-foreground mb-4 block">Crafted By</span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-navy" style={!artisan.shopLogoUrl && !artisan.photoURL ? { backgroundColor: '#1A237E' } : {}}>
                  {artisan.shopLogoUrl ? (
                    <img src={artisan.shopLogoUrl} alt={artisan.shopName} className="w-full h-full object-cover bg-white" />
                  ) : artisan.photoURL ? (
                     <img src={artisan.photoURL} alt={artisan.shopName || artisan.displayName} className="w-full h-full object-cover bg-white" />
                  ) : (
                    <span className="text-xl font-heading font-bold text-white">{artisan.shopName?.charAt(0) || artisan.displayName?.charAt(0) || 'M'}</span>
                  )}
                </div>
                <div>
                  <Link to={`/artisan/${artisan.shopHandle || artisan.uid}`} className="font-heading font-bold text-xl hover:text-gold transition-colors block">{artisan.shopName || artisan.displayName}</Link>
                  <span className="font-serif italic text-muted-foreground text-sm">{artisan.shopBio || `${artisan.craftSpecialty || artisan.craftType?.replace('_', ' ') || 'Master Artisan'} • ${artisan.shopLocation || artisan.workshopLocation || product.location || 'Multan'}`}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 max-w-4xl border-t border-border pt-16">
        <h2 className="font-heading font-bold text-3xl text-ink mb-12">Customer Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="pb-8 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-heading font-bold">{review.reviewerName?.charAt(0) || 'U'}</div>
                  <div>
                    <p className="font-sans font-medium text-ink">{review.reviewerName || 'Anonymous User'}</p>
                    <div className="flex items-center text-gold mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />)}
                    </div>
                  </div>
                </div>
                <p className="font-serif text-ink/80">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-serif italic text-muted-foreground">No reviews yet for this product.</p>
        )}
      </div>

    </div>
  );
}
