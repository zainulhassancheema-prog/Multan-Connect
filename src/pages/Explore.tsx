import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  // Basic infinite query for products
  const fetchProducts = async ({ pageParam = null }) => {
    let q = query(collection(db, 'products'), limit(12));
    
    if (categoryFilter) {
      q = query(collection(db, 'products'), where('category', '==', categoryFilter), limit(12));
    }
    
    if (pageParam) {
      q = query(q, startAfter(pageParam));
    }
    
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    return {
      products,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', categoryFilter],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    initialPageParam: null,
  });

  const products = data?.pages.flatMap(page => page.products) || [];

  return (
    <div className="bg-cream min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-ink mb-4">
              Explore {categoryFilter ? categoryFilter : 'All Crafts'}
            </h1>
            <p className="font-serif italic text-muted-foreground text-lg">
              Authentic pieces straight from the artisans of Multan.
            </p>
          </div>
          <div className="w-full md:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search artisans or products..." className="pl-9 rounded-full bg-white border-border" />
            </div>
            <Button variant="outline" className="rounded-full md:hidden">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24 h-max">
            <div>
              <h3 className="font-sans font-semibold tracking-widest uppercase text-xs mb-4 text-ink">Categories</h3>
              <ul className="space-y-3 font-serif text-muted-foreground">
                <li><button onClick={() => setSearchParams({})} className={`hover:text-gold transition-colors hover-underline ${!categoryFilter ? 'text-gold italic font-medium' : ''}`}>All Crafts</button></li>
                <li><button onClick={() => setSearchParams({category:'Blue Pottery'})} className={`hover:text-gold transition-colors hover-underline ${categoryFilter==='Blue Pottery' ? 'text-gold italic font-medium' : ''}`}>Blue Pottery</button></li>
                <li><button onClick={() => setSearchParams({category:'Khussa'})} className={`hover:text-gold transition-colors hover-underline ${categoryFilter==='Khussa' ? 'text-gold italic font-medium' : ''}`}>Khussa Footwear</button></li>
                <li><button onClick={() => setSearchParams({category:'Embroidery'})} className={`hover:text-gold transition-colors hover-underline ${categoryFilter==='Embroidery' ? 'text-gold italic font-medium' : ''}`}>Embroidery</button></li>
              </ul>
            </div>
            
            <div className="pt-8 border-t border-border">
              <h3 className="font-sans font-semibold tracking-widest uppercase text-xs mb-4 text-ink">Price Range</h3>
              {/* Fake slider for visual */}
              <div className="h-1 w-full bg-border rounded-full relative mb-4 mt-2">
                 <div className="absolute left-1/4 right-1/4 h-full bg-gold rounded-full"></div>
                 <div className="absolute left-1/4 w-4 h-4 bg-white border-2 border-gold rounded-full -top-1.5 -ml-2"></div>
                 <div className="absolute right-1/4 w-4 h-4 bg-white border-2 border-gold rounded-full -top-1.5 -mr-2"></div>
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>PKR 0</span>
                <span>PKR 50k+</span>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-80 rounded-2xl bg-white" />)}
               </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 gap-y-10">
                  {products.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col">
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-white border border-border">
                        <img src={product.images[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <h3 className="font-sans font-medium text-ink truncate group-hover:text-gold transition-colors">{product.title}</h3>
                      <p className="font-serif italic text-muted-foreground text-sm truncate mb-2">{product.location || 'Multan'}</p>
                      <p className="font-heading font-semibold text-gold mt-auto">{formatPrice(product.price)}</p>
                    </Link>
                  ))}
                </div>
                {hasNextPage && (
                  <div className="mt-16 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()} 
                      disabled={isFetchingNextPage}
                      className="rounded-full border-ink text-ink font-serif hover:bg-ink hover:text-white px-8"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <p className="font-serif italic text-2xl text-muted-foreground mb-4">No pieces found in this category.</p>
                <Button variant="link" onClick={() => setSearchParams({})} className="text-gold hover:text-ink hover-underline transition-colors">Clear filters</Button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
