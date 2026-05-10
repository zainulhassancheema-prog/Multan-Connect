import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, User } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Heart, Share2, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Product not found');
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  });

  const { data: artisan } = useQuery({
    queryKey: ['artisan', product?.sellerId],
    enabled: !!product?.sellerId,
    queryFn: async () => {
      const docRef = doc(db, 'users', product!.sellerId);
      const docSnap = await getDoc(docRef);
      return docSnap.data() as User;
    }
  });

  const images = product?.images?.length ? product.images : ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80'];

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product.id, quantity });
      toast.success('Added to cart', { description: `${quantity}x ${product.title}` });
    }
  };

  if (isLoading) {
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
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6 text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span>/</span>
        <Link to={`/explore?category=${product.category}`} className="hover:text-gold">{product.category}</Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Images */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-[4/5] md:aspect-square bg-white rounded-3xl overflow-hidden border border-border">
            <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
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
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={artisan.photoURL || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80'} alt={artisan.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <Link to={`/artisan/${product.sellerId}`} className="font-heading font-bold text-xl hover:text-gold transition-colors block">{artisan.displayName}</Link>
                  <span className="font-serif italic text-muted-foreground text-sm">{artisan.craftSpecialty || 'Master Artisan'} &bull; {artisan.workshopLocation || 'Multan'}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
