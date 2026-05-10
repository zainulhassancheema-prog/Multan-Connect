import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: user?.displayName || '' }
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Fetch product details
    const fetchProducts = async () => {
      const fetched = [];
      for (const item of items) {
         const snap = await getDoc(doc(db, 'products', item.productId));
         if (snap.exists()) {
           fetched.push({ id: snap.id, ...snap.data() } as Product);
         }
      }
      setCartProducts(fetched);
    };
    fetchProducts();
  }, [items, navigate]);

  const grandTotal = items.reduce((total, item) => {
    const product = cartProducts.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items.map(item => {
          const p = cartProducts.find(x => x.id === item.productId)!;
          return {
            productId: p.id,
            sellerId: p.sellerId,
            quantity: item.quantity,
            price: p.price,
            title: p.title,
            image: p.images[0]
          };
        }),
        shippingAddress: getValues(),
        paymentMethod: 'cod',
        grandTotal,
        status: 'pending',
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      navigate(`/orders/${docRef.id}/confirmation`);
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
          <h1 className="font-heading font-bold text-3xl mb-8">Checkout</h1>
          
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
             <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar">
               {items.map(item => {
                 const p = cartProducts.find(x => x.id === item.productId);
                 if (!p) return null;
                 return (
                   <div key={item.productId} className="flex gap-4 items-center">
                     <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 text-sm">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-muted-foreground italic font-serif">Qty: {item.quantity}</p>
                     </div>
                     <span className="font-bold text-sm tracking-tighter">{formatPrice(p.price * item.quantity)}</span>
                   </div>
                 )
               })}
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
