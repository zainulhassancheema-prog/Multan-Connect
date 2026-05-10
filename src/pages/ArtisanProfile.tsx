import { useEffect, useState } from 'react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useParams } from 'react-router-dom';
import { BackButton } from '@/components/shared/BackButton';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, Star, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArtisanProfile() {
  const { handle } = useParams();
  const [artisan, setArtisan] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArtisan = async () => {
      if (!handle) return;
      try {
        setLoading(true);
        // Find user by shopHandle or fallback to uid for old links
        let userDoc = null;
        let q = query(collection(db, 'users'), where('shopHandle', '==', handle));
        let snap = await getDocs(q);
        
        if (snap.empty) {
           q = query(collection(db, 'users'), where('uid', '==', handle));
           snap = await getDocs(q);
        }
        
        if (!snap.empty) {
          const userData = { uid: snap.docs[0].id, ...snap.docs[0].data() } as User;
          setArtisan(userData);
          
          // Fetch products
          const productsQ = query(collection(db, 'products'), where('sellerId', '==', userData.uid));
          const pSnap = await getDocs(productsQ);
          setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        }
      } catch (err) {
        console.error("Error fetching artisan", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtisan();
  }, [handle]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-serif italic text-muted-foreground animate-pulse">Loading workshop...</div>;
  }

  if (!artisan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="font-heading text-3xl font-bold mb-4 text-ink">Shop Not Found</h1>
        <Link to="/explore" className="text-gold font-medium hover:underline">Return to Explore</Link>
      </div>
    );
  }
  
  const shopName = artisan.shopName || artisan.displayName;

  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Banner */}
      <div className="h-64 md:h-80 w-full bg-navy relative border-b-4 border-gold">
         {artisan.shopBannerUrl && (
           <img src={artisan.shopBannerUrl} alt={shopName} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
         )}
         <div className="absolute top-6 left-6 text-white z-10">
           <BackButton />
         </div>
      </div>

      <AnimatedSection className="container mx-auto px-4 max-w-6xl -mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-border/50 text-center mb-16">
           <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden bg-navy" style={!artisan.shopLogoUrl && !artisan.photoURL ? { backgroundColor: '#1A237E' } : {}}>
                  {artisan.shopLogoUrl ? (
                    <img src={artisan.shopLogoUrl} alt={shopName} className="w-full h-full object-cover bg-white" />
                  ) : artisan.photoURL ? (
                     <img src={artisan.photoURL} alt={shopName} className="w-full h-full object-cover bg-white" />
                  ) : (
                    <span className="text-5xl font-heading font-bold text-white">{shopName?.charAt(0) || 'M'}</span>
                  )}
              </div>
           </div>
           
           <h1 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-4">{shopName}</h1>
           
           {artisan.shopBio && (
             <p className="font-serif italic text-gold text-xl mb-6">{artisan.shopBio}</p>
           )}
           
           <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm uppercase tracking-widest font-medium">
              <div className="flex items-center gap-2">
                 <Package className="w-4 h-4" />
                 <span>{artisan.craftType?.replace('_', ' ') || 'Artisan'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <MapPin className="w-4 h-4" />
                 <span>{artisan.shopLocation || artisan.workshopLocation || 'Multan'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Star className="w-4 h-4 text-gold mb-1" />
                 <span>{artisan.totalSales || 0} Sales</span>
              </div>
           </div>
           
           {artisan.bio && (
             <div className="mt-8 pt-8 border-t border-border max-w-3xl mx-auto">
               <h3 className="font-heading font-medium text-xl mb-4 text-ink">Shop Story</h3>
               <p className="text-ink/80 leading-relaxed font-sans">{artisan.bio}</p>
             </div>
           )}
        </div>

        <div>
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-bold text-3xl text-ink">Collection</h2>
              <span className="text-muted-foreground font-serif italic">{products.length} items</span>
           </div>
           
           {products.length === 0 ? (
             <div className="text-center py-24 bg-white/50 rounded-2xl border border-border">
               <p className="font-serif italic text-muted-foreground">This shop hasn't listed any items yet.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
               {products.map(product => (
                 <Link to={`/product/${product.id}`} key={product.id} className="group relative block rounded-2xl overflow-hidden bg-white">
                   <div className="aspect-[4/5] overflow-hidden bg-navy/5 flex items-center justify-center">
                     {product.images && product.images.length > 0 ? (
                         <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     ) : (
                         <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
                     )}
                   </div>
                   <div className="p-4 bg-white border border-border/50">
                     <div className="flex justify-between items-start mb-1">
                       <h3 className="font-sans font-medium text-ink truncate pr-2">{product.title}</h3>
                     </div>
                     <p className="font-serif italic text-muted-foreground text-sm mb-3 truncate">{product.category}</p>
                     <p className="font-heading font-semibold text-lg text-gold">{formatPrice(product.price)}</p>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </div>
      </AnimatedSection>
    </div>
  );
}
