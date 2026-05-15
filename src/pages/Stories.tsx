import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const MOCK_STORIES = [
  {
    uid: "ustad-raheem-blue-pottery",
    shopHandle: "ustad-raheem",
    shopName: "Ustad Raheem's Kashigari",
    craftType: "blue_pottery",
    shopBio: "We don't just paint clay. We breathe our history into it. Each brushstroke carries 400 years of Multani heritage.",
    storyText: "I learned this craft from my father, who learned it from his father before him. The blue we use is not just a color; it's the sky over Multan, caught and fired in our kilns.\n\nEvery piece of Kashi work starts with the earth of this land. We temper it, shape it, and let it rest. Then, my artisans and I paint the arabesque patterns freehand. There are no stencils. Just muscle memory and a connection to the masters who came before us.\n\nWhen you hold one of our vases, you are holding a piece of our family's soul, baked at 800 degrees.",
    shopLocation: "Hassan Parwana Road, Multan",
    shopLogoUrl: "https://images.unsplash.com/photo-1596484552993-9c704f05634c?q=80&w=200&auto=format&fit=crop",
    shopBannerUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop",
    rating: 5.0,
    isVerifiedArtisan: true
  },
  {
    uid: "fatima-khussa-house",
    shopHandle: "fatima-khussa",
    shopName: "Fatima's Heritage Khussas",
    craftType: "khussa",
    shopBio: "Hand-stitched leather khussas embroidered with the vibrant colors of South Punjab.",
    storyText: "My mother taught me the art of 'Tilla' embroidery when I was twelve. Back then, it was just for our family's weddings. But as I grew older, I saw how mass-produced shoes were replacing our traditional footwear.\n\nI started this workshop with three other women from my neighborhood. We use only pure camel and cow leather, curing it naturally. The embroidery takes days for a single pair. We weave gold and silver threads, creating patterns inspired by the shrines of Multan.\n\nEvery pair of Khussas we make is a testament to the resilience and artistry of Multani women.",
    shopLocation: "Hussain Agahi, Multan",
    shopLogoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    shopBannerUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2000&auto=format&fit=crop",
    rating: 4.8,
    isVerifiedArtisan: true
  },
  {
    uid: "ali-camel-skin",
    shopHandle: "ali-camel-skin",
    shopName: "Ali's Camel Skin Crafts",
    craftType: "other",
    shopBio: "The fading art of camel skin crafting, preserved for the next generation.",
    storyText: "Crafting camel skin lamps is a dying art. There are only a handful of families left in Multan who know the secret to making the skin translucent and painting the intricate Naqashi designs on it.\n\nThe process is arduous. The skin is washed, cleaned, and stretched over clay molds. Once it dries and hardens, the clay mold is shattered from the inside. What remains is a hollow, delicate shell. Then, I paint it with the traditional floral motifs.\n\nWhen you light one of our lamps, the warm glow is a light from the past, illuminating the present.",
    shopLocation: "Old City, Multan",
    shopLogoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    shopBannerUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop",
    rating: 4.9,
    isVerifiedArtisan: false
  }
] as any[];

export default function Stories() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Stories from the Craft | Multan Connect";
    
    // Add open graph tags manually if desired or in index.html
  }, []);

  useEffect(() => {
    // Simulate fetching stories
    setTimeout(() => {
      setArtisans(MOCK_STORIES);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] lg:h-screen min-h-[500px] flex flex-col justify-center items-center text-center overflow-hidden bg-navy">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 to-navy z-10"></div>
        
        <motion.img
          src="/images/hero-vase.png"
          alt=""
          aria-hidden="true"
          animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-8 top-1/4 w-32 h-auto opacity-5
                     pointer-events-none hidden lg:block z-10"
        />

        <div className="relative z-20 px-4 mt-16 max-w-4xl">
          <h1 className="font-serif italic text-white text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight drop-shadow-lg">
            Stories from the Craft
          </h1>
          <p className="font-serif text-gold text-2xl md:text-3xl mb-8">
            400 years of heritage. Carried in their hands.
          </p>
          <div className="w-24 h-[2px] bg-gold mx-auto mb-16 shadow-[0_0_15px_rgba(201,151,58,0.5)]"></div>
          
          <div className="animate-bounce inline-flex items-center justify-center p-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
               <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Stories Grid Section */}
      <section className="py-24 container mx-auto px-4 max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[320px]">
             {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className={`rounded-2xl ${i % 3 === 0 ? 'md:col-span-2 h-[500px]' : 'h-[320px]'}`} />
             ))}
          </div>
        ) : artisans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-max">
            {artisans.map((artisan, index) => {
              const isHero = index % 3 === 0;
              const heightClass = isHero ? "h-[500px]" : "h-[320px]";
              const colClass = isHero ? "md:col-span-2" : "md:col-span-1";
              
              // Gradient backgrounds for fallback
              const gradients = [
                  "from-[#1A237E]/90 to-[#0D47A1]/80",
                  "from-[#004D40]/90 to-[#00695C]/80",
                  "from-[#3E2723]/90 to-[#4E342E]/80",
                  "from-[#b38a42]/90 to-[#c89849]/80"
              ];
              const fallbackGradient = gradients[index % gradients.length];
              
              const imageUrl = artisan.shopBannerUrl || artisan.shopLogoUrl || artisan.photoURL;

              return (
                <div key={artisan.uid} className={`${colClass} ${heightClass}`}>
                  <Link to={`/stories/${artisan.shopHandle || artisan.uid}`} className="block relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer shadow-lg mb-0 bg-navy">
                    
                    {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt={`${artisan.shopName} — ${artisan.craftType?.replace('_', ' ') || 'artisan'} from ${artisan.shopLocation || 'Multan'}`}
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex justify-center items-center opacity-80 group-hover:scale-105 transition-transform duration-700`}>
                            <span className="font-heading font-extrabold text-6xl text-white/10 uppercase tracking-tighter truncate w-full text-center px-4">
                                {artisan.shopName}
                            </span>
                        </div>
                    )}
                    
                    {/* Dark gradient overlay bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent pointer-events-none" />
                    
                    {/* Content bottom-left */}
                    <div className={`absolute bottom-0 left-0 ${isHero ? 'p-10 md:p-12' : 'p-6 md:p-8'} w-full max-w-3xl`}>
                      <span className="text-gold text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
                        {artisan.craftType?.replace('_', ' ') || 'Master Artisan'}
                      </span>
                      <h2 className={`font-serif text-white mt-2 leading-tight ${isHero ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl'}`}>
                         {artisan.shopName}
                      </h2>
                      <p className={`text-white/70 mt-3 line-clamp-2 ${isHero ? 'text-base md:text-lg max-w-2xl' : 'text-sm'}`}>
                         {artisan.shopBio || artisan.storyText || `Master of ${artisan.craftType?.replace('_', ' ') || 'Multani craft'}`}
                      </p>
                      <div className="flex items-center gap-3 mt-6">
                        {artisan.shopLogoUrl || artisan.photoURL ? (
                            <img src={artisan.shopLogoUrl || artisan.photoURL} 
                                className={`rounded-full border-2 border-gold/70 object-cover ${isHero ? 'w-12 h-12' : 'w-8 h-8'}`} 
                                alt={`Shop logo for ${artisan.shopName}`} />
                        ) : (
                            <div className={`rounded-full border-2 border-gold/70 bg-navy flex items-center justify-center ${isHero ? 'w-12 h-12' : 'w-8 h-8'}`}>
                                <span className="text-white font-bold text-xs">{artisan.shopName?.charAt(0)}</span>
                            </div>
                        )}
                        <span className={`text-white/80 font-medium tracking-wide ${isHero ? 'text-sm' : 'text-xs'}`}>
                            {artisan.shopLocation || artisan.workshopLocation || 'Multan, Pakistan'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Read story arrow */}
                    <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream/10 backdrop-blur-md flex items-center justify-center group-hover:bg-gold transition-colors duration-500 shadow-xl border border-white/10">
                      <ArrowRight size={20} className="text-white" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-border/50 shadow-sm">
            <div className="w-24 h-24 mx-auto bg-navy/5 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🏺</span>
            </div>
            <p className="font-serif text-3xl md:text-4xl text-ink mb-4">Stories coming soon</p>
            <p className="text-muted-foreground text-lg">Our artisans are getting ready to share their craft.</p>
          </div>
        )}
      </section>
    </div>
  );
}
