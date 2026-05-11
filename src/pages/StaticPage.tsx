import { motion } from "motion/react";
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function StaticPage({ title }: { title: string }) {
  return (
    <div className="min-h-[70vh] bg-sand flex flex-col items-center justify-center pt-24 pb-12">
      <AnimatedSection className="text-center px-4">
        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gold/20">
          <img src="/Logo.jpeg" alt="Multan Connect logo" className="w-10 h-10 object-contain mix-blend-multiply" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading text-primary mb-4">{title}</h1>
        <p className="text-muted-foreground font-serif italic max-w-md mx-auto">
          This page is currently being thoughtfully prepared. Please check back soon for our official policies and information.
        </p>
      </AnimatedSection>
    </div>
  );
}
