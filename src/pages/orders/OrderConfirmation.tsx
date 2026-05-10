import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'orders', id!));
      if (!snap.exists()) throw new Error('Order not found');
      return { id: snap.id, ...snap.data() } as Order;
    },
    enabled: !!id
  });

  if (isLoading) return <div className="text-center py-24">Loading...</div>;
  if (!order) return <div className="text-center py-24">Order not found</div>;

  return (
    <div className="bg-cream min-h-screen py-24 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-3xl p-12 shadow-sm border border-border text-center">
         
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 15 }}
           className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-8"
         >
           {/* Animated Checkmark SVG */}
           <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <motion.path 
                initial={{ pathLength: 0 }} 
                animate={{ pathLength: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" 
              />
           </svg>
         </motion.div>

         <h1 className="font-heading font-medium text-4xl mb-4 text-ink">Order Confirmed</h1>
         <p className="font-serif italic text-muted-foreground text-lg mb-8">
           Thank you, {order.shippingAddress.name}. Your order has been placed.
         </p>

         <div className="bg-muted/30 rounded-2xl p-6 text-left mb-8 flex justify-between items-center text-sm md:text-base border border-border/50">
           <div>
             <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Order ID</p>
             <p className="font-mono bg-white px-2 py-1 rounded inline-block">{order.id}</p>
           </div>
           <div className="text-right">
             <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Date</p>
             <p className="font-medium">{order.createdAt?.toMillis ? format(order.createdAt.toMillis(), 'MMM dd, yyyy') : 'Recently'}</p>
           </div>
         </div>

         <div className="mb-10 text-left">
           <h3 className="font-sans font-semibold mb-4 border-b border-border pb-2 uppercase tracking-wide text-sm">Summary</h3>
           {order.items.map((item, idx) => (
             <div key={idx} className="flex justify-between py-2 border-b border-border/30 last:border-0 items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-md overflow-hidden bg-navy/5 flex items-center justify-center shrink-0">
                     {item.imageUrl || item.image ? (
                       <img src={item.imageUrl || item.image} alt={item.title} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-[10px] font-heading font-bold italic text-navy/40">MC</span>
                     )}
                   </div>
                   <span className="text-sm font-medium">{item.title} <span className="text-muted-foreground ml-2">x{item.quantity}</span></span>
                </div>
                <span className="font-mono text-sm">{formatPrice(item.price * item.quantity)}</span>
             </div>
           ))}
           <div className="flex justify-between pt-4 font-bold text-lg border-t border-border mt-2">
             <span>Total</span>
             <span>{formatPrice(order.grandTotal)}</span>
           </div>
         </div>

         <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.href='/orders'} className="rounded-full px-8 py-6 font-medium">
              View Orders
            </Button>
            <Button onClick={() => window.location.href='/explore'} className="rounded-full px-8 py-6 bg-navy text-white hover:bg-navy-light font-medium">
              Continue Shopping
            </Button>
         </div>
      </div>
    </div>
  );
}
