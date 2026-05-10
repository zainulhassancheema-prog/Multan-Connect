import { useCartStore } from '@/lib/store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();

  const { data: cartProducts, isLoading } = useQuery({
    queryKey: ['cart-products', items],
    queryFn: async () => {
      const products = [];
      for (const item of items) {
        const docRef = doc(db, 'products', item.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          products.push({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      }
      return products;
    },
    enabled: items.length > 0
  });

  const getSubtotal = () => {
    if (!cartProducts) return 0;
    return items.reduce((total, item) => {
      const product = cartProducts.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-heading font-bold text-4xl mb-4">Your Cart is Empty</h1>
        <p className="font-serif italic text-muted-foreground mb-8">Let's find something special for you.</p>
        <Button onClick={() => window.location.href = '/explore'} className="bg-gold hover:bg-gold-light text-ink rounded-full px-8 py-6">
          Explore the Market
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24 max-w-6xl">
      <h1 className="font-heading font-bold text-4xl mb-12 border-b border-border pb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          {isLoading ? (
            <p className="font-serif italic text-muted-foreground">Loading items...</p>
          ) : (
            items.map((item) => {
              const product = cartProducts?.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={item.productId} className="flex gap-6 items-center">
                  <div className="w-24 h-32 md:w-32 md:h-40 rounded-xl overflow-hidden shrink-0 border border-border">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link to={`/product/${product.id}`} className="font-sans font-medium text-lg hover:text-gold transition-colors">{product.title}</Link>
                    <p className="font-serif text-muted-foreground italic text-sm mb-4">{product.category}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 border border-border rounded-full p-1 bg-white">
                        <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">-</button>
                        <span className="w-4 text-center font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, Math.min(product.stock, item.quantity + 1))} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive p-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-lg">{formatPrice(product.price * item.quantity)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-3xl p-8 border border-border sticky top-24">
            <h2 className="font-heading font-medium text-2xl mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
              <span className="font-medium uppercase tracking-widest text-xs">Estimated Total</span>
              <span className="font-bold text-xl">{formatPrice(getSubtotal())}</span>
            </div>
            <Button onClick={() => navigate('/checkout')} className="w-full bg-navy hover:bg-navy-light text-white rounded-full py-6 font-bold tracking-wide uppercase text-sm">
              Proceed to Checkout
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4 font-serif italic">Shipping & taxes calculated at checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
