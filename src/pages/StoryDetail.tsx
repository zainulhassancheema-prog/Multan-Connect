// src/pages/StoryDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Product, Review } from '@/lib/types';
import { CheckCircle, MapPin, Package, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shared/ProductCard';
import { MOCK_STORIES } from './Stories';

export default function StoryDetail() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!handle) return;
        
        // Find seller by shopHandle or uid in MOCK_STORIES
        const found = MOCK_STORIES.find((s) => s.shopHandle === handle || s.uid === handle);
        if (!found) {
            navigate('/stories', { replace: true });
            return;
        }
        
        setSeller(found);
        document.title = `${found.shopName || 'Artisan Story'} | Multan Connect`;
        
        // Mock products for the story pages to keep it static-looking
        setProducts([
          {
             id: 'mock-p-1',
             title: 'Signature Blue Pottery Vase',
             price: 3500,
             category: 'Blue Pottery',
             images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop'],
             shopName: found.shopName
          } as any,
          {
             id: 'mock-p-2',
             title: 'Traditional Tilla Khussa',
             price: 4200,
             category: 'Khussa',
             images: ['https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop'],
             shopName: found.shopName
          } as any,
        ]);
        
        setReviews([
           {
              id: 'mock-r-1',
              reviewerName: 'Ayesha K.',
              rating: 5,
              comment: 'The craftsmanship is unbelievable. I can feel the history in this piece.',
              image: 'https://i.pravatar.cc/150?u=1'
           } as any,
           {
              id: 'mock-r-2',
              reviewerName: 'Bilal M.',
              rating: 5,
              comment: 'Reminds me of my grandmother\'s house in Multan. Authentic and beautiful.',
              image: 'https://i.pravatar.cc/150?u=2'
           } as any
        ]);

      } catch (err) {
        console.error("Failed to load story details:", err);
      } finally {
        setLoading(false);
      }
    };

    // Simulate network delay
    setTimeout(() => {
       fetchData();
    }, 600);
  }, [handle, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-ink font-medium">Gathering the story...</p>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="bg-cream min-h-screen">
      <button 
        onClick={() => navigate('/stories')}
        className="absolute top-6 left-6 z-20 text-white flex items-center gap-2 bg-navy/20 hover:bg-navy/40 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium border border-white/10"
      >
        <ArrowLeft size={16} /> All Stories
      </button>

      {/* Full-Width Cover */}
      <div className="relative w-full h-[60vh] bg-navy overflow-hidden">
        {seller.shopBannerUrl ? (
          <img src={seller.shopBannerUrl} alt={seller.shopName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy via-navy to-teal-900 opacity-90 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-heading font-extrabold text-[15vw] text-white/5 uppercase tracking-tighter truncate w-full text-center">
                    {seller.shopName}
                 </span>
             </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent bottom-[-2px]"></div>
      </div>

      {/* Profile Section */}
      <div className="relative -mt-32 mx-auto max-w-5xl px-4 z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-border/50 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl flex-shrink-0 bg-cream flex items-center justify-center overflow-hidden -mt-20 md:mt-0">
             {seller.shopLogoUrl || seller.photoURL ? (
                <img src={seller.shopLogoUrl || seller.photoURL} className="w-full h-full object-cover" alt={seller.shopName} />
             ) : (
                <span className="text-5xl font-serif text-gold">{seller.shopName?.charAt(0)}</span>
             )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {seller.isVerifiedArtisan && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-3">
                <CheckCircle size={14} className="text-teal-600" /> Verified Artisan
              </span>
            )}
            
            <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">{seller.shopName}</h1>
            <p className="font-serif italic text-gold text-lg md:text-xl mt-2 max-w-2xl mx-auto md:mx-0">{seller.shopBio}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-cream px-3 py-1.5 rounded-lg border border-border/50">
                <MapPin size={16} className="text-gold" /> {seller.shopLocation || 'Multan, Pakistan'}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-cream px-3 py-1.5 rounded-lg border border-border/50">
                <Package size={16} className="text-gold" /> {products.length} listings
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-cream px-3 py-1.5 rounded-lg border border-border/50">
                <Star size={16} className="text-gold fill-gold" /> {seller.rating ? seller.rating.toFixed(1) : "New Here"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Link to={`/artisan/${seller.shopHandle || seller.uid}`} className="w-full">
              <Button className="w-full bg-gold hover:bg-gold-light text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-gold/20">
                 Visit Shop
              </Button>
            </Link>
            <Button variant="outline" className="w-full border-ink text-ink hover:bg-ink hover:text-white font-bold h-12 rounded-xl text-base transition-colors">
              Follow Story
            </Button>
          </div>
        </div>
      </div>

      {/* The Story Section */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4 block">
            {seller.craftType?.replace('_', ' ') || 'Master Craft'}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
                The Art of {seller.craftType === "blue_pottery" ? "Kashigari" : seller.craftType === "khussa" ? "Khussa Making" : "Crafting"}
                <br/><span className="text-muted-foreground italic text-3xl">in {seller.shopName}</span>
            </h2>
            <div className="w-20 h-0.5 bg-gold mx-auto mt-8 opacity-50" />
        </div>

        <div className="prose prose-lg md:prose-xl max-w-none prose-p:text-ink/80 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-ink space-y-8">
            <p className="font-serif text-2xl md:text-3xl italic text-ink leading-relaxed text-center mb-12 px-4 md:px-12">
            "{seller.storyText ? seller.storyText.split('\\n')[0] : seller.shopBio || 'Crafting stories in Multan.'}"
            </p>
            
            {seller.storyText && (
            <div className="space-y-6 pt-8 border-t border-border/50">
                {seller.storyText.split('\\n').map((paragraph, i) => {
                    if (i === 0 && paragraph.length < 100) return null; // Skip first short sentence if used as quote
                    if (!paragraph.trim()) return null;
                    return <p key={i} className="text-lg text-muted-foreground">{paragraph}</p>;
                })}
            </div>
            )}
            
            {!seller.storyText && (
               <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">We are still writing our story. Check back soon for more details about our heritage and craft.</p>
               </div>
            )}
        </div>

        <div className="mt-16 p-8 md:p-10 bg-white border border-border shadow-sm rounded-2xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gold"></div>
            <p className="font-serif italic text-xl md:text-2xl text-ink leading-relaxed">
            "{seller.shopName} has been crafting from {seller.shopLocation || 'the heart of Multan'}, 
            keeping centuries of Multani tradition alive for the modern world."
            </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-white py-24 border-t border-border/50">
         <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
                <h3 className="font-serif text-4xl text-ink mb-3">From the Workshop</h3>
                <p className="text-muted-foreground text-lg font-serif italic">Pieces crafted by {seller.shopName}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
            
            {products.length === 0 && (
                <div className="text-center py-16 bg-cream rounded-2xl border border-border/50">
                   <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                   <p className="text-muted-foreground text-lg">No pieces listed in the market yet.</p>
                </div>
            )}
            
            {products.length > 0 && (
                <div className="text-center mt-16">
                    <Link to={`/artisan/${seller.shopHandle || seller.uid}`}>
                        <Button variant="outline" className="border-ink text-ink hover:bg-ink hover:text-white font-bold px-10 py-6 rounded-full text-lg transition-colors shadow-sm">
                            Explore Full Collection <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            )}
         </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="bg-cream py-24 border-t border-black/5">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h3 className="font-serif text-4xl text-ink mb-3">What Patrons Say</h3>
                    <p className="text-muted-foreground text-lg font-serif italic">Appreciation for the craft.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-navy/5 flex items-center justify-center shrink-0">
                           {review.image ? <img src={review.image} className="w-full h-full object-cover" alt="Review" /> : <span className="text-navy font-bold">{review.reviewerName?.charAt(0)}</span>}
                        </div>
                        <div>
                        <p className="font-bold text-ink text-sm">{review.reviewerName}</p>
                        <div className="flex text-gold mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < review.rating ? "fill-gold text-gold" : "text-muted"} />
                            ))}
                        </div>
                        </div>
                    </div>
                    <p className="text-ink/80 text-base leading-relaxed italic font-serif">"{review.comment}"</p>
                    </div>
                ))}
                </div>
            </div>
        </section>
      )}
    </div>
  );
}
