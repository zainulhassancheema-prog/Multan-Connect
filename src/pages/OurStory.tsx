import { motion } from "motion/react";
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function OurStory() {
  return (
    <div className="min-h-screen bg-sand text-ink pt-24 pb-12">
      <AnimatedSection className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-heading mb-8 text-center text-primary">Our Story</h1>
        <div className="prose prose-lg mx-auto text-muted-foreground font-serif">
          <p className="mb-6">
            Multan, known as the City of Saints, is also a city of unparalleled craftsmanship. For over 400 years, artisans in this historic region have been perfecting their crafts, passing down techniques from generation to generation.
          </p>
          <p className="mb-6">
            Multan Connect was born out of a desire to bridge the gap between these incredibly talented, often marginalized artisans and a global audience that appreciates authentic, handmade art. We recognized that while the demand for the famous Multani Blue Pottery (Kashigari), exquisite embroidered fabrics, and handcrafted Khussa shoes was high, the original creators often remained hidden behind middlemen and commercial retailers.
          </p>
          <p className="mb-6">
            Our mission is simple: <strong>direct connection, fair trade, and cultural preservation.</strong>
          </p>
          <div className="my-12 flex justify-center">
             <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80" alt="Artisan shaping clay to create traditional Multani pottery" className="rounded-xl shadow-lg border border-border" />
          </div>
          <p className="mb-6">
            By creating this platform, we empower the ustads (master craftsmen) and the women who create intricate embroidery from their homes. Every purchase made on Multan Connect goes directly towards supporting these families, ensuring that the legacy of Multani crafts continues to thrive in the modern world.
          </p>
          <p>
            Join us in celebrating the rich heritage of Multan. Every piece you buy is not just an object; it's a piece of history, crafted with soul and precision.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
