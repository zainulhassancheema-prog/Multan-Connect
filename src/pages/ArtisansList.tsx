import { motion } from "motion/react";
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Link } from 'react-router-dom';

const ARTISANS = [
  {
    id: "1",
    name: "Ustad Raheem",
    craft: "Blue Pottery (Kashigari)",
    experience: "45 Years",
    image: "https://images.unsplash.com/photo-1533227268428-f9ed0900f953?auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    name: "Zainab Bibi",
    craft: "Multani Embroidery",
    experience: "30 Years",
    image: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80"
  },
  {
    id: "3",
    name: "Ahmad Din",
    craft: "Khussa Making",
    experience: "25 Years",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80"
  }
];

export default function ArtisansList() {
  return (
    <div className="min-h-screen bg-cream text-ink pt-24 pb-12">
      <AnimatedSection className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-heading mb-4 text-center text-primary">Meet the Artisans</h1>
        <p className="text-center font-serif text-muted-foreground mb-16 max-w-2xl mx-auto">
          The brilliant hands behind the masterpieces. Discover the stories, the heritage, and the passion of Multan's master craftsmen.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTISANS.map((artisan) => (
            <Link key={artisan.id} to={`/artisan/${artisan.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-black/5">
              <div className="aspect-square overflow-hidden relative">
                <img src={artisan.image} alt={`${artisan.name} — Multan Connect artisan`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-medium hover-underline">View Profile</span>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-heading text-primary mb-1">{artisan.name}</h3>
                <p className="text-sm font-sans tracking-widest text-gold uppercase mb-2">{artisan.craft}</p>
                <p className="text-sm font-serif italic text-muted-foreground">{artisan.experience} of experience</p>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
