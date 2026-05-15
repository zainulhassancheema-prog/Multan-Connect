import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, getDocs, limit, startAfter, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw, ArchiveX, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '@/components/shared/ProductCardSkeleton';
import ProductCard from '@/components/shared/ProductCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const queryFilter = searchParams.get('q');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState(queryFilter || '');
  
  // When URL param changes, update local search term
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (searchTerm) {
      document.title = `"${searchTerm}" — Explore | Multan Connect`;
    } else {
      document.title = "Explore Handmade Crafts | Multan Connect";
    }
  }, [searchTerm]);
  
  // Realtime listener for new products toast
  useEffect(() => {
    let q = query(collection(db, 'products'), where('isAvailable', '==', true), orderBy('createdAt', 'desc'), limit(1));
    if (categoryFilter) {
      q = query(collection(db, 'products'), where('category', '==', categoryFilter), where('isAvailable', '==', true), orderBy('createdAt', 'desc'), limit(1));
    }
    
    let isFirstRun = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          toast('New listings available!', {
             description: 'Refresh the page to see the latest items.',
             action: {
               label: 'Refresh',
               onClick: () => window.location.reload()
             }
          });
        }
      });
    });
    
    return () => unsubscribe();
  }, [categoryFilter]);

  // Initial fetch
  const fetchProducts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
        setLastVisible(null);
      } else {
        setLoadingMore(true);
      }
      
      let baseQ = query(collection(db, 'products'), where('isAvailable', '==', true));
      
      if (categoryFilter) {
        baseQ = query(baseQ, where('category', '==', categoryFilter));
      }
      
      // If doing search, client-side filtering needed, so we fetch more and apply sort client-side for simplicity in this demo
      if (searchTerm) {
        // Fetch up to 200 without cursors for client-side search
        let searchQ = query(collection(db, 'products'), where('isAvailable', '==', true), limit(200));
        if (categoryFilter) {
            searchQ = query(searchQ, where('category', '==', categoryFilter));
        }
        const snapshot = await getDocs(searchQ);
        const term = searchTerm.toLowerCase();
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        const filtered = allProducts.filter(p => 
           p.title?.toLowerCase().includes(term) || 
           p.tags?.some(tag => tag.toLowerCase().includes(term))
        );
        setProducts(filtered);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      baseQ = query(baseQ, orderBy('createdAt', 'desc')); // Default sort
      
      if (!reset && lastVisible) {
        baseQ = query(baseQ, startAfter(lastVisible));
      }
      
      baseQ = query(baseQ, limit(12));
      
      const snapshot = await getDocs(baseQ);
      const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(newProducts.length === 12);
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
       fetchProducts(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [categoryFilter, searchTerm]);

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
              <Input 
                 placeholder="Search products..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 rounded-full bg-white border-border" 
              />
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
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_,i) => <ProductCardSkeleton key={i} />)}
               </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-16 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchProducts(false)} 
                      disabled={loadingMore}
                      className="rounded-full border-ink text-ink font-serif hover:bg-ink hover:text-white px-8"
                    >
                      {loadingMore ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : null}
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white border border-border rounded-3xl flex flex-col items-center">
                {categoryFilter === "Blue Pottery" ? (
                  <div className="text-center flex flex-col items-center">
                    <motion.img
                      src="/images/hero-vase.png"
                      alt="No Blue Pottery products found yet"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-auto mx-auto mb-6 opacity-30"
                    />
                    <p className="font-serif italic text-2xl text-muted-foreground mb-4">No Blue Pottery yet. Check back soon!</p>
                  </div>
                ) : (
                  <>
                    <ArchiveX className="w-16 h-16 text-gold/30 mb-6" />
                    <p className="font-serif italic text-2xl text-muted-foreground mb-4">No pieces found in this category yet. Check back soon!</p>
                  </>
                )}
                <Button variant="link" onClick={() => setSearchParams({})} className="text-gold hover:text-ink hover-underline transition-colors mt-2">Clear filters</Button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
