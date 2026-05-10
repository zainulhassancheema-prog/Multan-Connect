import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/lib/store/authStore';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

export default function SellerOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="font-heading text-3xl font-bold text-ink mb-2">Orders</h1>
        <div className="text-muted-foreground animate-pulse">Loading real-time orders...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-ink mb-2">Orders</h1>
        <p className="font-serif italic text-muted-foreground">Manage your incoming orders and shipments.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-border">
          <Package className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="font-heading font-medium text-xl text-ink">No orders yet</h2>
          <p className="font-serif text-muted-foreground italic">When buyers purchase your items, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-border p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-sans font-medium text-ink">Buyer: {order.buyerName}</p>
                <p className="font-serif text-sm text-muted-foreground italic">
                  {order.createdAt?.toMillis ? format(order.createdAt.toMillis(), 'MMM d, yyyy h:mm a') : 'Recent'}
                </p>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-4">
                 {order.items?.map((item: any) => (
                   <div key={item.productId} className="flex items-center gap-3 bg-navy/5 p-2 rounded-lg pr-4">
                      <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-white">
                         {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-navy/10 flex items-center justify-center text-xs">MC</div>}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium truncate max-w-[150px]">{item.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="text-right shrink-0">
                <p className="font-serif text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="font-heading font-bold text-2xl text-gold">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
