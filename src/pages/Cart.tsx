import { useCartStore } from '@/lib/store/cartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, CartItem as TCartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export default function Cart() {
  const { user } = useAuthStore();
  const { items: localItems, updateQuantity: localUpdateQuantity, removeItem: localRemoveItem } = useCartStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: firestoreItems, isLoading: loadingFsCart } = useQuery({
    queryKey: ['firestore-cart', user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const q = collection(db, 'cart', user!.uid, 'items');
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const activeItems = user ? (firestoreItems || []) : localItems;

  const { data: cartProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['cart-products', activeItems],
    queryFn: async () => {
      const products = [];
      for (const item of activeItems) {
        const docRef = doc(db, 'products', item.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          products.push({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          // Push null so we know it's missing
          products.push({ id: item.productId, missing: true } as any);
        }
      }
      return products;
    },
    enabled: activeItems.length > 0
  });

  const isLoading = (user && loadingFsCart) || loadingProducts;

  const updateFsQuantity = async ({ productId, newQuantity }: { productId: string, newQuantity: number }) => {
    if (!user) return;
    if (newQuantity <= 0) {
      await deleteDoc(doc(db, 'cart', user.uid, 'items', productId));
    } else {
      await updateDoc(doc(db, 'cart', user.uid, 'items', productId), { quantity: newQuantity });
    }
  };

  const updateMutation = useMutation({
    mutationFn: updateFsQuantity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firestore-cart'] })
  });

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (user) {
      updateMutation.mutate({ productId, newQuantity });
    } else {
      if (newQuantity <= 0) {
        localRemoveItem(productId);
      } else {
        localUpdateQuantity(productId, newQuantity);
      }
    }
  };

  const handleRemove = async (productId: string) => {
    if (user) {
      await deleteDoc(doc(db, 'cart', user.uid, 'items', productId));
      queryClient.invalidateQueries({ queryKey: ['firestore-cart'] });
      toast.success('Item removed');
    } else {
      localRemoveItem(productId);
      toast.success('Item removed');
    }
  };

  const getSubtotal = () => {
    if (!cartProducts) return 0;
    return activeItems.reduce((total, item) => {
      const product = cartProducts.find(p => p.id === item.productId && !p.missing && p.isAvailable);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const validItemsCount = activeItems.filter(item => {
     const product = cartProducts?.find(p => p.id === item.productId);
     return product && !product.missing && product.isAvailable;
  }).length;

  if (activeItems.length === 0) {
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
            activeItems.map((item) => {
              const product = cartProducts?.find(p => p.id === item.productId);
              const isMissingOrUnavailable = !product || product.missing || !product.isAvailable;
              
              const displayImage = product && !product.missing ? product.images?.[0] || item.imageUrl : item.imageUrl;
              const displayTitle = product && !product.missing ? product.title : item.title || 'Unknown Product';
              const displayCategory = product && !product.missing ? product.category : '';
              const displayPrice = product && !product.missing ? product.price : item.price;
              const maxStock = product && !product.missing ? product.stock : 1;
              
              return (
                <div key={item.productId} className={`flex gap-6 items-center ${isMissingOrUnavailable ? 'opacity-50 grayscale' : ''}`}>
                  <div className="w-24 h-32 md:w-32 md:h-40 rounded-xl overflow-hidden shrink-0 border border-border bg-navy/5 flex items-center justify-center">
                    {displayImage ? (
                      <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link to={isMissingOrUnavailable ? '#' : `/product/${item.productId}`} className="font-sans font-medium text-lg hover:text-gold transition-colors">{displayTitle}</Link>
                    {displayCategory && <p className="font-serif text-muted-foreground italic text-sm mb-2">{displayCategory}</p>}
                    
                    {isMissingOrUnavailable ? (
                      <div className="flex items-center gap-2 text-destructive text-sm mb-4 bg-destructive/10 w-fit px-3 py-1 rounded-full">
                         <AlertTriangle className="w-4 h-4" />
                         <span>This item is no longer available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-3 border border-border rounded-full p-1 bg-white">
                          <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">-</button>
                          <span className="w-4 text-center font-mono">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.productId, Math.min(maxStock, item.quantity + 1))} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">+</button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                    <p className="font-sans font-bold text-lg">
                      {isMissingOrUnavailable ? '—' : formatPrice(displayPrice * item.quantity)}
                    </p>
                    <button onClick={() => handleRemove(item.productId)} className="text-muted-foreground hover:text-destructive p-2 mt-auto">
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{validItemsCount > 0 ? formatPrice(250) : '—'}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-bold text-lg mt-2">
                <span>Total</span>
                <span className="text-gold">{validItemsCount > 0 ? formatPrice(getSubtotal() + 250) : formatPrice(0)}</span>
              </div>
            </div>
            <Button onClick={() => navigate('/checkout')} disabled={validItemsCount === 0} className="w-full bg-gold hover:bg-gold-light text-ink font-bold rounded-full py-6 uppercase tracking-widest text-sm">
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
