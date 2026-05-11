import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { collection, addDoc, doc, getDocs, updateDoc, increment, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, CartItem as TCartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackButton } from '@/components/shared/BackButton';

const shippingSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  country: z.string().min(2),
  postalCode: z.string().min(4),
});

export default function Checkout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: user?.displayName || '' }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchCart = async () => {
      const q = collection(db, 'cart', user.uid, 'items');
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (items.length === 0) {
        navigate('/cart');
      } else {
        setCartItems(items);
      }
    };
    fetchCart();
  }, [user, navigate]);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 250;
  const grandTotal = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      // Create order
      const orderRef = await addDoc(collection(db, 'orders'), {
        buyerId: user.uid,
        buyerName: user.displayName || getValues().name,
        sellerId: cartItems[0].sellerId, // assuming same seller for simplicity based on prompt
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: subtotal,
        deliveryFee,
        grandTotal,
        status: 'pending',
        shippingAddress: getValues(),
        paymentMethod: 'cod',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update stock
      for (const item of cartItems) {
        await updateDoc(doc(db, "products", item.productId), {
          stock: increment(-item.quantity),
          totalSold: increment(item.quantity)
        });
      }
      
      // Clear cart
      const cartRef = collection(db, "cart", user.uid, "items");
      const cartSnap = await getDocs(cartRef);
      const deletePromises = cartSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      navigate(`/orders/${orderRef.id}/confirmation`);
    } catch (err: any) {
       toast.error('Failed to place order', { description: err.message });
       setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col lg:flex-row gap-12">
        
        {/* Main flow */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            <BackButton label="Back to Cart" href="/cart" />
            <h1 className="font-heading font-bold text-3xl">Checkout</h1>
          </div>
          
          {/* Step 1: Shipping */}
          <div className={`bg-white rounded-3xl p-8 shadow-sm mb-6 ${step !== 1 ? 'opacity-60 grayscale' : ''}`}>
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading font-medium text-xl">1. Shipping Information</h2>
                {step > 1 && <Button variant="link" onClick={() => setStep(1)}>Edit</Button>}
             </div>
             {step === 1 && (
               <form onSubmit={handleSubmit(() => setStep(2))} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Full Name</Label>
                     <Input {...register('name')} />
                     {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>Phone Number</Label>
                     <Input {...register('phone')} />
                     {errors.phone && <p className="text-xs text-destructive">{errors.phone.message as string}</p>}
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <Label>Street Address</Label>
                     <Input {...register('street')} />
                     {errors.street && <p className="text-xs text-destructive">{errors.street.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>City</Label>
                     <Input {...register('city')} />
                     {errors.city && <p className="text-xs text-destructive">{errors.city.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>Province</Label>
                     <Input {...register('province')} />
                     {errors.province && <p className="text-xs text-destructive">{errors.province.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>Postal Code</Label>
                     <Input {...register('postalCode')} />
                     {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>Country</Label>
                     <Input {...register('country')} defaultValue="Pakistan" />
                     {errors.country && <p className="text-xs text-destructive">{errors.country.message as string}</p>}
                   </div>
                 </div>
                 <Button type="submit" className="mt-6 bg-navy text-white rounded-full px-8">Continue to Payment</Button>
               </form>
             )}
          </div>

          {/* Step 2: Payment */}
          <div className={`bg-white rounded-3xl p-8 shadow-sm ${step < 2 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
             <h2 className="font-heading font-medium text-xl mb-6">2. Payment Method</h2>
             {step >= 2 && (
               <div>
                  <div className="border border-gold rounded-xl p-4 bg-gold/5 flex items-center justify-between mb-8 cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-4 border-gold bg-white"></div>
                        <span className="font-medium inline-block">Cash on Delivery</span>
                     </div>
                  </div>
                  
                  <div className="border border-border/50 opacity-60 rounded-xl p-4 flex items-center justify-between mb-8 cursor-not-allowed">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-border bg-muted"></div>
                        <span className="font-medium inline-block">Card Payment (Coming Soon)</span>
                     </div>
                  </div>
                  
                  <Button onClick={placeOrder} disabled={loading} className="w-full py-6 mt-4 rounded-full bg-gold hover:bg-gold-light text-ink font-bold tracking-wide uppercase">
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-96">
           <div className="bg-white rounded-3xl p-8 sticky top-24 border border-border/50 shadow-sm">
             <h3 className="font-heading font-medium text-lg mb-6">In your cart</h3>
             <div className="space-y-6 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar">
               {Object.entries(
                 cartItems.reduce((acc, item) => {
                   const shopName = item.sellerName || 'Unknown Shop';
                   if (!acc[shopName]) acc[shopName] = [];
                   acc[shopName].push(item);
                   return acc;
                 }, {} as Record<string, typeof cartItems>)
               ).map(([shopName, items]) => (
                 <div key={shopName}>
                   <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3 border-b border-border pb-1">{shopName}</div>
                   <div className="space-y-4">
                     {((items as any[]) || []).map((item: any) => (
                       <div key={item.productId} className="flex gap-4 items-center">
                         <div className="w-16 h-16 rounded-md overflow-hidden bg-navy/5 flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={`${item.title} — ${item.quantity} × PKR ${item.price.toLocaleString()}`} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading font-bold italic text-navy/40">MC</span>
                            )}
                         </div>
                         <div className="flex-1 text-sm overflow-hidden">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-muted-foreground italic font-serif">Qty: {item.quantity}</p>
                         </div>
                         <span className="font-bold text-sm tracking-tighter shrink-0">{formatPrice(item.price * item.quantity)}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="border-t border-border pt-4 text-sm space-y-2 mb-4">
               <div className="flex justify-between items-center text-muted-foreground">
                 <span>Subtotal</span>
                 <span>{formatPrice(subtotal)}</span>
               </div>
               <div className="flex justify-between items-center text-muted-foreground">
                 <span>Delivery Fee</span>
                 <span>{formatPrice(deliveryFee)}</span>
               </div>
             </div>
             <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm uppercase tracking-widest">Total</span>
                  <span className="font-bold text-2xl">{formatPrice(grandTotal)}</span>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
