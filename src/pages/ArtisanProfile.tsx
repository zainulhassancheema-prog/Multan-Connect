import { useEffect, useState } from 'react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useParams } from 'react-router-dom';
import { BackButton } from '@/components/shared/BackButton';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, Star, Package, Share2, MessageCircle, UserPlus, UserCheck, CheckCircle } from 'lucide-react';
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
  
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = () => setIsFollowing(!isFollowing);

  const shopName = artisan.shopName || artisan.displayName;
  const productsCount = products.length;

  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Shop Banner / Cover Photo */}
      <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden">
        
        {artisan.shopBannerUrl ? (
          // Real uploaded banner
          <img
            src={artisan.shopBannerUrl}
            alt={`Shop banner for ${shopName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback gradient when no banner uploaded
          <div className="w-full h-full bg-gradient-to-br from-navy via-primary to-teal
                          flex items-center justify-center relative overflow-hidden">
            {/* Arabesque pattern overlay */}
            <div className="absolute inset-0 opacity-[0.2] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay pointer-events-none" />
            {/* Large faded shop name as background text */}
            <p className="font-heading text-6xl md:text-8xl text-white/10 
                          font-bold select-none text-center px-4">
              {shopName}
            </p>
          </div>
        )}

        {/* Gradient overlay — fades bottom of banner into page background */}
        <div className="absolute inset-0 bg-gradient-to-t 
                        from-sand via-transparent to-transparent 
                        from-0% via-60%" />

        {/* Back button top left */}
        <div className="absolute top-4 left-4 z-10">
          <BackButton
            className="bg-white/80 backdrop-blur-sm text-navy px-3 py-2 
                       rounded-xl shadow-sm hover:bg-white transition-colors border border-border/50"
          />
        </div>

        {/* Share button top right */}
        <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 
                           backdrop-blur-sm rounded-xl flex items-center 
                           justify-center shadow-sm hover:bg-white transition-colors border border-border/50">
          <Share2 size={18} className="text-navy" />
        </button>

      </div>

      <AnimatedSection className="container mx-auto px-4 max-w-6xl -mt-16 md:-mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 
                        flex flex-col md:flex-row gap-5 md:gap-6 border border-border/50 max-w-4xl mx-auto">
          
          {/* Shop logo — circular, with gold border */}
          <div className="flex-shrink-0 flex justify-center md:block">
            {artisan.shopLogoUrl || artisan.photoURL ? (
              <img
                src={artisan.shopLogoUrl || artisan.photoURL}
                alt={`Shop logo for ${shopName}`}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full 
                           border-4 border-gold shadow-lg object-cover bg-white"
              />
            ) : (
              // Initials fallback
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full 
                              border-4 border-gold shadow-lg bg-navy 
                              flex items-center justify-center">
                <span className="font-serif text-3xl text-white font-bold">
                  {shopName?.charAt(0) ?? "A"}
                </span>
              </div>
            )}
          </div>

          {/* Shop info */}
          <div className="flex-1 text-center md:text-left">
            {(artisan as any).isVerifiedArtisan && (
              <span className="inline-flex items-center gap-1 text-xs text-teal 
                               bg-teal/10 px-2 py-1 rounded-full mb-2 font-bold uppercase tracking-wider">
                <CheckCircle size={11} /> Verified Artisan
              </span>
            )}
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-navy">
              {shopName}
            </h1>
            {artisan.shopBio && (
              <p className="font-serif italic text-gold text-base md:text-lg mt-1">
                {artisan.shopBio}
              </p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <MapPin size={14} /> {artisan.shopLocation || artisan.workshopLocation || 'Multan'}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Package size={14} /> {productsCount} listings
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Star size={14} className="text-gold fill-gold" />
                {artisan.totalSales || 0} Sales
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row md:flex-col gap-2 justify-center flex-shrink-0 pt-4 md:pt-0 border-t border-border/50 md:border-0 mt-4 md:mt-0">
            <Link
              to={`/messages`}
              onClick={(e) => { e.preventDefault(); alert("Messaging feature coming soon!") }}
              className="flex items-center gap-2 border border-navy text-navy 
                         hover:bg-navy hover:text-white px-4 py-2.5 rounded-xl 
                         text-sm font-bold uppercase tracking-wider transition-colors duration-200"
            >
              <MessageCircle size={16} />
              Message
            </Link>
            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm 
                          font-bold uppercase tracking-wider transition-colors duration-200
                          ${isFollowing
                            ? "bg-navy/10 text-navy border border-navy/20"
                            : "bg-gold text-white hover:bg-gold-light"
                          }`}
            >
              {isFollowing ? (
                <><UserCheck size={16} /> Following</>
              ) : (
                <><UserPlus size={16} /> Follow</>
              )}
            </button>
          </div>

        </div>
        
        {(artisan.bio || artisan.storyText) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-6 border border-border/50 max-w-4xl mx-auto">
            <h3 className="font-heading font-medium text-xl mb-4 text-ink">Shop Story</h3>
            <p className="text-ink/80 leading-relaxed font-sans">{artisan.storyText || artisan.bio}</p>
          </div>
        )}

        <div className="mt-16">
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
                         <img src={product.images[0]} alt={`${product.title} by ${shopName}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
