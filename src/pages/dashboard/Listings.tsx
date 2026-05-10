import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Listings() {
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings', user?.uid],
    queryFn: async () => {
      const q = query(collection(db, 'products'), where('sellerId', '==', user?.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    },
    enabled: !!user?.uid
  });

  return (
    <div className="max-w-6xl mx-auto">
       <div className="flex justify-between items-center mb-8">
         <h1 className="font-heading font-bold text-4xl">My Listings</h1>
         <Button onClick={() => setIsAdding(true)} className="bg-gold hover:bg-gold-light text-ink rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" /> Add New
         </Button>
       </div>

       {isLoading ? (
          <div className="space-y-4">
             {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-24 w-full bg-white rounded-2xl" />)}
          </div>
       ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
             {listings.map(product => (
               <div key={product.id} className="bg-white rounded-2xl p-6 border border-border shadow-sm flex items-center gap-6">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                     <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                     <h3 className="font-sans font-medium text-lg">{product.title}</h3>
                     <p className="text-muted-foreground text-sm font-serif italic">{product.category}</p>
                     <p className="font-mono font-bold mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div className="text-right">
                     <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${product.isAvailable ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {product.isAvailable ? 'Active' : 'Hidden'}
                     </span>
                     <p className="text-xs text-muted-foreground mt-2">Stock: {product.stock}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 ml-4">
                     <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                  </div>
               </div>
             ))}
          </div>
       ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-border">
             <p className="font-serif italic text-muted-foreground text-lg mb-4">You have no listings yet.</p>
             <Button onClick={() => setIsAdding(true)} variant="outline" className="rounded-full">Create Your First Listing</Button>
          </div>
       )}
    </div>
  );
}
